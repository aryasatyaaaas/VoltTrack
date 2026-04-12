"use client";

import { useEffect, useState } from "react";
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

    const formatIDR = (amount: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

    const formatDate = (dateString: string) =>
        new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(new Date(dateString));

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--ink-muted)" }}>
                    Recent Sessions
                </span>
                <div className="h-px flex-1" style={{ background: "var(--border)" }} />
            </div>

            {loading && sessions.length === 0 ? (
                <div className="flex items-center justify-center py-10" style={{ color: "var(--ink-muted)" }}>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading history...
                </div>
            ) : sessions.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center rounded-3xl py-12 text-center"
                    style={{ background: "white", border: "1px solid var(--border)", color: "var(--ink-muted)" }}
                >
                    <Zap className="mb-3 h-8 w-8 opacity-20" />
                    <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>No charging sessions yet.</p>
                    <p className="mt-1 text-xs">Log your first session above.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {sessions.map((session, i) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ delay: i * 0.06, type: "spring", damping: 20 }}
                                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                            >
                                <div
                                    className="group flex items-center gap-4 rounded-2xl p-4 transition-all"
                                    style={{
                                        background: "white",
                                        border: "1px solid var(--border)",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
                                        cursor: "default",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLDivElement).style.border = "1px solid var(--volt-orange)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.05)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLDivElement).style.border = "1px solid var(--border)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.02)";
                                    }}
                                >
                                    {/* Orange icon */}
                                    <div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                                        style={{ background: "rgba(255,107,53,0.1)" }}
                                    >
                                        <Zap className="h-5 w-5" style={{ color: "var(--volt-orange)" }} />
                                    </div>

                                    {/* Center info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-lg font-bold" style={{ color: "var(--ink)" }}>
                                                {session.energyKwh.toFixed(1)}
                                                <span className="ml-1 text-sm font-medium" style={{ color: "var(--ink-muted)" }}>kWh</span>
                                            </span>
                                            {session.chargerType && (
                                                <span
                                                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                                    style={{
                                                        border: "1px solid rgba(255,107,53,0.3)",
                                                        color: "var(--volt-orange)",
                                                        background: "rgba(255,107,53,0.06)",
                                                    }}
                                                >
                                                    {session.chargerType}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: "var(--ink-muted)" }}>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(session.sessionDate)}
                                            </span>
                                            <span className="flex items-center gap-1 truncate max-w-[160px]">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                {session.location}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: cost + duration */}
                                    <div className="shrink-0 text-right">
                                        {session.cost !== null ? (
                                            <p className="font-bold" style={{ color: "var(--volt-blue)" }}>
                                                {formatIDR(session.cost)}
                                            </p>
                                        ) : (
                                            <p className="text-sm">—</p>
                                        )}
                                        {session.durationMinutes && (
                                            <p className="mt-0.5 flex items-center justify-end gap-1 text-xs" style={{ color: "var(--ink-muted)" }}>
                                                <Clock className="h-3 w-3" />
                                                {session.durationMinutes} min
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
