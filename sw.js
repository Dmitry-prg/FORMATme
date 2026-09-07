/* FORMATme service worker (поставка delivery) — офлайн-режим для статического сайта. */
var CACHE = "formatme-delivery-v1";
var PRECACHE_URLS = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

function resolveUrl(path) {
  return new URL(path, self.registration.scope).href;
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(function (cache) {
        return Promise.all(
          PRECACHE_URLS.map(function (path) {
            return cache.add(new Request(resolveUrl(path))).catch(function () {
              /* не ломаем установку из-за одного недоступного файла */
            });
          })
        );
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key !== CACHE;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request)
        .then(function (response) {
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            var copy = response.clone();
            caches.open(CACHE).then(function (cache) {
              return cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          if (request.mode === "navigate") {
            return caches.match("index.html");
          }
          return Response.error();
        });
    })
  );
});
