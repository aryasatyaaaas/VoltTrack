import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";

const preferencesSchema = z.object({
    defaultLocation: z.string().optional(),
    costPerKwh: z.number().nonnegative("Cost must be 0 or greater").optional(),
    currency: z.enum(["IDR", "USD"]).optional(),
    rememberInput: z.boolean().optional(),
    autoFillLocation: z.boolean().optional(),
    smartInsights: z.boolean().optional(),
});

export async function PATCH(req: Request) {
    try {
        const sessionUser = await getSessionUser();
        const body = await req.json();
        const result = preferencesSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.format() },
                { status: 400 }
            );
        }

        const preferences = await prisma.userPreferences.upsert({
            where: { userId: sessionUser.id },
            create: {
                userId: sessionUser.id,
                ...result.data,
            },
            update: result.data,
            select: {
                defaultLocation: true,
                costPerKwh: true,
                currency: true,
                rememberInput: true,
                autoFillLocation: true,
                smartInsights: true,
            },
        });

        return NextResponse.json(preferences);
    } catch (error) {
        console.error("Failed to update preferences:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
