import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";

const secretStr = process.env.JWT_SECRET;
if (!secretStr) {
    throw new Error("JWT_SECRET environment variable is missing");
}
const JWT_SECRET = new TextEncoder().encode(secretStr);
const ACCESS_TOKEN_COOKIE = "volttrack_access_token";
const REFRESH_TOKEN_COOKIE = "volttrack_refresh_token";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// ─── Password ────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
    return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
}

// ─── JWT ─────────────────────────────────────────────────
export interface TokenPayload {
    userId: string;
    email: string;
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

// ─── Cookie helpers ──────────────────────────────────────
export async function setAuthCookie(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();

    // Determine if we should use secure cookies. 
    // In local Docker networks or self-hosting via IP (HTTP), this needs to be false.
    // Set REQUIRE_SECURE_COOKIES=true in .env if you use HTTPS via reverse proxy.
    const isSecure = process.env.REQUIRE_SECURE_COOKIES === "true";

    // Access Token - Short lived
    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15 minutes
    });

    // Refresh Token - Long lived
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });
}

export async function getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

// ─── Get authenticated user from cookie ──────────────────
export async function getAuthUser(): Promise<TokenPayload | null> {
    const accessToken = await getAccessToken();

    // Try access token first
    if (accessToken) {
        const payload = await verifyToken(accessToken);
        if (payload) return payload;
    }

    // Try refresh token if access token is invalid/expired
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const refreshPayload = await verifyToken(refreshToken);
    if (!refreshPayload) return null;

    // In a full production app, we would verify the refresh token hasn't been revoked in DB.
    // Here, we'll return the user info and assume the caller might want to issue new cookies.
    // NOTE: This automatic refresh in getAuthUser only works if cookies() is allowed to be set.
    // If called in a Server Component during render, set() will fail silently or throw.
    try {
        const newAccessToken = await signAccessToken(refreshPayload);
        const newRefreshToken = await signRefreshToken(refreshPayload);
        await setAuthCookie(newAccessToken, newRefreshToken);
    } catch {
        // Silently fail if we can't set cookies (e.g. in a RSC)
    }

    return refreshPayload;
}
