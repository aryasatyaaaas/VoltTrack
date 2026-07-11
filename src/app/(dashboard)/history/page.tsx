"use client";

import { useState, useEffect, useCallback } from "react";
import { HistorySummary } from "@/components/history/HistorySummary";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistorySessionCard } from "@/components/history/HistorySessionCard";
import { SessionDetailModal } from "@/components/history/SessionDetailModal";
import { ExportModal } from "@/components/history/ExportModal";
import { m, AnimatePresence } from "framer-motion";
import { Loader2, Plug, Plus, Zap, FileDown } from "lucide-react";
import Link from "next/link";
import type {
    HistorySession,
    HistorySummaryData,
    HistoryFiltersState,
    HistoryResponse,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";

const initialFilters: HistoryFiltersState = {
    from: "",
    to: "",
    location: "all",
    chargerType: "all",
    search: "",
};

/** Group sessions by their date label (e.g. "Mar 19, 2026") */
function groupByDate(sessions: HistorySession[]): { label: string; sessions: HistorySession[] }[] {
    const groups: Map<string, HistorySession[]> = new Map();
    for (const s of sessions) {
        const label = new Date(s.sessionDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(s);
    }
    return Array.from(groups.entries()).map(([label, sessions]) => ({ label, sessions }));
}

export default function HistoryPage() {
    const queryClient = useQueryClient();
    const [sessions, setSessions] = useState<HistorySession[]>([]);
    const [summary, setSummary] = useState<HistorySummaryData>({
        totalEnergy: 0,
        totalCost: 0,
        totalSessions: 0,
        avgEnergy: 0,
    });
    const [filters, setFilters] = useState<HistoryFiltersState>(initialFilters);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);
    const [showExport, setShowExport] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const fetchHistory = useCallback(
        async (pageNum: number, append = false) => {
            if (append) setLoadingMore(true);
            else setLoading(true);

            try {
                const params = new URLSearchParams();
                params.set("page", pageNum.toString());
                params.set("limit", "20");
                if (filters.from) params.set("from", filters.from);
                if (filters.to) params.set("to", filters.to);
                if (filters.location !== "all") params.set("location", filters.location);
                if (filters.chargerType !== "all") params.set("chargerType", filters.chargerType);
                if (filters.search) params.set("search", filters.search);

                const data: HistoryResponse = await queryClient.fetchQuery({
                    queryKey: ['sessions', filters, pageNum],
                    queryFn: async () => {
                        const res = await fetch(`/api/history?${params}`);
                        if (!res.ok) throw new Error("Failed to fetch");
                        return res.json();
                    },
                    staleTime: 30 * 1000
                });

                if (append) {
                    setSessions((prev) => [...prev, ...data.sessions]);
                } else {
                    setSessions(data.sessions);
                    setSummary(data.summary);
                }
                setHasMore(data.pagination.hasMore);
                setTotalCount(data.pagination.total);
                setPage(pageNum);
            } catch {
                // handled silently
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [filters]
    );

    useEffect(() => {
        fetchHistory(1);
    }, [fetchHistory]);

    const { data: profileData } = useProfile();
    const userCurrency = profileData?.preferences?.currency ?? "IDR";
    const userName = profileData?.name ?? "User";

    /** Fetch ALL sessions matching current filters — used by ExportModal */
    const fetchAllForExport = useCallback(async (): Promise<HistorySession[]> => {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "9999"); // effectively all
        if (filters.from) params.set("from", filters.from);
        if (filters.to) params.set("to", filters.to);
        if (filters.location !== "all") params.set("location", filters.location);
        if (filters.chargerType !== "all") params.set("chargerType", filters.chargerType);
        if (filters.search) params.set("search", filters.search);

        const res = await fetch(`/api/history?${params}`);
        if (!res.ok) return [];
        const data: HistoryResponse = await res.json();
        return data.sessions;
    }, [filters]);

    const handleFilterChange = (newFilters: HistoryFiltersState) => {
        setFilters(newFilters);
    };

    const handleLoadMore = () => {
        fetchHistory(page + 1, true);
    };

    const handleUpdate = async (id: string, data: Partial<HistorySession>) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();
        const res = await fetch(`/api/history/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update");
        fetchHistory(1);
        setSelectedSession(null);
    };

    const handleDelete = async (id: string) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();
        const res = await fetch(`/api/history/${id}`, {
            method: "DELETE",
            headers: { "x-csrf-token": csrfToken },
        });
        if (!res.ok) throw new Error("Failed to delete");
        fetchHistory(1);
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--volt-orange)" }} />
            </div>
        );
    }

    const grouped = groupByDate(sessions);

    return (
        <div className="space-y-7">
            {/* Bento stat grid — "Your Journey" */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
            >
                <HistorySummary summary={summary} currency={userCurrency} />
            </m.div>

            {/* Search + Filters */}
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
            >
                <HistoryFilters filters={filters} onChange={handleFilterChange} />
            </m.div>

            {/* All Sessions */}
            {sessions.length === 0 ? (
                <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border bg-white"
                    style={{ borderColor: "var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.02)" }}
                >
                    <div
                        className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl"
                        style={{
                            background: "rgba(255,107,53,0.1)",
                        }}
                    >
                        <Plug className="h-10 w-10" style={{ color: "var(--volt-orange)" }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>No sessions yet</h3>
                    <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
                        Start charging — your history will appear here.
                    </p>
                    <Link
                        href="/charging"
                        className="mt-6 flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]"
                        style={{
                            background: "linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)",
                            boxShadow: "0 8px 24px rgba(255,107,53,0.25)",
                        }}
                    >
                        <Zap className="h-4 w-4" /> Log First Session
                    </Link>
                </m.div>
            ) : (
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="space-y-1"
                >
                    {/* Section header */}
                    <div className="flex items-center gap-4 pb-2">
                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: "var(--ink-muted)" }}
                        >
                            All Sessions
                        </span>
                        <div className="h-px flex-1" style={{ background: "var(--border)" }} />
                        <span
                            className="text-[10px] font-medium"
                            style={{ color: "var(--ink-muted)" }}
                        >
                            {totalCount} total
                        </span>
                        {/* Export button */}
                        <button
                            onClick={() => setShowExport(true)}
                            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition"
                            style={{
                                background: "rgba(255,107,53,0.08)",
                                color: "var(--volt-orange)",
                                border: "1px solid rgba(255,107,53,0.2)",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,107,53,0.15)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,107,53,0.08)")}
                        >
                            <FileDown className="h-3.5 w-3.5" />
                            Export PDF
                        </button>
                    </div>

                    {/* Date-grouped sessions */}
                    <AnimatePresence mode="popLayout">
                        {grouped.map((group, gi) => (
                            <m.div
                                key={group.label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: gi * 0.04 }}
                                className="space-y-2"
                            >
                                {/* Date divider label */}
                                <div className="flex items-center gap-3 pt-3">
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-[0.15em]"
                                        style={{ color: "var(--ink-muted)" }}
                                    >
                                        {group.label}
                                    </span>
                                    <div className="h-px flex-1" style={{ background: "var(--border)" }} />
                                </div>

                                {/* Session cards for this date */}
                                {group.sessions.map((session) => (
                                    <HistorySessionCard
                                        key={session.id}
                                        session={session}
                                        currency={userCurrency}
                                        onClick={() => setSelectedSession(session)}
                                    />
                                ))}
                            </m.div>
                        ))}
                    </AnimatePresence>

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-bold transition disabled:opacity-50"
                                style={{
                                    background: "var(--white)",
                                    border: "1px solid var(--border)",
                                    color: "var(--ink)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                                }}
                            >
                                {loadingMore ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" /> Load More
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </m.div>
            )}

            {/* Detail Modal */}
            <SessionDetailModal
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={showExport}
                onClose={() => setShowExport(false)}
                fetchAll={fetchAllForExport}
                totalCount={totalCount}
                currency={userCurrency}
                userName={userName}
            />
        </div>
    );
}
