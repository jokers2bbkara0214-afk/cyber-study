/* CYBER STUDY service worker: offline-first app shell + private lesson cache. */
'use strict';
importScripts('precache-manifest.js'); // defines self.CS_PRECACHE = {version, files}

const { version, files } = self.CS_PRECACHE;
const SHELL = `cs-shell-${version}`;
const RUNTIME = 'cs-runtime-v1';
const LESSONS = 'cs-lessons-v1'; // filled after login (lessons are never on the public site)
const KEEP = new Set([SHELL, RUNTIME, LESSONS]);
// Third-party teaching material: never on the public site, cached per device after login.
const PRIVATE = /\/(lessons\/ch\d+-\d+\.html|assets\/imported\/(common\.css|foundation\.css|foundation\.js|learning-asides\.js|learning-progress\.js))$/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(files.map((f) => new Request(f, { cache: 'reload' })))));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (!KEEP.has(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

async function cacheFirst(request, cacheName, { put = true } = {}) {
  const hit = await caches.match(request, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(request);
  if (put && res.ok) (await caches.open(cacheName)).put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(request);
  const net = fetch(request).then((res) => { if (res.ok || res.type === 'opaque') cache.put(request, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    // CDN libraries and fonts: usable offline after first load. API calls (Supabase) pass through.
    if (/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.hostname)) {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  // Lessons first: they also arrive as iframe navigations.
  if (PRIVATE.test(url.pathname)) {
    event.respondWith(cacheFirst(request, LESSONS));
    return;
  }

  if (request.mode === 'navigate' && /\/(index\.html)?$/.test(url.pathname)) {
    event.respondWith(caches.match('./index.html').then((hit) => hit || fetch(request)));
    return;
  }

  event.respondWith(cacheFirst(request, RUNTIME));
});
