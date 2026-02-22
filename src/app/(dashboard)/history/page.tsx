"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { HistorySummary } from "@/components/history/HistorySummary";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistorySessionCard } from "@/components/history/HistorySessionCard";
import { SessionDetailModal } from "@/components/history/SessionDetailModal";
import { HistoryInsights } from "@/components/history/HistoryInsights";
import { motion } from "framer-motion";
import { Loader2, BatteryCharging, Plus } from "lucide-react";
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
                // Error handled silently
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
            headers: {
                "Content-Type": "application/json",
                "x-csrf-token": csrfToken
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update");
        fetchHistory(1); // Refresh
        setSelectedSession(null);
    };

    const handleDelete = async (id: string) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();

        const res = await fetch(`/api/history/${id}`, {
            method: "DELETE",
            headers: { "x-csrf-token": csrfToken }
        });
        if (!res.ok) throw new Error("Failed to delete");
        fetchHistory(1); // Refresh
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header title="History" subtitle="Your charging sessions" />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header title="History" subtitle="Your charging sessions" />

            <main className="flex-1 space-y-6 p-4 pb-24 md:p-8 md:pb-8">
                {/* Insights */}
                {insights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <HistoryInsights insights={insights} />
                    </motion.div>
                )}

                {/* Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                >
                    <HistorySummary summary={summary} />
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <HistoryFilters filters={filters} onChange={handleFilterChange} />
                </motion.div>

                {/* Sessions */}
                {sessions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="mb-4 rounded-2xl bg-white/[0.03] p-6">
                            <BatteryCharging className="h-12 w-12 text-zinc-700" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-400">
                            No charging history yet
                        </h3>
                        <p className="mt-1 text-sm text-zinc-600">
                            Start your first charging session to see it here
                        </p>
                        <Link
                            href="/charging"
                            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
                        >
                            <Plus className="h-4 w-4" /> New Session
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="space-y-2"
                    >
                        {sessions.map((session) => (
                            <HistorySessionCard
                                key={session.id}
                                session={session}
                                onClick={() => setSelectedSession(session)}
                            />
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
                                    ) : (
                                        "Load More"
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>

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
