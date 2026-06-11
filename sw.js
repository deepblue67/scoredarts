/* ══════════════════════════════════════════════════════════════════
   DARTS APP — Service Worker
   Version : V20260611 18H30
══════════════════════════════════════════════════════════════════ */

var APP_VERSION = "V20260611 18H30";
var CACHE_NAME  = "darts-cache-" + APP_VERSION;

/* Ressources à mettre en cache au premier démarrage */
var PRECACHE_URLS = [
  "./",
  "./index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"
];

/* ── Installation : pré-cache ── */
self.addEventListener("install", function(event) {
  self.skipWaiting(); // Activation immédiate sans attendre l'onglet fermé
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
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
