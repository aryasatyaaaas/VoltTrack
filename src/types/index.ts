export interface DashboardData {
    greeting: string;
    hero: {
        kwh: number;
        trendPercentage: number;
        insightText: string;
        cost: number;
        sessionsThisWeek: number;
        lastWeekCost: number;
        lastWeekSessions: number;
        totalSessions: number;
        totalKwh: number;
        totalCost: number;
        avgCostPerSession: number;
    };
    stories: StoryItem[];
    weeklyTrend: { week: string; kwh: number; cost: number }[];
    timeline: TimelineItem[];
    energyBreakdown: {
        locationBreakdown: { name: string; kwh: number; percent: number; count: number }[];
        chargerBreakdown: { name: string; kwh: number; percent: number }[];
        costByLocation: { name: string; cost: number; percent: number }[];
    };
    predictions: {
        nextChargingDay: string | null;
        avgGapDays: number | null;
        weeklyProjectedKwh: number;
        weeklyProjectedCost: number;
    };
}

export interface StoryItem {
    id: string;
    icon: "zap" | "trending-up" | "trending-down" | "dollar-sign" | "calendar";
    text: string;
    type: "neutral" | "positive" | "negative";
}

export interface TimelineItem {
    id: string;
    kwh: number;
    cost: number;
    location: string;
    date: Date;
    timeAgo: string;
    duration: string;
}

export interface UserPreferencesData {
    defaultLocation: string;
    costPerKwh: number;
    currency: string;
    rememberInput: boolean;
    autoFillLocation: boolean;
    smartInsights: boolean;
    favoriteLocations: string[];
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    plan: string;
    createdAt: string;
    preferences: UserPreferencesData;
}

export interface HistorySession {
    id: string;
    energyKwh: number;
    cost: number | null;
    location: string;
    chargerType: string | null;
    durationMinutes: number | null;
    sessionDate: string;
    createdAt: string;
}

export interface HistorySummaryData {
    totalEnergy: number;
    totalCost: number;
    totalSessions: number;
    avgEnergy: number;
}

export interface HistoryFiltersState {
    from: string;
    to: string;
    location: string;
    chargerType: string;
    search: string;
}

export interface HistoryResponse {
    sessions: HistorySession[];
    summary: HistorySummaryData;
    insights: string[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}
export interface RecentSession {
    id: string;
    energyKwh: number;
    cost: number | null;
    location: string;
    chargerType: string | null;
    sessionDate: string | Date;
}
