import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const secretStr = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(secretStr);

const ACCESS_TOKEN_COOKIE = "volttrack_access_token";
const REFRESH_TOKEN_COOKIE = "volttrack_refresh_token";
const CSRF_COOKIE_NAME = "volttrack_csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

// Routes that require authentication
const protectedPaths = ["/dashboard", "/charging", "/history", "/profile"];
// Routes only for unauthenticated users
const authPaths = ["/login", "/register"];
// Methods that require CSRF protection
const csrfMethods = ["POST", "PATCH", "DELETE"];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    let isAuthenticated = false;
    let payload: any = null;
    let newAccessToken: string | null = null;

    // 1. Verify Access Token
    if (accessToken) {
        try {
            const { payload: p } = await jwtVerify(accessToken, JWT_SECRET);
            payload = p;
            isAuthenticated = true;
        } catch {
            // Access token expired or invalid, try refresh token
        }
    }

    // 2. Try Refresh Token if not authenticated
    if (!isAuthenticated && refreshToken) {
        try {
            const { payload: p } = await jwtVerify(refreshToken, JWT_SECRET);
            payload = p;
            isAuthenticated = true;

            // Issue new Access Token (15m)
            newAccessToken = await new SignJWT({ ...p })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("15m")
                .sign(JWT_SECRET);
        } catch {
            // Refresh token also invalid/expired
        }
    }

    let response = NextResponse.next();

    // 3. Handle Route Protection
    if (protectedPaths.some((p) => pathname.startsWith(p))) {
        if (!isAuthenticated) {
            const loginUrl = new URL("/login", req.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 4. Redirect authenticated users away from auth pages
    if (authPaths.some((p) => pathname.startsWith(p))) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    // 5. CSRF Protection for state-changing methods
    // Skip CSRF for login/register as they typically don't have a session yet or handle it internally
    if (csrfMethods.includes(method) && !pathname.startsWith("/api/auth")) {
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
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
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
        "/api/:path*", // Include API for CSRF check
    ],
};
