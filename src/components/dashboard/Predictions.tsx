"use client";

import { Card } from "@/components/ui/Card";
import { CalendarClock, DollarSign, Repeat } from "lucide-react";
import type { DashboardData } from "@/types";

interface PredictionsProps {
    predictions: DashboardData["predictions"];
}

export function Predictions({ predictions }: PredictionsProps) {
    const cards = [
        {
            icon: CalendarClock,
            label: "Next Charging",
            value: predictions.nextChargingDay || "No data",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
        },
        {
            icon: Repeat,
            label: "Avg Frequency",
            value: predictions.avgGapDays !== null
                ? `Every ${predictions.avgGapDays} day${predictions.avgGapDays > 1 ? "s" : ""}`
                : "Not enough history",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },

        {
            icon: DollarSign,
            label: "Weekly Est. Cost",
            value: `Rp ${predictions.weeklyProjectedCost.toLocaleString("id-ID")}`,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <Card key={card.label} className="p-4">
                        <div className="space-y-2">
                            <div className={`w-fit rounded-lg ${card.bg} p-1.5`}>
                                <Icon className={`h-3.5 w-3.5 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                                    {card.label}
                                </p>
                                <p className="text-sm font-bold text-white">{card.value}</p>
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
