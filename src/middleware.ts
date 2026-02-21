import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretStr = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(secretStr || "temporary-fallback-for-middleware-init"); // In Next.js middleware, env might be weird on init, but isAuthenticated will handle it. Actually better to be consistent.
if (!secretStr && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
}
const JWT_SECRET_REAL = new TextEncoder().encode(secretStr || "placeholder");
const COOKIE_NAME = "volttrack_token";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/charging", "/history", "/profile"];
// Routes only for unauthenticated users
const authPaths = ["/login", "/register"];

async function isAuthenticated(req: NextRequest): Promise<boolean> {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    try {
        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const authenticated = await isAuthenticated(req);

    let response = NextResponse.next();

    // Protect dashboard routes
    if (protectedPaths.some((p) => pathname.startsWith(p))) {
        if (!authenticated) {
            response = NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // Redirect authenticated users away from auth pages
    if (authPaths.some((p) => pathname.startsWith(p))) {
        if (authenticated) {
            response = NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    // Security Headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self';"
    );

    return response;
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/charging/:path*",
        "/history/:path*",
        "/profile/:path*",
        "/login",
        "/register",
    ],
};
