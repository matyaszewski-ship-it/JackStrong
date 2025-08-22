const CACHE = 'jack-strong-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.png'
];

// Instalacja: keszujemy „szkielet” aplikacji
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktywacja: czyścimy stare cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Obsługa żądań: najpierw cache, potem sieć; nawigacje => index.html
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // SPA fallback dla nawigacji (przy braku sieci)
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((res) => res || fetch(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((res) => {
      if (res) return res;
      return fetch(req).then((netRes) => {
        const copy = netRes.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return netRes;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
