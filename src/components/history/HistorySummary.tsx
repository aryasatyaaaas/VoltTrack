"use client";

import { Zap, DollarSign, Hash, Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { HistorySummaryData } from "@/types";

interface HistorySummaryProps {
    summary: HistorySummaryData;
}

const stats = [
    {
        key: "totalEnergy",
        label: "Total Energy",
        icon: Zap,
        suffix: " kWh",
        prefix: "",
        accent: "#00E5C3",
        accentBg: "rgba(0,229,195,0.08)",
        accentGlow: "rgba(0,229,195,0.15)",
    },
    {
        key: "totalCost",
        label: "Total Cost",
        icon: DollarSign,
        suffix: "",
        prefix: "Rp ",
        accent: "#F5A623",
        accentBg: "rgba(245,166,35,0.08)",
        accentGlow: "rgba(245,166,35,0.15)",
    },
    {
        key: "totalSessions",
        label: "Sessions",
        icon: Hash,
        suffix: "",
        prefix: "",
        accent: "#a78bfa",
        accentBg: "rgba(167,139,250,0.08)",
        accentGlow: "rgba(167,139,250,0.15)",
    },
    {
        key: "avgEnergy",
        label: "Avg / Session",
        icon: Activity,
        suffix: " kWh",
        prefix: "",
        accent: "#60a5fa",
        accentBg: "rgba(96,165,250,0.08)",
        accentGlow: "rgba(96,165,250,0.15)",
    },
] as const;

export function HistorySummary({ summary }: HistorySummaryProps) {
    const values: Record<string, string> = {
        totalEnergy: summary.totalEnergy.toFixed(1),
        totalCost: summary.totalCost.toLocaleString("id-ID"),
        totalSessions: summary.totalSessions.toString(),
        avgEnergy: summary.avgEnergy.toFixed(1),
    };

    return (
        <div className="space-y-3">
            <p
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "rgba(113,113,122,1)" }}
            >
                Your Journey
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.key}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07, type: "spring", damping: 20 }}
                            className="relative overflow-hidden rounded-2xl p-4"
                            style={{
                                background: "rgba(18,18,22,0.8)",
                                backdropFilter: "blur(16px)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                boxShadow: `0 0 0 1px rgba(255,255,255,0.03) inset, 0 4px 24px rgba(0,0,0,0.3)`,
                            }}
                        >
                            {/* Bottom glow edge */}
                            <div
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl"
                                style={{ background: `linear-gradient(90deg, transparent, ${stat.accent}, transparent)`, opacity: 0.6 }}
                            />
                            {/* Icon */}
                            <div
                                className="mb-3 inline-flex items-center justify-center rounded-xl p-2"
                                style={{ background: stat.accentBg }}
                            >
                                <Icon className="h-4 w-4" style={{ color: stat.accent }} />
                            </div>
                            {/* Number */}
                            <p className="truncate text-2xl font-bold text-white leading-none">
                                {stat.prefix}{values[stat.key]}{stat.suffix}
                            </p>
                            {/* Label */}
                            <p className="mt-1.5 text-[11px] font-medium" style={{ color: "rgba(113,113,122,1)" }}>
                                {stat.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
