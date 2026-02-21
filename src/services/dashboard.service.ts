import { prisma } from "@/lib/prisma";
import { getPercentageChange, formatDate } from "@/lib/utils";
import { getSessionUser } from "@/lib/session";
import type { DashboardData, StoryItem, TimelineItem } from "@/types";

/** Week boundary helpers */
function getWeekStart(offset: number = 0): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const start = new Date(now);
    start.setDate(now.getDate() - monOffset + offset * 7);
    start.setHours(0, 0, 0, 0);
    return start;
}

function getWeekEnd(offset: number = 0): Date {
    const start = getWeekStart(offset);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return end;
}

function getGreeting(name: string): string {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 24) {
        if (diffHrs === 0) return "Just now";
        return `${diffHrs}h ago`;
    }
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
}

/** Hero metrics */
async function getHeroData(userId: string) {
    const thisWeekStart = getWeekStart(0);
    const thisWeekEnd = getWeekEnd(0);
    const lastWeekStart = getWeekStart(-1);
    const lastWeekEnd = getWeekEnd(-1);

    const [thisWeek, lastWeek, allTime] = await Promise.all([
        prisma.chargingSession.aggregate({
            _sum: { energyKwh: true, cost: true },
            _count: { id: true },
            where: { userId, sessionDate: { gte: thisWeekStart, lt: thisWeekEnd } },
        }),
        prisma.chargingSession.aggregate({
            _sum: { energyKwh: true, cost: true },
            _count: { id: true },
            where: { userId, sessionDate: { gte: lastWeekStart, lt: lastWeekEnd } },
        }),
        prisma.chargingSession.aggregate({
            _sum: { energyKwh: true, cost: true },
            _count: { id: true },
            _avg: { energyKwh: true, cost: true },
            where: { userId },
        }),
    ]);

    const currentKwh = Math.round((thisWeek._sum.energyKwh ?? 0) * 10) / 10;
    const lastKwh = Math.round((lastWeek._sum.energyKwh ?? 0) * 10) / 10;
    const trendPercentage = getPercentageChange(currentKwh, lastKwh);

    let insightText = "";
    if (trendPercentage > 20) {
        insightText = `That's ${trendPercentage}% higher than last week.`;
    } else if (trendPercentage < -20) {
        insightText = `You used ${Math.abs(trendPercentage)}% less energy than last week.`;
    } else {
        insightText = "Your usage is consistent with last week.";
    }

    return {
        kwh: currentKwh,
        trendPercentage,
        insightText,
        cost: thisWeek._sum.cost ?? 0,
        sessionsThisWeek: thisWeek._count.id,
        lastWeekCost: lastWeek._sum.cost ?? 0,
        lastWeekSessions: lastWeek._count.id,
        totalSessions: allTime._count.id,
        totalKwh: Math.round((allTime._sum.energyKwh ?? 0) * 10) / 10,
        totalCost: Math.round(allTime._sum.cost ?? 0),
        avgCostPerSession: Math.round(allTime._avg.cost ?? 0),
    };
}

/** Energy breakdown by location and charger type */
async function getEnergyBreakdown(userId: string) {
    const sessions = await prisma.chargingSession.findMany({
        where: { userId },
        select: { energyKwh: true, cost: true, location: true, chargerType: true },
    });

    // By location
    const byLocation: Record<string, number> = {};
    const costByLocation: Record<string, number> = {};
    // By charger type
    const byCharger: Record<string, number> = {};

    for (const s of sessions) {
        byLocation[s.location] = (byLocation[s.location] ?? 0) + s.energyKwh;
        costByLocation[s.location] = (costByLocation[s.location] ?? 0) + (s.cost ?? 0);
        const ct = s.chargerType ?? "Unknown";
        byCharger[ct] = (byCharger[ct] ?? 0) + s.energyKwh;
    }

    const totalEnergy = sessions.reduce((sum, s) => sum + s.energyKwh, 0) || 1;
    const totalCostAll = sessions.reduce((sum, s) => sum + (s.cost ?? 0), 0) || 1;

    const locationBreakdown = Object.entries(byLocation)
        .map(([name, kwh]) => ({
            name,
            kwh: Math.round(kwh * 10) / 10,
            percent: Math.round((kwh / totalEnergy) * 100),
        }))
        .sort((a, b) => b.kwh - a.kwh);

    const chargerBreakdown = Object.entries(byCharger)
        .map(([name, kwh]) => ({
            name,
            kwh: Math.round(kwh * 10) / 10,
            percent: Math.round((kwh / totalEnergy) * 100),
        }))
        .sort((a, b) => b.kwh - a.kwh);

    const costByLocationArr = Object.entries(costByLocation)
        .map(([name, cost]) => ({
            name,
            cost: Math.round(cost),
            percent: Math.round((cost / totalCostAll) * 100),
        }))
        .sort((a, b) => b.cost - a.cost);

    return { locationBreakdown, chargerBreakdown, costByLocation: costByLocationArr };
}

