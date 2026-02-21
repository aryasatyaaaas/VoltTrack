"use client";

import { Card } from "@/components/ui/Card";
import { Zap, DollarSign, Hash, Activity } from "lucide-react";
import type { HistorySummaryData } from "@/types";

interface HistorySummaryProps {
    summary: HistorySummaryData;
}

const stats = [
    { key: "totalEnergy", label: "Total Energy", icon: Zap, prefix: "", suffix: "kWh", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { key: "totalCost", label: "Total Cost", icon: DollarSign, prefix: "Rp ", suffix: "", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { key: "totalSessions", label: "Sessions", icon: Hash, prefix: "", suffix: "", color: "text-blue-400", bg: "bg-blue-500/10" },
    { key: "avgEnergy", label: "Avg / Session", icon: Activity, prefix: "", suffix: " kWh", color: "text-purple-400", bg: "bg-purple-500/10" },
] as const;

export function HistorySummary({ summary }: HistorySummaryProps) {
    const values: Record<string, string> = {
        totalEnergy: summary.totalEnergy.toFixed(1),
        totalCost: summary.totalCost.toLocaleString("id-ID"),
        totalSessions: summary.totalSessions.toString(),
        avgEnergy: summary.avgEnergy.toFixed(1),
    };

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.key} className="p-4">
                        <div className="flex items-center gap-2.5">
                            <div className={`rounded-lg ${stat.bg} p-2`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                    {stat.label}
                                </p>
                                <p className="truncate text-lg font-bold text-white">
                                    {stat.prefix}{values[stat.key]}{stat.suffix}
                                </p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
