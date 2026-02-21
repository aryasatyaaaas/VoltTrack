"use client";

import { Zap, MapPin, Clock, Plug, Calendar } from "lucide-react";
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

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function HistorySessionCard({ session, onClick }: HistorySessionCardProps) {
    return (
        <button
            onClick={onClick}
            className="group w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.05] active:scale-[0.99]"
        >
            <div className="flex items-start justify-between gap-4">
                {/* Left: Main info */}
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-cyan-500/10 p-1.5">
                            <Zap className="h-3.5 w-3.5 text-cyan-400" />
                        </div>
                        <span className="text-lg font-bold text-white">
                            {session.energyKwh.toFixed(1)} kWh
                        </span>
                        {session.cost !== null && (
                            <span className="text-sm text-zinc-500">
                                · Rp {session.cost.toLocaleString("id-ID")}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(session.durationMinutes)}
                        </span>
                        {session.chargerType && (
                            <span className="flex items-center gap-1">
                                <Plug className="h-3 w-3" />
                                {session.chargerType}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Date */}
                <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-zinc-400">
                        {formatDate(session.sessionDate)}
                    </p>
                    <p className="text-[10px] text-zinc-600">
                        {formatTime(session.sessionDate)}
                    </p>
                </div>
            </div>
        </button>
    );
}
