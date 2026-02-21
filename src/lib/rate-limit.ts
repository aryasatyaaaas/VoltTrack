// Basic in-memory rate limiter for development/small scale
// For production, use Upstash (Redis) with Next.js Edge functions

const LRU = new Map<string, { count: number; lastReset: number }>();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

export function rateLimit(ip: string) {
    const now = Date.now();
    const entry = LRU.get(ip) || { count: 0, lastReset: now };

    if (now - entry.lastReset > WINDOW_SIZE) {
        entry.count = 1;
        entry.lastReset = now;
    } else {
        entry.count++;
    }

    LRU.set(ip, entry);

    return {
        success: entry.count <= MAX_REQUESTS,
        limit: MAX_REQUESTS,
        remaining: Math.max(0, MAX_REQUESTS - entry.count),
        reset: entry.lastReset + WINDOW_SIZE,
    };
}
