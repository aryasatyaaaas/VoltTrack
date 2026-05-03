import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/constants";

export async function generateCsrfToken(): Promise<string> {
    const token = randomUUID().replace(/-/g, "");
    const cookieStore = await cookies();

    cookieStore.set(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be accessible to client-side JS to send in header
        secure: process.env.REQUIRE_SECURE_COOKIES === "true",
        sameSite: "lax",
        path: "/",
    });

    return token;
}

export function validateCsrfToken(cookieToken: string | undefined, headerToken: string | null): boolean {
    if (!cookieToken || !headerToken) return false;
    return cookieToken === headerToken;
}

export async function verifyCsrfRequest(req: Request): Promise<boolean> {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    const headerToken = req.headers.get(CSRF_HEADER_NAME);
    return validateCsrfToken(cookieToken, headerToken);
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/constants";
