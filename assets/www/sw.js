const CACHE_NAME = "sve-offline-v1";
const ART_MANIFEST_URL = "./data/offline-art-manifest.json";

const SHELL_FILES = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/card-placeholder.svg",
  "./assets/hero-collection.svg",
  "./assets/scan-card.svg",
  "./assets/set-library.svg",
  "./data/shadowverse-evolve-card-catalog.csv",
  "./data/shadowverse-cardtype-cache.json",
  ART_MANIFEST_URL,
];

async function cacheShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(SHELL_FILES);
}

async function cacheArtManifestEntries() {
  const cache = await caches.open(CACHE_NAME);

  let manifestResponse = await cache.match(ART_MANIFEST_URL);
  if (!manifestResponse) {
    try {
      manifestResponse = await fetch(ART_MANIFEST_URL, { cache: "no-store" });
      if (manifestResponse && manifestResponse.ok) {
        await cache.put(ART_MANIFEST_URL, manifestResponse.clone());
      }
    } catch {
      return;
    }
  }
  if (!manifestResponse) return;

  let entries = [];
  try {
    entries = await manifestResponse.json();
  } catch {
    return;
  }
  if (!Array.isArray(entries) || !entries.length) return;

  for (const url of entries) {
    if (typeof url !== "string") continue;
    const req = new Request(url, { cache: "no-store" });
    const has = await cache.match(req);
    if (has) continue;
    try {
      const resp = await fetch(req);
      if (resp && resp.ok) {
        await cache.put(req, resp.clone());
      }
    } catch {
      // Keep going; remaining assets can still be cached.
    }
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await cacheArtManifestEntries();
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        const fallback = await caches.match("./index.html");
        if (fallback && event.request.mode === "navigate") return fallback;
        throw new Error("Offline and resource not cached");
      }
    })()
  );
});
