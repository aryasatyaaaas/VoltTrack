import { verifyCsrfRequest } from "@/lib/csrf";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
}).strict();

export async function POST(req: Request) {
    try {
        if (!(await verifyCsrfRequest(req))) {
            return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const limiter = rateLimit(getRateLimitKey(req));
        if (!limiter.success) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { name, email, password } = result.data;

        // Check if email already exists — return generic response to prevent enumeration
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            // Return same response shape to prevent timing-based enumeration
            return NextResponse.json(
                { message: "Account created successfully" },
                { status: 201 }
            );
        }

        const passwordHash = await hashPassword(password);

        // Create user + default preferences
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                preferences: {
                    create: {},
                },
            },
            select: { id: true, name: true, email: true },
        });

        return NextResponse.json({ message: "Account created successfully", user }, { status: 201 });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
