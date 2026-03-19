"use client";

import { useState, useEffect, useCallback } from "react";
import { HistorySummary } from "@/components/history/HistorySummary";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistorySessionCard } from "@/components/history/HistorySessionCard";
import { SessionDetailModal } from "@/components/history/SessionDetailModal";
import { HistoryInsights } from "@/components/history/HistoryInsights";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plug, Plus, Zap } from "lucide-react";
import Link from "next/link";
import type {
    HistorySession,
    HistorySummaryData,
    HistoryFiltersState,
    HistoryResponse,
} from "@/types";

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
    const [sessions, setSessions] = useState<HistorySession[]>([]);
    const [summary, setSummary] = useState<HistorySummaryData>({
        totalEnergy: 0,
        totalCost: 0,
        totalSessions: 0,
        avgEnergy: 0,
    });
    const [insights, setInsights] = useState<string[]>([]);
    const [filters, setFilters] = useState<HistoryFiltersState>(initialFilters);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedSession, setSelectedSession] = useState<HistorySession | null>(null);

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

                const res = await fetch(`/api/history?${params}`);
                if (!res.ok) throw new Error("Failed to fetch");

                const data: HistoryResponse = await res.json();

                if (append) {
                    setSessions((prev) => [...prev, ...data.sessions]);
                } else {
                    setSessions(data.sessions);
                    setSummary(data.summary);
                    setInsights(data.insights);
                }
                setHasMore(data.pagination.hasMore);
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
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#00E5C3" }} />
            </div>
        );
    }

    const grouped = groupByDate(sessions);

    return (
        <div className="space-y-7">
            {/* Insight pills */}
            {insights.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <HistoryInsights insights={insights} />
                </motion.div>
            )}

            {/* Bento stat grid — "Your Journey" */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
            >
                <HistorySummary summary={summary} />
            </motion.div>

            {/* Search + Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
            >
                <HistoryFilters filters={filters} onChange={handleFilterChange} />
            </motion.div>

            {/* All Sessions */}
            {sessions.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div
                        className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl"
                        style={{
                            background: "rgba(0,229,195,0.06)",
                            boxShadow: "0 0 40px rgba(0,229,195,0.12)",
                        }}
                    >
                        <Plug className="h-10 w-10" style={{ color: "rgba(0,229,195,0.5)" }} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">No sessions yet</h3>
                    <p className="mt-1 text-sm" style={{ color: "rgba(113,113,122,1)" }}>
                        Start charging — your history will appear here.
                    </p>
                    <Link
                        href="/charging"
                        className="mt-6 flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]"
                        style={{
                            background: "linear-gradient(135deg, #00E5C3 0%, #0066FF 100%)",
                            boxShadow: "0 8px 24px rgba(0,229,195,0.25)",
                        }}
                    >
                        <Zap className="h-4 w-4" /> Log First Session
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.15 }}
                    className="space-y-1"
                >
                    {/* Section header */}
                    <div className="flex items-center gap-4 pb-2">
                        <span
                            className="text-[10px] font-bold uppercase tracking-[0.2em]"
                            style={{ color: "rgba(63,63,70,1)" }}
                        >
                            All Sessions
                        </span>
                        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
                        <span
                            className="text-[10px] font-medium"
                            style={{ color: "rgba(63,63,70,1)" }}
                        >
                            {sessions.length} total
                        </span>
                    </div>

                    {/* Date-grouped sessions */}
                    <AnimatePresence mode="popLayout">
                        {grouped.map((group, gi) => (
                            <motion.div
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
                                        style={{ color: "rgba(82,82,91,1)" }}
                                    >
                                        {group.label}
                                    </span>
                                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
                                </div>

                                {/* Session cards for this date */}
                                {group.sessions.map((session) => (
                                    <HistorySessionCard
                                        key={session.id}
                                        session={session}
                                        onClick={() => setSelectedSession(session)}
                                    />
                                ))}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Load more */}
                    {hasMore && (
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-semibold text-zinc-300 transition hover:text-white disabled:opacity-50"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
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
                </motion.div>
            )}

            {/* Detail Modal */}
            <SessionDetailModal
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        </div>
    );
}
