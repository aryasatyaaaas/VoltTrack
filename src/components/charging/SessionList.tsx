"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Zap, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Session {
    id: string;
    energyKwh: number;
    sessionDate: string;
    location: string;
    cost: number | null;
    chargerType: string | null;
    durationMinutes: number | null;
}

interface SessionListProps {
    refreshTrigger: number;
}

export function SessionList({ refreshTrigger }: SessionListProps) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, [refreshTrigger]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/sessions?limit=5");
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (e) {
            console.error("Failed to fetch sessions", e);
        } finally {
            setLoading(false);
        }
    };

    const formatIDR = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    };

    if (loading && sessions.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 text-zinc-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading history...
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center text-zinc-500">
                <Zap className="mb-3 h-8 w-8 opacity-20" />
                <p>There's no charging yet.</p>
                <p className="text-xs">Your charging history will appear here once you log a session.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Recent Sessions
            </h3>
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {sessions.map((session, i) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className="glass-panel group relative flex flex-col gap-3 p-4 transition-colors hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-lg font-bold text-white">
                                                {session.energyKwh.toFixed(1)} <span className="text-sm font-medium text-zinc-500">kWh</span>
                                            </p>
                                            {session.chargerType && (
                                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                                                    {session.chargerType}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> {formatDate(session.sessionDate)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {session.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                                    <div className="sm:hidden text-xs text-zinc-500">Cost & Duration</div>
                                    <div>
                                        {session.cost !== null ? (
                                            <p className="font-medium text-emerald-400">{formatIDR(session.cost)}</p>
                                        ) : (
                                            <p className="text-sm text-zinc-600">-</p>
                                        )}
                                        {session.durationMinutes && (
                                            <p className="flex items-center justify-end gap-1 text-xs text-zinc-500">
                                                <Clock className="h-3 w-3" /> {session.durationMinutes} min
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
