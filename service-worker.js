const CACHE_NAME = "movilidad-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./app-icon.png"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (YouTube, etc.) pass through normally

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request).then(function (networkResp) {
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, networkResp.clone()); });
        return networkResp;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
