const CACHE_NAME = 'fattariellows-v2'; // Cambiato in v2 per forzare l'aggiornamento
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json', // Aggiunto il manifest per l'uso offline
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installazione: salva i file nella cache
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza il nuovo Service Worker a prendere subito il controllo
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

// Attivazione: elimina le vecchie cache quando cambi la versione (es. da v1 a v2)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminazione vecchia cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch: intercetta le richieste di rete
self.addEventListener('fetch', (event) => {
  // Ignora le richieste API esterne (come il proxy per estrarre l'articolo)
  // Questo assicura che il proxy faccia sempre una nuova chiamata al server
  if (event.request.url.includes('api.allorigins.win')) {
    return; // Lascia che il browser faccia la richiesta di rete normalmente
  }

  // Strategia Cache-First per tutti gli altri asset
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});