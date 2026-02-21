import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";

const profileUpdateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    avatarUrl: z.string().url().nullable().optional(),
});

export async function GET() {
    try {
        const sessionUser = await getSessionUser();

        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                plan: true,
                createdAt: true,
                preferences: {
                    select: {
                        defaultLocation: true,
                        costPerKwh: true,
                        currency: true,
                        rememberInput: true,
                        autoFillLocation: true,
                        smartInsights: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Auto-create preferences if they don't exist
        let preferences = user.preferences;
        if (!preferences) {
            preferences = await prisma.userPreferences.create({
                data: { userId: user.id },
                select: {
                    defaultLocation: true,
                    costPerKwh: true,
                    currency: true,
                    rememberInput: true,
                    autoFillLocation: true,
                    smartInsights: true,
                },
            });
        }

        return NextResponse.json({
            ...user,
            createdAt: user.createdAt.toISOString(),
            preferences,
        });
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const sessionUser = await getSessionUser();
        const body = await req.json();
        const result = profileUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.format() },
                { status: 400 }
            );
        }

        const updated = await prisma.user.update({
            where: { id: sessionUser.id },
            data: {
                ...(result.data.name && { name: result.data.name }),
                ...(result.data.avatarUrl !== undefined && { avatarUrl: result.data.avatarUrl }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                plan: true,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
