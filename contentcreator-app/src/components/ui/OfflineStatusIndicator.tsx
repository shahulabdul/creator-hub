import React from 'react';
import { useOffline } from '@/components/OfflineProvider';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';

const OfflineStatusIndicator: React.FC = () => {
  const { online, offlineMode, pendingSyncCount, enableOfflineMode, disableOfflineMode, syncNow } = useOffline();

  const handleSyncClick = async () => {
    await syncNow();
  };

  const handleOfflineModeToggle = () => {
    if (offlineMode) {
      disableOfflineMode();
    } else {
      enableOfflineMode();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-3">
        {/* Connection status indicator */}
        <div className="flex items-center">
          {online ? (
            <Wifi size={18} className="text-green-500" />
          ) : (
            <WifiOff size={18} className="text-red-500" />
          )}
          <span className="ml-2 text-sm font-medium">
            {online ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Offline mode toggle */}
        <div className="flex items-center">
          <button
            onClick={handleOfflineModeToggle}
            className={`relative inline-flex h-5 w-10 items-center rounded-full ${
              offlineMode ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-pressed={offlineMode}
          >
            <span className="sr-only">
              {offlineMode ? 'Disable offline mode' : 'Enable offline mode'}
            </span>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                offlineMode ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-2 text-sm font-medium">
            Offline Mode
          </span>
        </div>

        {/* Pending sync count and sync button */}
        {pendingSyncCount > 0 && (
          <>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">
                {pendingSyncCount} pending {pendingSyncCount === 1 ? 'change' : 'changes'}
              </span>
              <button
                onClick={handleSyncClick}
                disabled={!online}
                className={`p-1.5 rounded-full ${
                  online
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title={online ? 'Sync now' : 'Cannot sync while offline'}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </>
        )}

        {/* All synced indicator */}
        {online && pendingSyncCount === 0 && (
          <>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center text-green-600">
              <Check size={16} />
              <span className="ml-1 text-sm font-medium">All synced</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineStatusIndicator;
