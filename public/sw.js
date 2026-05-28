const CACHE = "ecomeal-v1";
const APP_SHELL = [
  "/",
  "/src/main.jsx",
  "/src/App.jsx",
  "/src/index.css",
  "/src/App.css",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only cache same-origin GET requests; bypass AI/API calls so they stay live.
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("/api/")) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      });
      // Serve cache immediately; update cache in background (stale-while-revalidate).
      return cached || network;
    })
  );
});

// Background sync: flush pending mutations when connectivity returns.
self.addEventListener("sync", (e) => {
  if (e.tag === "ecomeal-sync") {
    // The app handles drain logic itself via BroadcastChannel + online event.
    // This event just notifies the app that connectivity is restored.
    e.waitUntil(
      self.clients.matchAll().then((clients) =>
        clients.forEach((c) => c.postMessage({ type: "SW_SYNC_READY" }))
      )
    );
  }
});