/** Weekly cost trend (last 8 weeks) */
async function getWeeklyCostTrend(userId: string) {
    const trend = [];
    for (let i = 7; i >= 0; i--) {
        const start = getWeekStart(-i);
        const end = getWeekEnd(-i);
        const result = await prisma.chargingSession.aggregate({
            _sum: { energyKwh: true, cost: true },
            where: { userId, sessionDate: { gte: start, lt: end } },
        });
        trend.push({
            week: formatDate(start).split(",")[0],
            kwh: Math.round((result._sum.energyKwh ?? 0) * 10) / 10,
            cost: Math.round(result._sum.cost ?? 0),
        });
    }
    return trend;
}

/** Predictions */
async function getPredictions(userId: string) {
    // Get last 14 days of sessions to find patterns
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentSessions = await prisma.chargingSession.findMany({
        where: { userId, sessionDate: { gte: twoWeeksAgo } },
        orderBy: { sessionDate: "desc" },
        select: { sessionDate: true, energyKwh: true, cost: true },
    });

    // Average days between sessions
    let avgGapDays: number | null = null;
    if (recentSessions.length >= 2) {
        const gaps: number[] = [];
        for (let i = 0; i < recentSessions.length - 1; i++) {
            const d1 = new Date(recentSessions[i].sessionDate).getTime();
            const d2 = new Date(recentSessions[i + 1].sessionDate).getTime();
            gaps.push((d1 - d2) / (1000 * 60 * 60 * 24));
        }
        avgGapDays = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
        if (avgGapDays < 1) avgGapDays = 1;
    }

    // Next charging prediction
    const lastSession = recentSessions[0];
    let nextChargingDate: Date | null = null;
    if (lastSession && avgGapDays !== null) {
        nextChargingDate = new Date(lastSession.sessionDate);
        nextChargingDate.setDate(nextChargingDate.getDate() + avgGapDays);
        if (nextChargingDate < new Date()) {
            nextChargingDate = new Date();
            nextChargingDate.setDate(nextChargingDate.getDate() + 1);
        }
    }

    // Weekly projected usage
    const avgKwhPerSession = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.energyKwh, 0) / recentSessions.length
        : 0;

    // Default to a reasonable estimate if no history, but better to show 0 if no sessions at all
    const sessionsPerWeek = (avgGapDays !== null && avgGapDays > 0) ? 7 / avgGapDays : 0;

    const weeklyProjectedKwh = Math.round(avgKwhPerSession * sessionsPerWeek * 10) / 10;
    const avgCostPerSession = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + (s.cost ?? 0), 0) / recentSessions.length
        : 0;
    const weeklyProjectedCost = Math.round(avgCostPerSession * sessionsPerWeek);

    return {
        nextChargingDay: nextChargingDate
            ? nextChargingDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
            : null,
        avgGapDays,
        weeklyProjectedKwh,
        weeklyProjectedCost,
    };
}

