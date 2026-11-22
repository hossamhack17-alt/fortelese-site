// Service worker — طموح: شبكة أولًا للصفحات، وكاش للأصول الثابتة.
const CACHE = "tamouh-v2";
const PRECACHE = ["/", "/manifest.webmanifest", "/favicon.png", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  const url = new URL(req.url);
  const isAsset = url.pathname.startsWith("/_astro/") || url.pathname.startsWith("/fonts/") || /\.(css|js|png|jpg|jpeg|webp|svg|woff2?)$/.test(url.pathname);

  if (isAsset) {
    event.respondWith(
      caches.match(req).then((hit) =>
        hit ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
      )
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/offline") || caches.match("/")))
    );
  }
});
