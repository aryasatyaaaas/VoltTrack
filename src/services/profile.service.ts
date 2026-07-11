import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { NotFoundError } from "@/lib/errors";

export async function getProfileData() {
    const sessionUser = await getSessionUser();

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.userId },
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
                    favoriteLocations: true,
                },
            },
        },
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    // Auto-create preferences if they don't exist
    let preferences = user.preferences;
    if (!preferences) {
        preferences = await prisma.userPreferences.create({
            data: { userId: sessionUser.userId },
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

    return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        preferences,
    };
}
