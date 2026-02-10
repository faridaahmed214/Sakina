const CACHE_NAME = "sakina-dynamic-v1";
const files = [
  "./",
  "./index.html",
  "./css/style.css",
  "./css/style2.css",
  "./js/app.js",
  "./js/data.js",
  "./assets/logo.png",
  "./assets/icon192.png",
  "./assets/icon512.png",
  "./offline.html",
  "./404.html",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(files)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);

        if (response.status === 404) {
          return caches.match("./404.html");
        }

        const responseClone = response.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, responseClone);

        return response;
      } catch (error) {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("./offline.html");
        }

        return new Response("Offline", {
          status: 404,
          statusText: "Not Found",
        });
      }
    })(),
  );
});
