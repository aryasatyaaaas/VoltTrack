import { NextResponse } from "next/server";
import { verifyCsrfRequest } from "@/lib/csrf";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
    if (!(await verifyCsrfRequest(req))) {
        return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }
    await clearAuthCookie();
    return NextResponse.json({ message: "Logged out" });
}
