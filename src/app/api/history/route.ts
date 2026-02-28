import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { handleApiError, apiResponse } from "@/lib/errors";

export async function GET(req: Request) {
    try {
        const user = await getSessionUser();
        const { searchParams } = new URL(req.url);

        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const location = searchParams.get("location");
        const chargerType = searchParams.get("chargerType");
        const search = searchParams.get("search");
        const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 1), 100);

        // Build where clause
        const where: Record<string, unknown> = { userId: user.userId };

        if (from || to) {
            where.sessionDate = {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to + "T23:59:59.999Z") }),
            };
        }
        if (location && location !== "all") {
            where.location = location;
        }
        if (chargerType && chargerType !== "all") {
            where.chargerType = chargerType;
        }
        if (search) {
            where.location = { contains: search, mode: "insensitive" };
        }

        // Fetch sessions + count in parallel
        const [sessions, total, aggregation, lastWeekAgg] = await Promise.all([
            prisma.chargingSession.findMany({
                where,
                orderBy: { sessionDate: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    energyKwh: true,
                    cost: true,
                    location: true,
                    chargerType: true,
                    durationMinutes: true,
                    sessionDate: true,
                    createdAt: true,
                },
            }),
            prisma.chargingSession.count({ where }),
            prisma.chargingSession.aggregate({
                where: { userId: user.userId },
                _sum: { energyKwh: true, cost: true },
                _count: { id: true },
                _avg: { energyKwh: true },
            }),
            // Last week aggregation for insights
            prisma.chargingSession.aggregate({
                where: {
                    userId: user.userId,
                    sessionDate: {
                        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
                _sum: { energyKwh: true, cost: true },
                _count: { id: true },
            }),
        ]);

        // Build summary
        const summary = {
            totalEnergy: Math.round((aggregation._sum.energyKwh ?? 0) * 10) / 10,
            totalCost: Math.round(aggregation._sum.cost ?? 0),
            totalSessions: aggregation._count.id,
            avgEnergy: Math.round((aggregation._avg.energyKwh ?? 0) * 10) / 10,
        };

        // Generate smart insights
        const insights = generateInsights(summary, aggregation, lastWeekAgg);

        // Format response
        return apiResponse({
            sessions: sessions.map((s) => ({
                ...s,
                sessionDate: s.sessionDate.toISOString(),
                createdAt: s.createdAt.toISOString(),
            })),
            summary,
            insights,
            pagination: {
                page,
                limit,
                total,
                hasMore: page * limit < total,
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

function generateInsights(
    summary: { totalEnergy: number; totalCost: number; totalSessions: number; avgEnergy: number },
    _current: { _sum: { energyKwh: number | null; cost: number | null }; _count: { id: number }; _avg: { energyKwh: number | null } },
    lastWeek: { _sum: { energyKwh: number | null; cost: number | null }; _count: { id: number } }
): string[] {
    const insights: string[] = [];

    if (summary.totalSessions === 0) return insights;

    // Average insight
    if (summary.avgEnergy > 0) {
        insights.push(`Average session is ${summary.avgEnergy} kWh`);
    }

    // Cost comparison
    const lastWeekCost = lastWeek._sum.cost ?? 0;
    if (lastWeekCost > 0 && summary.totalCost > 0) {
        const diff = Math.round(((summary.totalCost - lastWeekCost) / lastWeekCost) * 100);
        if (diff > 10) {
            insights.push(`You spent ${diff}% more than last week`);
        } else if (diff < -10) {
            insights.push(`You saved ${Math.abs(diff)}% compared to last week`);
        }
    }

    // Session count insight
    if (summary.totalSessions >= 3) {
        insights.push(`${summary.totalSessions} sessions logged so far`);
    }

    return insights;
}
