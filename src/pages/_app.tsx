"use client";

import { useEffect } from 'react';
import type { AppProps } from 'next/app'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
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

  return <Component {...pageProps} />
}

export default MyApp
