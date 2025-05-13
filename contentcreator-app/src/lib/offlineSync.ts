/**
 * Offline Synchronization Utility
 * Handles service worker registration and offline data synchronization
 */

// Check if the browser supports service workers
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Register the service worker
export const registerServiceWorker = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    console.warn('Service workers are not supported in this browser. Offline mode will not be available.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered with scope:', registration.scope);
    
    // Set up the sync manager if available
    if ('sync' in registration) {
      console.log('Background Sync is supported');
    } else {
      console.warn('Background Sync is not supported in this browser. Offline changes will sync on page reload.');
    }
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Check if the user is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Trigger sync when the user comes back online
export const triggerSync = async (): Promise<void> => {
  if (!isServiceWorkerSupported()) {
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await registration.sync.register('sync-pending-requests');
      console.log('Sync registered for pending requests');
    } else {
      // Fallback for browsers that don't support Background Sync
      console.log('Background Sync not supported, manually syncing...');
      // Send a message to the service worker to sync manually
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'MANUAL_SYNC'
        });
      }
    }
  } catch (error) {
    console.error('Failed to register sync:', error);
  }
};

// Store data in IndexedDB for offline use
export const storeOfflineData = async (
  storeName: string,
  data: any,
  key?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('content-creator-offline', 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assets')) {
        db.createObjectStore('assets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('calendar')) {
        db.createObjectStore('calendar', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let storeRequest;
      if (key) {
        // For user preferences or other non-id data
        storeRequest = store.put({ key, data });
      } else {
        // For regular data objects with their own IDs
        storeRequest = store.put(data);
      }
      
      storeRequest.onsuccess = () => resolve();
      storeRequest.onerror = (error) => reject(error);
    };
    
    request.onerror = (error) => reject(error);
  });
};

// Retrieve data from IndexedDB
export const getOfflineData = async (
  storeName: string,
  id?: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('content-creator-offline', 1);
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      let storeRequest;
      if (id) {
        // Get specific item
        storeRequest = store.get(id);
      } else {
        // Get all items
        storeRequest = store.getAll();
      }
      
      storeRequest.onsuccess = () => resolve(storeRequest.result);
      storeRequest.onerror = (error) => reject(error);
    };
    
    request.onerror = (error) => reject(error);
  });
};

// Create a wrapper for fetch that handles offline mode
export const offlineFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // If online, use regular fetch
  if (isOnline()) {
    try {
      const response = await fetch(url, options);
      
      // If it's a GET request, store the response in IndexedDB for offline use
      if (options.method === 'GET' || !options.method) {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        
        // Determine the store name based on the URL
        let storeName = 'misc';
        if (url.includes('/projects')) storeName = 'projects';
        else if (url.includes('/tasks')) storeName = 'tasks';
        else if (url.includes('/assets')) storeName = 'assets';
        else if (url.includes('/calendar')) storeName = 'calendar';
        else if (url.includes('/user')) storeName = 'user';
        
        // Store the data
        if (Array.isArray(data)) {
          // If it's an array, store each item individually
          data.forEach(item => storeOfflineData(storeName, item));
        } else {
          // Otherwise store the whole object
          storeOfflineData(storeName, data);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Network request failed:', error);
      // Fall through to offline handling
    }
  }
  
  // If offline or the fetch failed, try to get from IndexedDB
  console.log('Offline mode: using cached data');
  
  // Determine the store name and ID based on the URL
  let storeName = 'misc';
  let id = null;
  
  // Extract the store name and ID from the URL
  // Example: /api/projects/123 -> storeName = 'projects', id = '123'
  const urlParts = url.split('/').filter(Boolean);
  const apiIndex = urlParts.indexOf('api');
  
  if (apiIndex !== -1 && urlParts.length > apiIndex + 1) {
    storeName = urlParts[apiIndex + 1];
    if (urlParts.length > apiIndex + 2) {
      id = urlParts[apiIndex + 2];
    }
  }
  
  try {
    let data;
    if (id) {
      // Get specific item
      data = await getOfflineData(storeName, id);
    } else {
      // Get all items
      data = await getOfflineData(storeName);
    }
    
    // Create a mock response
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to get offline data:', error);
    
    // Return an error response
    return new Response(JSON.stringify({
      error: 'Failed to retrieve data in offline mode'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
