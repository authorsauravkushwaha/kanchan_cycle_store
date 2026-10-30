/*
 * Kanchan Cycle Stores — offline-first service worker.
 *
 * Goals, in order:
 *  1. A visitor arriving from Google Maps on a slow Android phone sees the page
 *     even when the connection drops.
 *  2. Call, WhatsApp and directions keep working from the cached offline page.
 *  3. New deployments replace the cache cleanly (no permanently stale catalog).
 *
 * It only stores the app shell, the owner-uploaded hero image and the offline
 * fallback. No enquiry, shortlist or personal data is ever cached here.
 */
const VERSION = 'kanchan-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const IMAGE_CACHE = `${VERSION}-images`;
const MAX_IMAGES = 24;

/* Registration scope keeps every URL correct when hosted under a sub-path. */
const SCOPE = new URL(self.registration.scope);
const BASE = SCOPE.pathname;
const INDEX_URL = BASE;
const OFFLINE_URL = `${BASE}offline.html`;
/* Replaced at build time with every hashed JS/CSS file, so pages the visitor has
   not opened yet still work offline. Empty here keeps `public/sw.js` valid. */
const PRECACHE_ASSETS = [];
const PRECACHE = [
  INDEX_URL,
  OFFLINE_URL,
  `${BASE}offline.css`,
  `${BASE}manifest.webmanifest`,
  `${BASE}favicon.svg`,
  `${BASE}icons/icon-192.png`,
  `${BASE}icons/icon-512.png`,
  `${BASE}icons/icon-maskable-512.png`,
  `${BASE}icons/apple-touch-icon.png`,
  `${BASE}images/kanchan-store-hero.jpeg`,
  ...PRECACHE_ASSETS.map(path => `${BASE}${path}`),
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    /* Default cache mode lets the browser reuse files it just downloaded. */
    await Promise.allSettled(PRECACHE.map(url => cache.add(new Request(url))));
    /* Do not activate automatically: the page shows a "new version" notice. */
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => !key.startsWith(VERSION)).map(key => caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.disable();
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

const isSameOrigin = url => url.origin === SCOPE.origin;

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map(key => cache.delete(key)));
}

/**
 * Cache-first for every same-origin GET: build files, fonts and the hero image.
 * Unknown destinations (some browsers report an empty
 * destination for module imports) are covered too, instead of slipping through
 * to a failing network request.
 */
async function cacheFirst(request) {
  /* ignoreVary: hosts (and some dev servers) add `Vary: Origin` to static files,
     which would otherwise stop precached modules from matching. The cache only
     ever contains same-origin responses. */
  const cached = await caches.match(request, { ignoreVary: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      const isImage = request.destination === 'image';
      const cache = await caches.open(isImage ? IMAGE_CACHE : ASSET_CACHE);
      await cache.put(request, response.clone());
      if (isImage) await trimCache(IMAGE_CACHE, MAX_IMAGES);
    }
    return response;
  } catch (error) {
    const fallback = await caches.match(request, { ignoreVary: true });
    if (fallback) return fallback;
    throw error;
  }
}

/* Network-first for navigations: a fresh catalog always wins when online. */
async function handleNavigate(event) {
  try {
    const response = await fetch(event.request);
    if (response && response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(INDEX_URL, response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const cachedPage = await cache.match(event.request, { ignoreSearch: true, ignoreVary: true });
    return cachedPage || (await cache.match(INDEX_URL, { ignoreVary: true })) || (await cache.match(OFFLINE_URL, { ignoreVary: true })) ||
      new Response('<!doctype html><meta charset="utf-8"><title>Offline</title><p>ইন্টারনেট নেই / Offline. +91 70768 84950', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(event));
    return;
  }
  event.respondWith(cacheFirst(request));
});
