const CACHE_NAME = "sve-offline-v3";
const ART_MANIFEST_URL = "./data/offline-art-manifest.json";
const TEXT_ICON_MANIFEST_URL = "./data/text-icon-manifest.json";

const SHELL_FILES = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/card-placeholder.svg",
  "./data/cards-data.js",
  "./data/shadowverse-cardtype-cache.json",
  ART_MANIFEST_URL,
  TEXT_ICON_MANIFEST_URL,
];

async function cacheShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(SHELL_FILES);
}

async function cacheManifestEntries(manifestUrl) {
  const cache = await caches.open(CACHE_NAME);

  let manifestResponse = await cache.match(manifestUrl);
  if (!manifestResponse) {
    try {
      manifestResponse = await fetch(manifestUrl, { cache: "no-store" });
      if (manifestResponse && manifestResponse.ok) {
        await cache.put(manifestUrl, manifestResponse.clone());
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
      await cacheManifestEntries(ART_MANIFEST_URL);
      await cacheManifestEntries(TEXT_ICON_MANIFEST_URL);
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
