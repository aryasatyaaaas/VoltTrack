"use client";

import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface HistoryInsightsProps {
    insights: string[];
}

export function HistoryInsights({ insights }: HistoryInsightsProps) {
    if (insights.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2.5">
            {insights.map((insight, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                    style={{
                        background: "rgba(0,229,195,0.06)",
                        border: "1px solid rgba(0,229,195,0.18)",
                        color: "#a0f0e4",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <Lightbulb className="h-3 w-3 shrink-0" style={{ color: "#00E5C3" }} />
                    {insight}
                </motion.div>
            ))}
        </div>
    );
}
