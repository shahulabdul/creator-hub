import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  isServiceWorkerSupported, 
  registerServiceWorker, 
  isOnline, 
  setupConnectivityListeners, 
  triggerSync,
  offlineFetch
} from '@/lib/offlineSync';

// Define the context type
interface OfflineContextType {
  online: boolean;
  offlineMode: boolean;
  pendingSyncCount: number;
  enableOfflineMode: () => void;
  disableOfflineMode: () => void;
  syncNow: () => Promise<void>;
  offlineFetch: typeof offlineFetch;
}

// Create the context with default values
const OfflineContext = createContext<OfflineContextType>({
  online: true,
  offlineMode: false,
  pendingSyncCount: 0,
  enableOfflineMode: () => {},
  disableOfflineMode: () => {},
  syncNow: async () => {},
  offlineFetch
});

// Provider props
interface OfflineProviderProps {
  children: ReactNode;
}

// Provider component
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [serviceWorkerReady, setServiceWorkerReady] = useState<boolean>(false);

  // Register service worker on mount
  useEffect(() => {
    const initServiceWorker = async () => {
      if (isServiceWorkerSupported()) {
        await registerServiceWorker();
        setServiceWorkerReady(true);
        
        // Check for pending sync requests
        checkPendingSyncCount();
      }
    };
    
    initServiceWorker();
  }, []);

  // Set up online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      if (serviceWorkerReady) {
        triggerSync();
        checkPendingSyncCount();
      }
    };
    
    const handleOffline = () => {
      setOnline(false);
    };
    
    const cleanup = setupConnectivityListeners(handleOnline, handleOffline);
    
    return cleanup;
  }, [serviceWorkerReady]);

  // Check for pending sync requests in IndexedDB
  const checkPendingSyncCount = async () => {
    try {
      const dbRequest = indexedDB.open('offline-requests', 1);
      
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('requests', 'readonly');
        const store = transaction.objectStore('requests');
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          setPendingSyncCount(countRequest.result);
        };
      };
    } catch (error) {
      console.error('Failed to check pending sync count:', error);
    }
  };

  // Enable offline mode
  const enableOfflineMode = () => {
    setOfflineMode(true);
    localStorage.setItem('offlineMode', 'enabled');
  };

  // Disable offline mode
  const disableOfflineMode = () => {
    setOfflineMode(false);
    localStorage.setItem('offlineMode', 'disabled');
  };

  // Manually trigger sync
  const syncNow = async () => {
    if (online && serviceWorkerReady) {
      await triggerSync();
      checkPendingSyncCount();
    }
  };

  // Load offline mode preference from localStorage on mount
  useEffect(() => {
    const savedOfflineMode = localStorage.getItem('offlineMode');
    if (savedOfflineMode === 'enabled') {
      setOfflineMode(true);
    }
  }, []);

  // Listen for messages from the service worker
  useEffect(() => {
    if (!isServiceWorkerSupported()) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETED') {
        checkPendingSyncCount();
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Context value
  const value: OfflineContextType = {
    online,
    offlineMode,
    pendingSyncCount,
    enableOfflineMode,
    disableOfflineMode,
    syncNow,
    offlineFetch
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

// Custom hook to use the offline context
export const useOffline = () => useContext(OfflineContext);
