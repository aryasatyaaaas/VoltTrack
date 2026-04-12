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
        accent: "#FF6B35",
        accentBg: "rgba(255,107,53,0.1)",
        accentBorder: "#FF6B35",
    },
    {
        key: "totalCost",
        label: "Total Cost",
        icon: DollarSign,
        suffix: "",
        prefix: "Rp ",
        accent: "#06D6A0",
        accentBg: "rgba(6,214,160,0.1)",
        accentBorder: "#06D6A0",
    },
    {
        key: "totalSessions",
        label: "Sessions",
        icon: Hash,
        suffix: "",
        prefix: "",
        accent: "#118AB2",
        accentBg: "rgba(17,138,178,0.1)",
        accentBorder: "#118AB2",
    },
    {
        key: "avgEnergy",
        label: "Avg / Session",
        icon: Activity,
        suffix: " kWh",
        prefix: "",
        accent: "#7B5EA7",
        accentBg: "rgba(123,94,167,0.1)",
        accentBorder: "#7B5EA7",
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
                style={{ color: "var(--ink-muted)" }}
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
                            className="volt-card relative min-w-0 overflow-hidden rounded-2xl p-3 sm:p-4 transition-all duration-200"
                            style={{
                                borderTop: `3px solid ${stat.accentBorder}`,
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="mb-3 inline-flex items-center justify-center rounded-xl p-2"
                                style={{ background: stat.accentBg }}
                            >
                                <Icon className="h-4 w-4" style={{ color: stat.accent }} />
                            </div>

                            {/* Number */}
                            <p
                                className="w-full break-words font-extrabold leading-tight text-lg sm:text-xl"
                                style={{
                                    color: "var(--ink)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {stat.prefix}{values[stat.key]}{stat.suffix}
                            </p>

                            {/* Label */}
                            <p
                                className="mt-1 text-[11px] font-medium"
                                style={{ color: "var(--ink-muted)" }}
                            >
                                {stat.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
