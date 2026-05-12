import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    PROTECTED_PATHS,
    AUTH_PATHS,
    CSRF_METHODS,
} from "@/lib/constants";

// Lazy JWT secret for edge runtime
let _secret: Uint8Array | null = null;
function getSecret(): Uint8Array {
    if (_secret) return _secret;
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error("JWT_SECRET is required");
    _secret = new TextEncoder().encode(s);
    return _secret;
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    let isAuthenticated = false;
    let payload: Record<string, unknown> | null = null;
    let newAccessToken: string | null = null;

    // 1. Verify Access Token
    if (accessToken) {
        try {
            const { payload: p } = await jwtVerify(accessToken, getSecret());
            payload = p as Record<string, unknown>;
            isAuthenticated = true;
        } catch {
            // Access token expired or invalid
        }
    }

    // 2. Try Refresh Token if not authenticated
    if (!isAuthenticated && refreshToken) {
        try {
            const { payload: p } = await jwtVerify(refreshToken, getSecret());
            payload = p as Record<string, unknown>;
            isAuthenticated = true;

            newAccessToken = await new SignJWT({ ...p })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("15m")
                .sign(getSecret());
        } catch {
            // Refresh token also invalid/expired
        }
    }

    let response = NextResponse.next();

    // Ensure CSRF token exists
    let csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (!csrfCookie) {
        csrfCookie = crypto.randomUUID().replace(/-/g, "");
        const isSecure = process.env.REQUIRE_SECURE_COOKIES === "true";
        response.cookies.set(CSRF_COOKIE_NAME, csrfCookie, {
            httpOnly: false, // Must be readable by client for CsrfProvider
            secure: isSecure,
            sameSite: "lax",
            path: "/",
        });
    }

    // 3. Handle Route Protection
    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // 4. Redirect authenticated users away from auth pages
    if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    // 5. CSRF Protection for state-changing methods
    if (CSRF_METHODS.includes(method) && !pathname.startsWith("/api/auth")) {
        const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;
        const csrfHeader = req.headers.get(CSRF_HEADER_NAME);

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            return NextResponse.json(
                { error: "Invalid or missing CSRF token" },
                { status: 403 }
            );
        }
    }

    // Set new access token if refreshed
    if (newAccessToken) {
        const isSecure = process.env.REQUIRE_SECURE_COOKIES === "true";
        response.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60,
        });
    }

    // 6. Hardened Security Headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    if (process.env.NODE_ENV === "production") {
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    // Content Security Policy
    const isDev = process.env.NODE_ENV !== "production";
    const cspHeader = `
        default-src 'self';
        script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : "'unsafe-inline'"};
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data:;
        font-src 'self' data:;
        connect-src 'self';
        frame-ancestors 'none';
        base-uri 'self';
        form-action 'self';
    `.replace(/\s{2,}/g, " ").trim();

    response.headers.set("Content-Security-Policy", cspHeader);

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
        "/api/:path*",
    ],
};
