import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const CSRF_COOKIE_NAME = "volttrack_csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

export async function generateCsrfToken(): Promise<string> {
    const token = randomUUID().replace(/-/g, "");
    const cookieStore = await cookies();

    cookieStore.set(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be accessible to client-side JS to send in header
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });

    return token;
}

export function validateCsrfToken(cookieToken: string | undefined, headerToken: string | null): boolean {
    if (!cookieToken || !headerToken) return false;
    return cookieToken === headerToken;
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };

