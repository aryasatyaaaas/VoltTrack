import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET() {
    const token = randomBytes(32).toString("hex");

    const response = NextResponse.json({ csrfToken: token });
    response.cookies.set("volttrack_csrf_token", token, {
        httpOnly: false,
        secure: process.env.REQUIRE_SECURE_COOKIES === "true",
        sameSite: "lax",
        path: "/",
    });

    return response;
}
