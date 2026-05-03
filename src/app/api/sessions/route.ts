import { verifyCsrfRequest } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";
import { handleApiError, apiResponse } from "@/lib/errors";

const sessionSchema = z.object({
    kwh: z.number().positive("Energy must be positive"),
    date: z.string().datetime("Invalid date format"),
    location: z.string().min(1, "Location is required"),
    cost: z.number().nonnegative("Cost cannot be negative").nullable().optional(),
    chargerType: z.string().optional(),
    duration: z.number().int().nonnegative().optional(),
}).strict();

export async function POST(req: Request) {
    try {
        if (!(await verifyCsrfRequest(req))) {
            return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const user = await getSessionUser();
        const body = await req.json();

        const result = sessionSchema.safeParse(body);
        if (!result.success) {
            throw result.error;
        }

        const { kwh, date, location, cost, chargerType, duration } = result.data;

        const session = await prisma.chargingSession.create({
            data: {
                userId: user.userId,
                energyKwh: kwh,
                sessionDate: new Date(date),
                location,
                cost: cost ?? null,
                chargerType: chargerType ?? "Level 2",
                durationMinutes: duration ?? null,
            },
        });

        return apiResponse(session);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(req: Request) {
    try {
        const user = await getSessionUser();
        const { searchParams } = new URL(req.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "5"), 1), 100);

        const sessions = await prisma.chargingSession.findMany({
            where: { userId: user.userId },
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

        return apiResponse(sessions);
    } catch (error) {
        return handleApiError(error);
    }
}
