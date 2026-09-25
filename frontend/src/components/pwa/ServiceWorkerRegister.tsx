'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[TiConta:PWA] Service Worker registado com sucesso. Scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[TiConta:PWA] Falha ao registar Service Worker:', err);
          });
      });
    }
  }, []);

  return null;
}
