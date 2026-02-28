import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import {
    ACCESS_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    ACCESS_TOKEN_EXPIRY,
    ACCESS_TOKEN_MAX_AGE,
    REFRESH_TOKEN_EXPIRY,
    REFRESH_TOKEN_MAX_AGE,
} from "@/lib/constants";

// ─── Lazy JWT secret (no crash at module load) ──────────

let _jwtSecret: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
    if (_jwtSecret) return _jwtSecret;
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is required. Add it to .env");
    }
    _jwtSecret = new TextEncoder().encode(secret);
    return _jwtSecret;
}

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
        .sign(getJwtSecret());
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

// ─── Cookie helpers ──────────────────────────────────────

export async function setAuthCookie(accessToken: string, refreshToken: string) {
    const cookieStore = await cookies();
    const isSecure = process.env.REQUIRE_SECURE_COOKIES === "true";

    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
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

    if (accessToken) {
        const payload = await verifyToken(accessToken);
        if (payload) return payload;
    }

    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const refreshPayload = await verifyToken(refreshToken);
    if (!refreshPayload) return null;

    try {
        const newAccessToken = await signAccessToken(refreshPayload);
        const newRefreshToken = await signRefreshToken(refreshPayload);
        await setAuthCookie(newAccessToken, newRefreshToken);
    } catch {
        // Silently fail if we can't set cookies (e.g. in a RSC)
    }

    return refreshPayload;
}
