import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { handleApiError, apiResponse } from "@/lib/errors";

const DEFAULT_LOCATIONS = ["Home", "Office", "Public Station", "Mall", "Highway Rest Stop"];

export async function GET() {
    try {
        const sessionUser = await getSessionUser();

        // Get locations from existing sessions
        const rows = await prisma.chargingSession.findMany({
            where: { userId: sessionUser.userId },
            select: { location: true },
            distinct: ["location"],
        });

        // Get locations from user preferences (favorites)
        const prefs = await prisma.userPreferences.findUnique({
            where: { userId: sessionUser.userId },
            select: { favoriteLocations: true },
        });

        const sessionLocations = rows.map((r) => r.location);
        const favoriteLocations = prefs?.favoriteLocations || [];

        // Combine all and deduplicate
        const uniqueLocations = Array.from(
            new Set([...DEFAULT_LOCATIONS, ...favoriteLocations, ...sessionLocations])
        ).sort();

        return apiResponse({ locations: uniqueLocations });
    } catch (error) {
        return handleApiError(error);
    }
}
