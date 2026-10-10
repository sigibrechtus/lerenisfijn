const CACHE = 'frit-academy-v3';
const CORE = ['./', './index.html', './style.css?v=3', './engine.js?v=2', './music.js?v=3', './app.js?v=3', './audio/frituur-swing.mp3', './icon.svg', './manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('frit-academy-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function cachedAudioRange(request, cache) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') || '');
  if (!match || (!match[1] && !match[2])) return null;
  const cached = await cache.match(request.url);
  if (!cached || cached.status !== 200) return null;
  const body = await cached.arrayBuffer(), size = body.byteLength;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (start > end || start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  return new Response(body.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': cached.headers.get('Content-Type') || 'audio/mpeg',
    'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1)
  } });
}
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Safari requests byte ranges, including when replaying an offline track.
    if (url.pathname.endsWith('/audio/frituur-swing.mp3') && event.request.headers.has('range')) {
      const response = await cachedAudioRange(event.request, cache);
      if (response) return response;
    }
    try {
      const response = await fetch(event.request);
      // Cache API rejects partial 206 responses; retain the full precached file.
      if (response.status === 200) event.waitUntil(cache.put(event.request, response.clone()));
      return response;
    } catch (_) {
      return await cache.match(event.request) || (event.request.mode === 'navigate' ? await cache.match('./index.html') : Response.error());
    }
  })());
});
