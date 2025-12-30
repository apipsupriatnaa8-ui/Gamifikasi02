/* PelangiBelajar service worker (cache offline) */
const CACHE = "pelangibelajar-static-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./assets/css/styles.css",
  "./assets/js/app.js",
  "./manifest.json",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
];

self.addEventListener("install", (event)=>{
  event.waitUntil(
    caches.open(CACHE).then((cache)=> cache.addAll(ASSETS)).then(()=> self.skipWaiting())
  );
});

self.addEventListener("activate", (event)=>{
  event.waitUntil(
    caches.keys().then(keys=> Promise.all(keys.map(k=> k!==CACHE ? caches.delete(k):null)))
      .then(()=> self.clients.claim())
  );
});

self.addEventListener("fetch", (event)=>{
  const req = event.request;
  // For API calls, try network first
  if(req.url.includes("/api/")){
    event.respondWith(
      fetch(req).catch(()=> caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached)=> cached || fetch(req).then((res)=>{
      const copy = res.clone();
      caches.open(CACHE).then(cache=> cache.put(req, copy));
      return res;
    }).catch(()=> cached))
  );
});
