"use client";

import { Zap, MapPin, Clock } from "lucide-react";
import { m } from "framer-motion";
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
        <m.button
            onClick={onClick}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="group w-full text-left"
        >
            <div
                className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200"
                style={{
                    background: "var(--white)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = "1px solid var(--volt-orange)";
                    el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = "1px solid var(--border)";
                    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
                }}
            >
                {/* Orange lightning icon */}
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                        background: "rgba(255,107,53,0.1)",
                    }}
                >
                    <Zap className="h-5 w-5" style={{ color: "var(--volt-orange)" }} />
                </div>

                {/* Center info */}
                <div className="min-w-0 flex-1">
                    {/* Top row: kWh + cost */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-lg font-bold leading-none" style={{ color: "var(--ink)" }}>
                            {session.energyKwh.toFixed(1)}
                            <span className="ml-1 text-sm font-medium" style={{ color: "var(--ink-muted)" }}>kWh</span>
                        </span>
                        {session.cost !== null && (
                            <>
                                <span className="text-sm" style={{ color: "var(--ink-4)" }}>·</span>
                                <span className="text-sm font-bold" style={{ color: "var(--volt-blue)" }}>
                                    Rp {session.cost.toLocaleString("id-ID")}
                                </span>
                            </>
                        )}
                    </div>
                    {/* Bottom row: location, duration, charger badge */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: "var(--ink-muted)" }}>
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
                                    border: "1px solid rgba(255,107,53,0.2)",
                                    color: "var(--volt-orange)",
                                    background: "rgba(255,107,53,0.05)",
                                }}
                            >
                                {session.chargerType}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: time only */}
                <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
                        {formatTime(session.sessionDate)}
                    </p>
                </div>
            </div>
        </m.button>
    );
}
