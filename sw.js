/* PatoCOPAR offline copy. build.py --web fills in patocopar-1.6-e0b3419d24 (the version plus a short fingerprint of the app), so a new app file means a new cache.
   This file only touches Cache Storage. It never reads or changes localStorage or IndexedDB, so saved answers are never affected. */
const PREFIX = "patocopar-";
const CACHE = "patocopar-1.6-e0b3419d24";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  /* no skipWaiting here: the page shows "New version ready" and the student taps Update */
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return; /* fonts and other sites go straight to the network */
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(r).catch(() => (r.mode === "navigate" ? caches.match("./index.html") : Response.error()));
    })
  );
});
