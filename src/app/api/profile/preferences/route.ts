import { verifyCsrfRequest } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";
import { handleApiError, apiResponse } from "@/lib/errors";

const preferencesSchema = z.object({
    defaultLocation: z.string().optional(),
    costPerKwh: z.number().nonnegative("Cost must be 0 or greater").optional(),
    currency: z.string().min(2).max(5).optional(),
    rememberInput: z.boolean().optional(),
    autoFillLocation: z.boolean().optional(),
    smartInsights: z.boolean().optional(),
    favoriteLocations: z.array(z.string()).optional(),
});

export async function PATCH(req: Request) {
    try {
        if (!(await verifyCsrfRequest(req))) {
            return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const sessionUser = await getSessionUser();
        const body = await req.json();
        const result = preferencesSchema.safeParse(body);

        if (!result.success) {
            throw result.error;
        }

        let preferences = await prisma.userPreferences.findUnique({
            where: { userId: sessionUser.userId },
            select: {
                defaultLocation: true,
                costPerKwh: true,
                currency: true,
                rememberInput: true,
                autoFillLocation: true,
                smartInsights: true,
                favoriteLocations: true,
            }
        });

        if (preferences) {
            preferences = await prisma.userPreferences.update({
                where: { userId: sessionUser.userId },
                data: {
                    ...result.data,
                    ...(result.data.favoriteLocations !== undefined && {
                        favoriteLocations: { set: result.data.favoriteLocations }
                    })
                },
                select: {
                    defaultLocation: true,
                    costPerKwh: true,
                    currency: true,
                    rememberInput: true,
                    autoFillLocation: true,
                    smartInsights: true,
                    favoriteLocations: true,
                },
            });
        } else {
            preferences = await prisma.userPreferences.create({
                data: {
                    userId: sessionUser.userId,
                    ...result.data,
                },
                select: {
                    defaultLocation: true,
                    costPerKwh: true,
                    currency: true,
                    rememberInput: true,
                    autoFillLocation: true,
                    smartInsights: true,
                    favoriteLocations: true,
                },
            });
        }

        return apiResponse(preferences);
    } catch (error) {
        console.error("Preferences Update Error:", error);
        return handleApiError(error);
    }
}
