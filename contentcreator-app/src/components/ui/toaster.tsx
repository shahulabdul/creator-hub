'use client';

import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Custom event listener for adding toasts
  useEffect(() => {
    const addToast = (event: CustomEvent<{ message: string; type: ToastType }>) => {
      const { message, type } = event.detail;
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    };

    // Add event listener
    window.addEventListener('toast' as any, addToast as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('toast' as any, addToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md px-4 py-3 shadow-lg transition-all duration-300 ease-in-out ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <p>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to show toasts from anywhere in the app
export const showToast = (message: string, type: ToastType = 'info') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('toast', {
        detail: { message, type },
      })
    );
  }
};
