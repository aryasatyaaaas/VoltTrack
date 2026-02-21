import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";
import { handleApiError, apiResponse } from "@/lib/errors";

const profileUpdateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    avatarUrl: z.string().url().nullable().optional(),
}).strict();

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
            throw new Error("User not found");
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

        return apiResponse({
            ...user,
            createdAt: user.createdAt.toISOString(),
            preferences,
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(req: Request) {
    try {
        const sessionUser = await getSessionUser();
        const body = await req.json();
        const result = profileUpdateSchema.safeParse(body);

        if (!result.success) {
            throw result.error;
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

        return apiResponse(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
