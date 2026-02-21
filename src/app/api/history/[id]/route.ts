import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";

const updateSchema = z.object({
    energyKwh: z.number().positive().optional(),
    cost: z.number().nonnegative().nullable().optional(),
    location: z.string().min(1).optional(),
    chargerType: z.string().optional(),
    durationMinutes: z.number().int().nonnegative().nullable().optional(),
    sessionDate: z.string().datetime().optional(),
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        const { id } = await params;
        const body = await req.json();

        const result = updateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed" },
                { status: 400 }
            );
        }

        // Verify ownership
        const existing = await prisma.chargingSession.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const updated = await prisma.chargingSession.update({
            where: { id },
            data: {
                ...(result.data.energyKwh !== undefined && { energyKwh: result.data.energyKwh }),
                ...(result.data.cost !== undefined && { cost: result.data.cost }),
                ...(result.data.location !== undefined && { location: result.data.location }),
                ...(result.data.chargerType !== undefined && { chargerType: result.data.chargerType }),
                ...(result.data.durationMinutes !== undefined && { durationMinutes: result.data.durationMinutes }),
                ...(result.data.sessionDate !== undefined && { sessionDate: new Date(result.data.sessionDate) }),
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSessionUser();
        const { id } = await params;

        // Verify ownership
        const existing = await prisma.chargingSession.findFirst({
            where: { id, userId: user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        await prisma.chargingSession.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete session:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
