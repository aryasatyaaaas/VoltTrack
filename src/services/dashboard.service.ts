import { prisma } from "@/lib/prisma";
import { getPercentageChange, formatDate } from "@/lib/utils";
import { getSessionUser } from "@/lib/session";
import type { DashboardData, TimelineItem } from "@/types";

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

function getMonthStart(offset: number = 0): Date {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    start.setHours(0, 0, 0, 0);
    return start;
}

function getMonthEnd(offset: number = 0): Date {
    const start = getMonthStart(offset + 1);
    return start;
}

// ─── Hero metrics (2 parallel aggregates) ────────────────
async function getHeroData(userId: string) {
    const thisMonthStart = getMonthStart(0);
    const thisMonthEnd = getMonthEnd(0);
    const lastMonthStart = getMonthStart(-1);
    const lastMonthEnd = getMonthEnd(-1);

    const [thisMonth, lastMonth] = await Promise.all([
        prisma.chargingSession.aggregate({
            _sum: { energyKwh: true, cost: true },
            _count: { id: true },
            where: { userId, sessionDate: { gte: thisMonthStart, lt: thisMonthEnd } },
        }),
        prisma.chargingSession.aggregate({
            _sum: { energyKwh: true, cost: true },
            _count: { id: true },
            where: { userId, sessionDate: { gte: lastMonthStart, lt: lastMonthEnd } },
        }),
    ]);

    const currentKwh = Math.round((thisMonth._sum.energyKwh ?? 0) * 10) / 10;
    const lastKwh = Math.round((lastMonth._sum.energyKwh ?? 0) * 10) / 10;
    const trendPercentage = getPercentageChange(currentKwh, lastKwh);

    return {
        kwh: currentKwh,
        trendPercentage,
        cost: thisMonth._sum.cost ?? 0,
        sessionsThisMonth: thisMonth._count.id,
    };
}

// ─── Energy breakdown using groupBy (no full table scan) ─
async function getEnergyBreakdown(userId: string) {
    const thisMonthStart = getMonthStart(0);
    const thisMonthEnd = getMonthEnd(0);

    const [byLocationRaw, byChargerRaw, byLocationThisMonthRaw] = await Promise.all([
        prisma.chargingSession.groupBy({
            by: ["location"],
            _sum: { energyKwh: true, cost: true },
            _count: { id: true },
            where: { userId },
        }),
        prisma.chargingSession.groupBy({
            by: ["chargerType"],
            _sum: { energyKwh: true },
            _count: { id: true },
            where: { userId },
        }),
        // This month only — for the Highlight Card
        prisma.chargingSession.groupBy({
            by: ["location"],
            _count: { id: true },
            where: { userId, sessionDate: { gte: thisMonthStart, lt: thisMonthEnd } },
            orderBy: { _count: { id: "desc" } },
            take: 1,
        }),
    ]);

    const totalEnergy = byLocationRaw.reduce((s, r) => s + (r._sum.energyKwh ?? 0), 0) || 1;
    const totalCost = byLocationRaw.reduce((s, r) => s + (r._sum.cost ?? 0), 0) || 1;

    const locationBreakdown = byLocationRaw
        .map((r) => ({
            name: r.location,
            kwh: Math.round((r._sum.energyKwh ?? 0) * 10) / 10,
            percent: Math.round(((r._sum.energyKwh ?? 0) / totalEnergy) * 100),
            count: r._count.id,
        }))
        .sort((a, b) => b.count - a.count); // sort by frequency, not kWh

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

    // Top location this month (most frequent sessions)
    const topLocationThisMonth = byLocationThisMonthRaw[0]?.location ?? null;

    return { locationBreakdown, chargerBreakdown, costByLocation, topLocationThisMonth };
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

    // Fetch user name + currency preference from DB (single query)
    console.log("[DEBUG] sessionUser:", sessionUser);
    const user = await prisma.user.findUnique({
        where: { id: sessionUser?.userId },
        include: { preferences: true },
    });

    // Phase 1: parallelized independent data fetches
    const [hero, breakdown, timeline, weeklyTrend] = await Promise.all([
        getHeroData(sessionUser.userId),
        getEnergyBreakdown(sessionUser.userId),
        getTimeline(sessionUser.userId),
        getWeeklyCostTrend(sessionUser.userId),
    ]);

    return {
        greeting: getGreeting(user?.name ?? "there"),
        currency: user?.preferences?.currency ?? "IDR",
        hero,
        weeklyTrend,
        timeline,
        energyBreakdown: breakdown,
    };
}
