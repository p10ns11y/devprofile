"use client";

import { useEffect } from 'react';

export function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker updated');
          window.location.reload();
        });
      });
    }
  }, []);

  return null;
}
