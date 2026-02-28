/**
 * Bounded in-memory rate limiter with TTL-based eviction.
 *
 * - O(1) lookup and insertion
 * - Periodic cleanup prevents unbounded memory growth
 * - For multi-instance deployments, replace with Redis (see comments)
 */

interface RateLimitEntry {
    count: number;
    windowStart: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 20;
const MAX_ENTRIES = 10_000; // Hard cap on map size
const CLEANUP_INTERVAL_MS = 2 * 60_000; // Cleanup every 2 minutes

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries — prevents memory leak
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now - entry.windowStart > WINDOW_MS * 2) {
                store.delete(key);
            }
        }
        // If store is still too large after TTL cleanup, evict oldest
        if (store.size > MAX_ENTRIES) {
            const entries = [...store.entries()].sort(
                (a, b) => a[1].windowStart - b[1].windowStart
            );
            const toRemove = entries.slice(0, store.size - MAX_ENTRIES);
            for (const [key] of toRemove) store.delete(key);
        }
    }, CLEANUP_INTERVAL_MS);
    // Allow Node process to exit even if timer is active
    if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
        cleanupTimer.unref();
    }
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
}

export function rateLimit(key: string): RateLimitResult {
    ensureCleanupTimer();

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart > WINDOW_MS) {
        // New window
        store.set(key, { count: 1, windowStart: now });
        return {
            success: true,
            limit: MAX_REQUESTS,
            remaining: MAX_REQUESTS - 1,
            resetMs: now + WINDOW_MS,
        };
    }

    entry.count++;
    store.set(key, entry);

    return {
        success: entry.count <= MAX_REQUESTS,
        limit: MAX_REQUESTS,
        remaining: Math.max(0, MAX_REQUESTS - entry.count),
        resetMs: entry.windowStart + WINDOW_MS,
    };
}

/**
 * Extract a rate-limit key from request headers.
 *
 * IMPORTANT: Only trust X-Forwarded-For when behind a known reverse proxy.
 * Without a proxy, attackers can spoof this header to bypass rate limits.
 */
export function getRateLimitKey(req: Request): string {
    const behindProxy = process.env.BEHIND_TRUSTED_PROXY === "true";

    if (behindProxy) {
        // Trust the LAST IP appended by our proxy (not the first, which is client-controlled)
        const forwarded = req.headers.get("x-forwarded-for");
        if (forwarded) {
            const parts = forwarded.split(",").map((s) => s.trim());
            return parts[parts.length - 1] || "unknown";
        }
    }

    // Without a trusted proxy, all connections come from the same origin
    // Use a shared bucket — still rate-limits the single entry point
    return "local";
}
