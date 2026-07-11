/**
 * VoltTrack Service Worker
 * Strategy:
 *  - NEVER CACHE: /api/auth/*, /api/csrf  (auth & CSRF endpoints — always fresh)
 *  - Network-first: /api/* (dynamic data — EV sessions, profile, history)
 *  - Cache-first: /_next/static/*, /icons/*, /fonts, /manifest.json (static assets)
 *  - Network-first: navigation requests (HTML pages — always get fresh render)
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `volttrack-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `volttrack-runtime-${CACHE_VERSION}`;

// Assets to precache on SW install
const PRECACHE_ASSETS = [
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/icons/icon-maskable-512x512.png",
    "/apple-touch-icon.png",
];

// --- Install: precache critical static assets ---
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                // Non-fatal: precache failure shouldn't block SW install
                console.warn("[SW] Precache partial failure:", err);
            });
        }).then(() => self.skipWaiting())
    );
});

// --- Activate: clean up old caches ---
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
                    .map((name) => {
                        console.log("[SW] Deleting old cache:", name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// --- Fetch: routing strategy ---
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin requests
    if (url.origin !== self.location.origin) {
        return;
    }

    const pathname = url.pathname;

    // ================================================================
    // 🔒 SECURITY: NEVER cache auth or CSRF endpoints
    // These must ALWAYS hit the network to ensure fresh tokens/validation
    // ================================================================
    if (
        pathname.startsWith("/api/auth/") ||
        pathname === "/api/csrf" ||
        pathname.startsWith("/api/sessions")  // session management
    ) {
        event.respondWith(fetch(request));
        return;
    }

    // ================================================================
    // 🔄 NETWORK-FIRST: API routes (dynamic EV data)
    // Try network → fall back to cache if offline
    // Never serve stale data for /api/* (session history, profile, etc.)
    // ================================================================
    if (pathname.startsWith("/api/")) {
        event.respondWith(networkFirst(request, RUNTIME_CACHE, 5000));
        return;
    }

    // ================================================================
    // ⚡ CACHE-FIRST: Next.js static assets (JS/CSS bundles, chunks)
    // These have content-hashed filenames — safe to cache aggressively
    // ================================================================
    if (pathname.startsWith("/_next/static/")) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // ================================================================
    // ⚡ CACHE-FIRST: PWA assets and manifest
    // ================================================================
    if (
        pathname.startsWith("/icons/") ||
        pathname === "/manifest.json" ||
        pathname === "/apple-touch-icon.png" ||
        pathname === "/favicon.ico"
    ) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // ================================================================
    // 🔄 NETWORK-FIRST: Navigation requests (HTML pages)
    // Always try to get fresh HTML from server — don't serve stale pages
    // This ensures auth redirects and server-side logic always runs
    // ================================================================
    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request, RUNTIME_CACHE, 8000));
        return;
    }

    // Default: network only (don't cache anything else)
    // This covers: _next/image, external resources, etc.
});

/**
 * Cache-first strategy:
 * 1. Check cache → return immediately if found
 * 2. If not in cache → fetch from network → store in cache → return
 */
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (err) {
        console.warn("[SW] Cache-first network failure:", request.url, err);
        throw err;
    }
}

/**
 * Network-first strategy:
 * 1. Try network with timeout
 * 2. If network fails or times out → fall back to cache
 * 3. If not in cache either → throw (let browser show error)
 */
async function networkFirst(request, cacheName, timeoutMs = 5000) {
    const cache = await caches.open(cacheName);

    try {
        const networkPromise = fetch(request.clone());
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network timeout")), timeoutMs)
        );

        const response = await Promise.race([networkPromise, timeoutPromise]);

        // Only cache successful, non-auth responses
        if (response.ok) {
            // Don't cache API responses that contain sensitive data
            // Only cache navigation (HTML) responses for offline fallback
            if (request.mode === "navigate") {
                cache.put(request, response.clone());
            }
        }

        return response;
    } catch (_err) {
        // Network failed — try cache
        const cached = await cache.match(request);
        if (cached) {
            console.log("[SW] Serving from cache (offline):", request.url);
            return cached;
        }

        // Nothing in cache either — for navigate requests, show a simple offline response
        if (request.mode === "navigate") {
            return new Response(
                `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VoltTrack — Offline</title>
  <style>
    body { margin: 0; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #FAFAF8; color: #1A1A2E; gap: 16px; padding: 24px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 8px; }
    h1 { font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.3px; }
    p { font-size: 14px; color: #6B6B8A; margin: 0; max-width: 280px; line-height: 1.6; }
    button { margin-top: 8px; padding: 12px 28px; border-radius: 100px; background: #FF6B35; color: #fff; border: none; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  </style>
</head>
<body>
  <div class="icon">⚡</div>
  <h1>You're Offline</h1>
  <p>VoltTrack needs a connection to sync your charging data. Please check your internet and try again.</p>
  <button onclick="window.location.reload()">Try Again</button>
</body>
</html>`,
                {
                    status: 503,
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                }
            );
        }

        throw _err;
    }
}
