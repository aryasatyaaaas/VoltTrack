import { verifyCsrfRequest } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";
import { handleApiError, apiResponse, NotFoundError } from "@/lib/errors";

const updateSchema = z.object({
    energyKwh: z.number().positive().optional(),
    cost: z.number().nonnegative().nullable().optional(),
    location: z.string().min(1).optional(),
    chargerType: z.string().optional(),
    durationMinutes: z.number().int().nonnegative().nullable().optional(),
    sessionDate: z.string().datetime().optional(),
}).strict();

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await verifyCsrfRequest(req))) {
            return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const user = await getSessionUser();
        const { id } = await params;
        const body = await req.json();

        const result = updateSchema.safeParse(body);
        if (!result.success) {
            throw result.error;
        }

        // Verify ownership
        const existing = await prisma.chargingSession.findFirst({
            where: { id, userId: user.userId },
        });

        if (!existing) {
            throw new NotFoundError("Session not found");
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

        return apiResponse(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await verifyCsrfRequest(req))) {
            return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const user = await getSessionUser();
        const { id } = await params;

        // Verify ownership
        const existing = await prisma.chargingSession.findFirst({
            where: { id, userId: user.userId },
        });

        if (!existing) {
            throw new NotFoundError("Session not found");
        }

        await prisma.chargingSession.delete({ where: { id } });

        return apiResponse({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
