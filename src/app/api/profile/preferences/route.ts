import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { z } from "zod";
import { handleApiError, apiResponse } from "@/lib/errors";

const preferencesSchema = z.object({
    defaultLocation: z.string().optional(),
    costPerKwh: z.number().nonnegative("Cost must be 0 or greater").optional(),
    currency: z.enum(["IDR", "USD"]).optional(),
    rememberInput: z.boolean().optional(),
    autoFillLocation: z.boolean().optional(),
    smartInsights: z.boolean().optional(),
    favoriteLocations: z.array(z.string()).optional(),
}).strict();

export async function PATCH(req: Request) {
    try {
        const sessionUser = await getSessionUser();
        const body = await req.json();
        const result = preferencesSchema.safeParse(body);

        if (!result.success) {
            throw result.error;
        }

        const preferences = await prisma.userPreferences.upsert({
            where: { userId: sessionUser.userId },
            create: {
                userId: sessionUser.userId,
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
                favoriteLocations: true,
            },
        });

        return apiResponse(preferences);
    } catch (error) {
        return handleApiError(error);
    }
}
