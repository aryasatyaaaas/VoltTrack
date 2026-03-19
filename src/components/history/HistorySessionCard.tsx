"use client";

import { Zap, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { HistorySession } from "@/types";

interface HistorySessionCardProps {
    session: HistorySession;
    onClick: () => void;
}

function formatDuration(minutes: number | null): string {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function HistorySessionCard({ session, onClick }: HistorySessionCardProps) {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="group w-full text-left"
        >
            <div
                className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200"
                style={{
                    background: "rgba(20,20,26,0.75)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = "1px solid rgba(0,229,195,0.14)";
                    el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,229,195,0.06) inset";
                    el.style.background = "rgba(24,24,32,0.9)";
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = "1px solid rgba(255,255,255,0.05)";
                    el.style.boxShadow = "0 2px 16px rgba(0,0,0,0.25)";
                    el.style.background = "rgba(20,20,26,0.75)";
                }}
            >
                {/* Teal lightning icon */}
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                        background: "rgba(0,229,195,0.1)",
                        boxShadow: "0 0 16px rgba(0,229,195,0.18)",
                    }}
                >
                    <Zap className="h-5 w-5" style={{ color: "#00E5C3" }} />
                </div>

                {/* Center info */}
                <div className="min-w-0 flex-1">
                    {/* Top row: kWh + cost */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-lg font-bold text-white leading-none">
                            {session.energyKwh.toFixed(1)}
                            <span className="ml-1 text-sm font-medium text-zinc-500">kWh</span>
                        </span>
                        {session.cost !== null && (
                            <>
                                <span className="text-zinc-600 text-sm">·</span>
                                <span className="text-sm font-bold" style={{ color: "#F5A623" }}>
                                    Rp {session.cost.toLocaleString("id-ID")}
                                </span>
                            </>
                        )}
                    </div>
                    {/* Bottom row: location, duration, charger badge */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: "rgba(113,113,122,1)" }}>
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {session.location}
                        </span>
                        {session.durationMinutes && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(session.durationMinutes)}
                            </span>
                        )}
                        {session.chargerType && (
                            <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                style={{
                                    border: "1px solid rgba(0,229,195,0.25)",
                                    color: "#00E5C3",
                                    background: "rgba(0,229,195,0.06)",
                                }}
                            >
                                {session.chargerType}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: time only */}
                <div className="shrink-0 text-right">
                    <p className="text-sm font-medium" style={{ color: "rgba(113,113,122,1)" }}>
                        {formatTime(session.sessionDate)}
                    </p>
                </div>
            </div>
        </motion.button>
    );
}
