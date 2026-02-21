import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "volttrack-super-secret-key-change-in-production"
);
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

    // Protect dashboard routes
    if (protectedPaths.some((p) => pathname.startsWith(p))) {
        if (!authenticated) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // Redirect authenticated users away from auth pages
    if (authPaths.some((p) => pathname.startsWith(p))) {
        if (authenticated) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
    }

    return NextResponse.next();
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
