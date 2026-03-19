import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { handleApiError, apiResponse } from "@/lib/errors";

export async function GET() {
    try {
        const user = await getSessionUser();

        const rows = await prisma.chargingSession.findMany({
            where: { userId: user.userId },
            select: { location: true },
            distinct: ["location"],
            orderBy: { location: "asc" },
        });

        const locations = rows.map((r) => r.location);

        return apiResponse({ locations });
    } catch (error) {
        return handleApiError(error);
    }
}
