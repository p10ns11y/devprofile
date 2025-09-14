"use client";

import { useEffect } from 'react';

export function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered:', registration);

        if (registration.waiting) {
          console.log('Service Worker is waiting, posted message to skip waiting');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed, reloading page');
          window.location.reload();
        });

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('SW state changed:', newWorker.state);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New SW installed, can update');
              }
            });
          }
        });
      }).catch((error) => {
        console.error('SW registration failed:', error);
      });
    }
  }, []);

  return null;
}

// Export a function to manually clear cache
export const clearCache = () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
};
