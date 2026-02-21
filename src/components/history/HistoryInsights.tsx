"use client";

import { Lightbulb } from "lucide-react";

interface HistoryInsightsProps {
    insights: string[];
}

export function HistoryInsights({ insights }: HistoryInsightsProps) {
    if (insights.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {insights.map((insight, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 rounded-full border border-cyan-500/10 bg-cyan-500/5 px-3 py-1.5 text-xs font-medium text-cyan-300"
                >
                    <Lightbulb className="h-3 w-3 text-cyan-400" />
                    {insight}
                </div>
            ))}
        </div>
    );
}
