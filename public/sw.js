/* Nexora SW — offline shell + cache-first + notification clicks + push */
const VERSION = "nexora-v3";
const STATIC_CACHE = `${VERSION}-static`;

const PRECACHE_URLS = ["/", "/inicio", "/proyectos", "/equipo", "/calendario", "/reportes", "/ajustes"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Solo GET en mismo origen.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cachear endpoints de Supabase ni rutas de API.
  if (url.pathname.startsWith("/api/")) return;

  // Navegaciones HTML: network-first con fallback al cache (modo avión).
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(STATIC_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/")) ||
            new Response("Sin conexión", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })(),
    );
    return;
  }

  // Estáticos del propio site: cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
  }
});

/* ===========================================================================
 * Push event: llega del servidor cuando alguien manda mensaje y la app está
 * cerrada. Si hay una pestaña abierta y visible, no molestamos (la in-app la
 * maneja). Si no, mostramos la notificación del SO.
 * ========================================================================= */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  event.waitUntil(
    (async () => {
      let payload = {};
      try {
        payload = event.data.json();
      } catch {
        payload = { title: "Nexora", body: event.data.text() };
      }

      const title = payload.title || "Nexora";
      const body = payload.body || "";
      const url = payload.url || "/";
      const tag = payload.tag || "nexora";

      // Si hay una pestaña abierta y enfocada, evitamos duplicar
      // (la in-app notification ya cubre ese caso).
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const isFocused = allClients.some(
        (c) => c.visibilityState === "visible" && c.focused,
      );
      if (isFocused) return;

      await self.registration.showNotification(title, {
        body,
        icon: "/icon",
        badge: "/icon",
        tag,
        data: { url },
        renotify: true,
      });
    })(),
  );
});

/* ===========================================================================
 * Click en notificación: enfoca/abre la URL que venga en `data.url`.
 * ========================================================================= */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Si ya hay una pestaña abierta de nuestra app, enfócala y navega.
      for (const client of allClients) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            await client.focus();
            if ("navigate" in client) {
              await client.navigate(targetUrl);
            }
            return;
          }
        } catch {
          /* sigue intentando */
        }
      }

      // Si no había ninguna abierta, abrimos una nueva.
      await self.clients.openWindow(targetUrl);
    })(),
  );
});
