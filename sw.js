const CACHE = 'jack-strong-v1';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./logo.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){ e.respondWith(caches.match('./index.html').then(r=>r||fetch(req))); return; }
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(n=>{const c=n.clone(); caches.open(CACHE).then(cache=>cache.put(req,c)); return n;}).catch(()=>caches.match('./index.html'))));
});
