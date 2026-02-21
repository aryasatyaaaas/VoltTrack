"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PersonalHeroProps {
    greeting: string;
    kwh: number;
    insight: string;
    trendPercentage: number;
}

export function PersonalHero({ greeting, kwh, insight, trendPercentage }: PersonalHeroProps) {
    const isHighUsage = trendPercentage > 15;
    const isEfficient = trendPercentage < -5;

    return (
        <div className="relative overflow-hidden p-8 md:p-12">
            {/* Subtle ambient glow based on status */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn(
                    "absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl",
                    isHighUsage ? "bg-red-500" : isEfficient ? "bg-emerald-500" : "bg-blue-500"
                )}
            />

            <div className="relative z-10 space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl font-medium text-zinc-400"
                >
                    {greeting}
                </motion.h1>

                <div className="space-y-2">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-semibold tracking-tight text-white md:text-5xl"
                    >
                        You used <span className={isHighUsage ? "text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]" : "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"}>{kwh.toFixed(1)} kWh</span> this week.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className={cn(
                            "text-lg font-medium",
                            isHighUsage ? "text-red-400/80" : "text-cyan-400/80"
                        )}
                    >
                        {insight}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
