export interface DashboardData {
    greeting: string;
    currency: string;
    hero: {
        kwh: number;
        trendPercentage: number;
        cost: number;
        sessionsThisMonth: number;
    };
    weeklyTrend: { week: string; kwh: number; cost: number }[];
    timeline: TimelineItem[];
    energyBreakdown: {
        locationBreakdown: { name: string; kwh: number; percent: number; count: number }[];
        chargerBreakdown: { name: string; kwh: number; percent: number }[];
        costByLocation: { name: string; cost: number; percent: number }[];
        topLocationThisMonth: string | null;
    };
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
