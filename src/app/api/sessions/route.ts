import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";

const sessionSchema = z.object({
    kwh: z.number().positive("Energy must be positive"),
    date: z.string().datetime("Invalid date format"),
    location: z.string().min(1, "Location is required"),
    cost: z.number().nonnegative("Cost cannot be negative").nullable().optional(),
    chargerType: z.string().optional(),
    duration: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        const body = await req.json();

        const result = sessionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.format() },
                { status: 400 }
            );
        }

        const { kwh, date, location, cost, chargerType, duration } = result.data;

        const session = await prisma.chargingSession.create({
            data: {
                userId: user.id,
                energyKwh: kwh,
                sessionDate: new Date(date),
                location,
                cost: cost ?? null, // Can be null as per schema update
                chargerType: chargerType ?? "Level 2",
                durationMinutes: duration ?? null,
                // Optional battery percentages not in Quick Add form, default to null
            },
        });

        return NextResponse.json(session);
    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const user = await getSessionUser();
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "5");

        const sessions = await prisma.chargingSession.findMany({
            where: { userId: user.id },
            orderBy: { sessionDate: "desc" },
            take: limit,
            select: {
                id: true,
                energyKwh: true,
                sessionDate: true,
                location: true,
                cost: true,
                durationMinutes: true,
                chargerType: true,
            },
        });

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
