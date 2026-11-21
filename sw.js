/* Logo Animator — offline service worker (cache shell + fonts) */
const CACHE = 'spacelogo-ui-v7';
const PRECACHE = [
  './',
  './index.html',
  './og.png',
  './fonts/SpaceGrotesk-300.woff2',
  './sw.js',
  './fonts/Orbitron-700.woff2',
  './fonts/Orbitron-900.woff2',
  './fonts/BebasNeue-400.woff2',
  './fonts/Montserrat-800.woff2',
  './fonts/Montserrat-900.woff2',
  './fonts/Cinzel-900.woff2',
  './fonts/PlayfairDisplay-900.woff2',
  './fonts/BlackOpsOne-400.woff2',
  './fonts/Cairo-700.woff2',
  './fonts/Cairo-900.woff2',
  './fonts/ReemKufi-700.woff2',
  './fonts/NotoKufiArabic-900.woff2',
  './fonts/Tajawal-800.woff2',
  './fonts/Amiri-700.woff2',
  './fonts/ElMessiri-700.woff2',
  './tool.html',
  './fonts/Anton-400.woff2',
  './fonts/Oswald-700.woff2',
  './fonts/RussoOne-400.woff2',
  './fonts/Changa-700.woff2',
  './fonts/Almarai-800.woff2',
  './fonts/SpaceGrotesk-500.woff2',
  './fonts/SpaceGrotesk-700.woff2',
  './fonts/Outfit-400.woff2',
  './fonts/Outfit-600.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // only same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // cache successful same-origin GETs for offline reuse
        if (res && res.ok && (url.pathname.endsWith('.html') || url.pathname.endsWith('.woff2') || url.pathname.endsWith('.js') || url.pathname.endsWith('/'))) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        // navigation fallback
        if (req.mode === 'navigate') return caches.match('./index.html');
        return cached || Response.error();
      });
    })
  );
});
