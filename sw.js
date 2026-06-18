/* ══════════════════════════════════════════════════════════════════
   DARTS APP — Service Worker
   Version : V20260611 18H30
══════════════════════════════════════════════════════════════════ */

var APP_VERSION = "V20260618 11H10";
var CACHE_NAME  = "darts-cache-" + APP_VERSION;

/* Ressources à mettre en cache au premier démarrage */
var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon.svg",
  "./assets/apple-touch-icon.png",
  "./storage.js",
  "./scoring.js",
  "./ui.js",
  "./game01.js",
  "./game-cricket.js",
  "./game-around.js",
  "./app.js",
  "./vendor/react.production.min.js",
  "./vendor/react-dom.production.min.js"
];

/* ── Installation : pré-cache ── */
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener("message", function(event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ── Activation : suppression des anciens caches ── */
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim(); // Prend le contrôle immédiatement
    })
  );
});

/* ── Fetch : Cache-first, fallback réseau ── */
self.addEventListener("fetch", function(event) {
  /* On ignore les requêtes non-GET (ex. analytics, POST) */
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;

      /* Pas en cache → réseau, puis on stocke */
      return fetch(event.request).then(function(response) {
        /* Ne pas mettre en cache les réponses invalides */
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }
        var toCache = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(function() {
        /* Hors ligne et pas en cache : page de fallback minimale */
        return new Response(
          "<html><body style='font-family:sans-serif;text-align:center;padding:60px;background:#0d0f1a;color:#f0f2ff'>" +
          "<h1>🎯 Darts</h1><p>Vous êtes hors ligne.</p>" +
          "<p>Veuillez ouvrir l'application une première fois avec une connexion.</p></body></html>",
          { headers: { "Content-Type": "text/html" } }
        );
      });
    })
  );
});
