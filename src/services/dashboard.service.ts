import { prisma } from "@/lib/prisma";
import { getPercentageChange, formatDate } from "@/lib/utils";
import { getSessionUser } from "@/lib/session";
import type { DashboardData, StoryItem, TimelineItem } from "@/types";

// ─── Week boundary helpers ───────────────────────────────
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

// ─── Hero metrics (3 parallel aggregates) ────────────────
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

// ─── Energy breakdown using groupBy (no full table scan) ─
async function getEnergyBreakdown(userId: string) {
    const [byLocationRaw, byChargerRaw] = await Promise.all([
        prisma.chargingSession.groupBy({
            by: ["location"],
            _sum: { energyKwh: true, cost: true },
            where: { userId },
        }),
        prisma.chargingSession.groupBy({
            by: ["chargerType"],
            _sum: { energyKwh: true },
            where: { userId },
        }),
    ]);

    const totalEnergy = byLocationRaw.reduce((s, r) => s + (r._sum.energyKwh ?? 0), 0) || 1;
    const totalCost = byLocationRaw.reduce((s, r) => s + (r._sum.cost ?? 0), 0) || 1;

    const locationBreakdown = byLocationRaw
        .map((r) => ({
            name: r.location,
            kwh: Math.round((r._sum.energyKwh ?? 0) * 10) / 10,
            percent: Math.round(((r._sum.energyKwh ?? 0) / totalEnergy) * 100),
        }))
        .sort((a, b) => b.kwh - a.kwh);

    const chargerBreakdown = byChargerRaw
        .map((r) => ({
            name: r.chargerType ?? "Unknown",
            kwh: Math.round((r._sum.energyKwh ?? 0) * 10) / 10,
            percent: Math.round(((r._sum.energyKwh ?? 0) / totalEnergy) * 100),
        }))
        .sort((a, b) => b.kwh - a.kwh);

    const costByLocation = byLocationRaw
        .map((r) => ({
            name: r.location,
            cost: Math.round(r._sum.cost ?? 0),
            percent: Math.round(((r._sum.cost ?? 0) / totalCost) * 100),
        }))
        .sort((a, b) => b.cost - a.cost);

    return { locationBreakdown, chargerBreakdown, costByLocation };
}

// ─── Weekly cost trend: single query + O(n) bucketing ────
async function getWeeklyCostTrend(userId: string) {
    const rangeStart = getWeekStart(-7);
    const rangeEnd = getWeekEnd(0);

    // Build week keys in advance (O(8))
    const weekKeys: string[] = [];
    const weekStarts: number[] = [];
    for (let i = 7; i >= 0; i--) {
        const ws = getWeekStart(-i);
        weekKeys.push(formatDate(ws).split(",")[0]);
        weekStarts.push(ws.getTime());
    }

    // Initialize buckets
    const buckets = new Map<string, { kwh: number; cost: number }>();
    for (const key of weekKeys) {
        buckets.set(key, { kwh: 0, cost: 0 });
    }

    // Single DB query for entire 8-week range
    const sessions = await prisma.chargingSession.findMany({
        where: { userId, sessionDate: { gte: rangeStart, lt: rangeEnd } },
        select: { sessionDate: true, energyKwh: true, cost: true },
    });

    // O(n) bucketing via arithmetic index computation
    const rangeStartMs = rangeStart.getTime();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    for (const s of sessions) {
        const sessionMs = new Date(s.sessionDate).getTime();
        const idx = Math.floor((sessionMs - rangeStartMs) / WEEK_MS);
        const clampedIdx = Math.max(0, Math.min(idx, weekKeys.length - 1));
        const bucket = buckets.get(weekKeys[clampedIdx])!;
        bucket.kwh += s.energyKwh;
        bucket.cost += s.cost ?? 0;
    }

    return weekKeys.map((week) => {
        const bucket = buckets.get(week)!;
        return {
            week,
            kwh: Math.round(bucket.kwh * 10) / 10,
            cost: Math.round(bucket.cost),
        };
    });
}

// ─── Predictions ─────────────────────────────────────────
async function getPredictions(userId: string) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentSessions = await prisma.chargingSession.findMany({
        where: { userId, sessionDate: { gte: twoWeeksAgo } },
        orderBy: { sessionDate: "desc" },
        select: { sessionDate: true, energyKwh: true, cost: true },
    });

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

    const avgKwhPerSession = recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.energyKwh, 0) / recentSessions.length
        : 0;

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

// ─── Smart insights ──────────────────────────────────────
function getSmartInsights(
    heroData: Awaited<ReturnType<typeof getHeroData>>,
    breakdown: Awaited<ReturnType<typeof getEnergyBreakdown>>
): StoryItem[] {
    const stories: StoryItem[] = [];

    if (heroData.cost > 0) {
        stories.push({
            id: "cost",
            icon: "dollar-sign",
            text: `You've spent Rp ${heroData.cost.toLocaleString("id-ID")} on charging this week.`,
            type: "neutral",
        });
    }

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

    if (breakdown.locationBreakdown.length > 0) {
        const top = breakdown.locationBreakdown[0];
        stories.push({
            id: "top-loc",
            icon: "zap",
            text: `${top.name} is your most used location (${top.percent}% of energy).`,
            type: "neutral",
        });
    }

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

    stories.push({
        id: "sessions-week",
        icon: "zap",
        text: heroData.sessionsThisWeek > 0
            ? `You've completed ${heroData.sessionsThisWeek} session${heroData.sessionsThisWeek > 1 ? "s" : ""} this week.`
            : "No charging sessions this week yet — time to plug in?",
        type: heroData.sessionsThisWeek > 0 ? "neutral" : "negative",
    });

    if (heroData.totalSessions > 5) {
        stories.push({
            id: "all-time",
            icon: "calendar",
            text: `Lifetime: ${heroData.totalSessions} sessions, ${heroData.totalKwh} kWh, Rp ${heroData.totalCost.toLocaleString("id-ID")} total.`,
            type: "neutral",
        });
    }

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

// ─── Timeline ────────────────────────────────────────────
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

// ─── Main: fully parallelized ────────────────────────────
export async function getDashboardData(): Promise<DashboardData> {
    const sessionUser = await getSessionUser();

    // Fetch user name from DB (only needed here for greeting)
    const user = await prisma.user.findUnique({
        where: { id: sessionUser.userId },
        select: { name: true },
    });

    // Phase 1: parallelized independent data fetches
    const [hero, breakdown, timeline, weeklyTrend, predictions] = await Promise.all([
        getHeroData(sessionUser.userId),
        getEnergyBreakdown(sessionUser.userId),
        getTimeline(sessionUser.userId),
        getWeeklyCostTrend(sessionUser.userId),
        getPredictions(sessionUser.userId),
    ]);

    // Phase 2: CPU-only work (synchronous, no await)
    const stories = getSmartInsights(hero, breakdown);

    return {
        greeting: getGreeting(user?.name ?? "there"),
        hero,
        stories,
        weeklyTrend,
        timeline,
        energyBreakdown: breakdown,
        predictions,
    };
}
