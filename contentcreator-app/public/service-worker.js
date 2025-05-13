// Service Worker for Content Creator Workflow App
const CACHE_NAME = 'content-creator-cache-v1';
const OFFLINE_URL = '/offline';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
  '/',
  '/offline',
  '/dashboard',
  '/projects',
  '/tasks',
  '/calendar',
  '/assets',
  '/api/auth/signin',
  '/favicon.ico',
  '/logo.png'
];

// Install event - precache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching resources');
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  // Handle API requests differently (for offline sync)
  if (event.request.url.includes('/api/')) {
    handleApiRequest(event);
    return;
  }
  
  // For navigation requests, use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then((response) => {
            // Don't cache responses with status !== 200
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Return nothing for other requests
            return;
          });
      })
  );
});

// Handle API requests with offline support
function handleApiRequest(event) {
  // For GET requests, try network first, then cache
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the successful response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to return from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For non-GET requests (POST, PUT, DELETE), queue them if offline
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, store the request in IndexedDB for later sync
          return saveRequestForSync(event.request)
            .then(() => {
              // Return a custom response to indicate the request was queued
              return new Response(JSON.stringify({
                success: false,
                offline: true,
                message: 'You are offline. This request has been queued for sync when you reconnect.'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
  }
}

// Save request for later sync
async function saveRequestForSync(request) {
  // Clone the request to read its body
  const requestClone = request.clone();
  const body = await requestClone.text();
  
  // Create a serializable request object
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: body,
    timestamp: Date.now()
  };
  
  // Open IndexedDB
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('offline-requests', 1);
    
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('requests', 'readwrite');
      const store = transaction.objectStore('requests');
      
      const storeRequest = store.add(requestData);
      
      storeRequest.onsuccess = () => {
        console.log('[Service Worker] Request saved for later sync');
        resolve();
      };
      
      storeRequest.onerror = (error) => {
        console.error('[Service Worker] Error saving request', error);
        reject(error);
      };
    };
    
    dbRequest.onerror = (error) => {
      console.error('[Service Worker] Error opening IndexedDB', error);
      reject(error);
    };
  });
}

// Listen for sync event to process queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(syncPendingRequests());
  }
});

// Process all pending requests
async function syncPendingRequests() {
  console.log('[Service Worker] Syncing pending requests');
  
  // Get all pending requests from IndexedDB
  const requests = await getPendingRequests();
  
  // Process each request
  const syncPromises = requests.map(async (requestData) => {
    try {
      // Recreate the request
      const request = new Request(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
        credentials: 'include'
      });
      
      // Send the request
      const response = await fetch(request);
      
      if (response.ok) {
        // If successful, remove from queue
        await removeRequestFromQueue(requestData.id);
        console.log('[Service Worker] Successfully synced request', requestData.url);
        return true;
      } else {
        console.error('[Service Worker] Failed to sync request', requestData.url, response.status);
        return false;
      }
    } catch (error) {
      console.error('[Service Worker] Error syncing request', requestData.url, error);
      return false;
    }
  });
  
  // Wait for all sync attempts to complete
  return Promise.all(syncPromises);
}

// Get all pending requests from IndexedDB
function getPendingRequests() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('offline-requests', 1);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('requests', 'readonly');
      const store = transaction.objectStore('requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = (error) => {
        reject(error);
      };
    };
    
    dbRequest.onerror = (error) => {
      reject(error);
    };
  });
}

// Remove a request from the queue
function removeRequestFromQueue(id) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('offline-requests', 1);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('requests', 'readwrite');
      const store = transaction.objectStore('requests');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = (error) => {
        reject(error);
      };
    };
    
    dbRequest.onerror = (error) => {
      reject(error);
    };
  });
}
