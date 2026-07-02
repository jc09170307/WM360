const CACHE = 'wm360-v1';
const ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).hostname === 'api.anthropic.com') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status===200 && e.request.method==='GET')
          caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
        return res;
      }).catch(()=>{ if(e.request.mode==='navigate') return caches.match('./index.html'); });
    })
  );
});