/** Smart insights — at least 5 */
async function getSmartInsights(heroData: Awaited<ReturnType<typeof getHeroData>>, breakdown: Awaited<ReturnType<typeof getEnergyBreakdown>>) {
    const stories: StoryItem[] = [];

    // 1: Cost this week
    if (heroData.cost > 0) {
        stories.push({
            id: "cost",
            icon: "dollar-sign",
            text: `You've spent Rp ${heroData.cost.toLocaleString("id-ID")} on charging this week.`,
            type: "neutral",
        });
    }

    // 2: Trend
    if (heroData.trendPercentage > 15) {
        stories.push({
            id: "trend-up",
            icon: "trending-up",
            text: `Energy usage is ${heroData.trendPercentage}% higher than last week — consider lighter charging.`,
            type: "negative",
        });
    } else if (heroData.trendPercentage < -15) {
        stories.push({
            id: "trend-down",
            icon: "trending-down",
            text: `Great efficiency! You're saving ${Math.abs(heroData.trendPercentage)}% energy vs last week.`,
            type: "positive",
        });
    }

    // 3: Top location
    if (breakdown.locationBreakdown.length > 0) {
        const top = breakdown.locationBreakdown[0];
        stories.push({
            id: "top-loc",
            icon: "zap",
            text: `${top.name} is your most used location (${top.percent}% of energy).`,
            type: "neutral",
        });
    }

    // 4: Cost efficiency — Home vs Public
    const homeCost = breakdown.costByLocation.find((l) => l.name === "Home");
    const publicCost = breakdown.costByLocation.find((l) => l.name === "Public Station");
    if (homeCost && publicCost) {
        if (homeCost.cost < publicCost.cost) {
            stories.push({
                id: "home-vs-public",
                icon: "dollar-sign",
                text: `Charging at home saves you more — Rp ${(publicCost.cost - homeCost.cost).toLocaleString("id-ID")} cheaper overall.`,
                type: "positive",
            });
        } else {
            stories.push({
                id: "home-vs-public",
                icon: "dollar-sign",
                text: `Public stations cost Rp ${(homeCost.cost - publicCost.cost).toLocaleString("id-ID")} less than home charging overall.`,
                type: "neutral",
            });
        }
    }

    // 5: Sessions this week
    stories.push({
        id: "sessions-week",
        icon: "zap",
        text: heroData.sessionsThisWeek > 0
            ? `You've completed ${heroData.sessionsThisWeek} session${heroData.sessionsThisWeek > 1 ? "s" : ""} this week.`
            : "No charging sessions this week yet — time to plug in?",
        type: heroData.sessionsThisWeek > 0 ? "neutral" : "negative",
    });

    // 6: All-time stats
    if (heroData.totalSessions > 5) {
        stories.push({
            id: "all-time",
            icon: "calendar",
            text: `Lifetime: ${heroData.totalSessions} sessions, ${heroData.totalKwh} kWh, Rp ${heroData.totalCost.toLocaleString("id-ID")} total.`,
            type: "neutral",
        });
    }

    // 7: Charger type preference
    if (breakdown.chargerBreakdown.length > 1) {
        const top = breakdown.chargerBreakdown[0];
        stories.push({
            id: "charger-pref",
            icon: "zap",
            text: `You prefer ${top.name} chargers — ${top.percent}% of your total energy.`,
            type: "neutral",
        });
    }

    return stories;
}

async function getTimeline(userId: string): Promise<TimelineItem[]> {
    const sessions = await prisma.chargingSession.findMany({
        where: { userId },
        orderBy: { sessionDate: "desc" },
        take: 5,
    });

    return sessions.map((s) => ({
        id: s.id,
        kwh: s.energyKwh,
        cost: s.cost ?? 0,
        location: s.location,
        date: s.sessionDate,
        timeAgo: formatTimeAgo(s.sessionDate),
        duration: s.durationMinutes
            ? `${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m`
            : "N/A",
    }));
}

export async function getDashboardData(): Promise<DashboardData> {
    const user = await getSessionUser();
    const hero = await getHeroData(user.id);
    const breakdown = await getEnergyBreakdown(user.id);
    const [stories, timeline, weeklyTrend, predictions] = await Promise.all([
        getSmartInsights(hero, breakdown),
        getTimeline(user.id),
        getWeeklyCostTrend(user.id),
        getPredictions(user.id),
    ]);

    return {
        greeting: getGreeting(user.name ?? "there"),
        hero,
        stories,
        weeklyTrend,
        timeline,
        energyBreakdown: breakdown,
        predictions,
    };
}
