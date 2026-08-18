/**
 * TiConta v2 — Modular Service Worker
 * Suporta cache seletivo por módulo (POS, Fiado, etc.) com offline-first via Workbox
 */

if (!self.define) {
  let e, s = {};
  const a = (a, i) => (
    a = new URL(a + ".js", i).href,
    s[a] || new Promise((res) => {
      if ("document" in self) {
        const e = document.createElement("script");
        e.src = a;
        e.onload = res;
        document.head.appendChild(e);
      } else {
        e = a;
        importScripts(a);
        res();
      }
    }).then(() => {
      let e = s[a];
      if (!e) throw new Error(`Module ${a} didn't register its module`);
      return e;
    })
  );
  self.define = (i, n) => {
    const t = e || ("document" in self ? document.currentScript.src : "") || location.href;
    if (s[t]) return;
    let c = {};
    const o = (e) => a(e, t),
      r = { module: { uri: t }, exports: c, require: o };
    s[t] = Promise.all(i.map((e) => r[e] || o(e))).then((e) => (n(...e), c));
  };
}

define(["./workbox-4754cb34"], function (workbox) {
  "use strict";

  self.skipWaiting();
  workbox.clientsClaim();

  // 1. Core Precaching for PWA Shell
  workbox.precacheAndRoute([
    { url: "/manifest.json", revision: "v2-core" },
    { url: "/pos/manifest.json", revision: "v2-pos" },
    { url: "/informal/manifest.json", revision: "v2-informal" },
    { url: "/icon-192x192.png", revision: "v2-icon" },
    { url: "/icon-512x512.png", revision: "v2-icon-512" },
    { url: "/logo-ticonta.png", revision: "v2-logo" },
    { url: "/icon.png", revision: "v2-icon-base" }
  ], { ignoreURLParametersMatching: [/.*/] });

  workbox.cleanupOutdatedCaches();

  // ==========================================================================
  // 2. Cache Seletivo por Módulo: TiConta POS (/pos/* e APIs de POS)
  // ==========================================================================
  workbox.registerRoute(
    ({ url }) => url.pathname.startsWith("/pos"),
    new workbox.NetworkFirst({
      cacheName: "ticonta-pos-runtime",
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias offline para POS
        }),
      ],
    }),
    "GET"
  );

  workbox.registerRoute(
    ({ url }) => url.pathname.startsWith("/api/v1/products") || url.pathname.startsWith("/api/v1/sales"),
    new workbox.NetworkFirst({
      cacheName: "ticonta-pos-api-cache",
      networkTimeoutSeconds: 4,
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    }),
    "GET"
  );

  // ==========================================================================
  // 3. Cache Seletivo por Módulo: Caderno de Fiado (/informal-sales/*)
  // ==========================================================================
  workbox.registerRoute(
    ({ url }) => url.pathname.startsWith("/informal-sales"),
    new workbox.NetworkFirst({
      cacheName: "ticonta-informal-runtime",
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    }),
    "GET"
  );

  workbox.registerRoute(
    ({ url }) => url.pathname.startsWith("/api/v1/informal-sales"),
    new workbox.NetworkFirst({
      cacheName: "ticonta-informal-api-cache",
      networkTimeoutSeconds: 4,
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    }),
    "GET"
  );

  // ==========================================================================
  // 4. Cache para Assets Estáticos (Imagens, Fontes, CSS, JS)
  // ==========================================================================
  workbox.registerRoute(
    /\.(?:png|jpg|jpeg|svg|webp|ico)$/i,
    new workbox.StaleWhileRevalidate({
      cacheName: "ticonta-images",
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
      ],
    }),
    "GET"
  );

  workbox.registerRoute(
    /\.(?:woff|woff2|eot|ttf|otf)$/i,
    new workbox.CacheFirst({
      cacheName: "ticonta-fonts",
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 16,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        }),
      ],
    }),
    "GET"
  );

  workbox.registerRoute(
    /\/_next\/static\/.+\.(?:js|css)$/i,
    new workbox.StaleWhileRevalidate({
      cacheName: "ticonta-next-static",
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 128,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    }),
    "GET"
  );

  // ==========================================================================
  // 5. Rotas Gerais com Fallback
  // ==========================================================================
  workbox.registerRoute(
    ({ url }) => url.pathname === "/" || url.pathname.startsWith("/dashboard"),
    new workbox.NetworkFirst({
      cacheName: "ticonta-core-runtime",
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    }),
    "GET"
  );

  // Message Handler for dynamic module precache
  self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "ROUTE_ACTIVE") {
      const activePath = event.data.pathname;
      if (activePath.startsWith("/pos")) {
        caches.open("ticonta-pos-runtime").then((cache) => {
          cache.add("/pos").catch(() => {});
        });
      } else if (activePath.startsWith("/informal-sales")) {
        caches.open("ticonta-informal-runtime").then((cache) => {
          cache.add("/informal-sales").catch(() => {});
        });
      }
    }
  });
});
