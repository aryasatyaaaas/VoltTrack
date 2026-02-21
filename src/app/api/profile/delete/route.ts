import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { compare } from "bcryptjs";
import { z } from "zod";

const deleteSchema = z.object({
    password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
    try {
        const sessionUser = await getSessionUser();
        const body = await req.json();

        const result = deleteSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        // Verify password
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { passwordHash: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isValid = await compare(body.password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
        }

        // Cascade delete: preferences + sessions are deleted via onDelete: Cascade
        await prisma.user.delete({
            where: { id: sessionUser.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete account:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
