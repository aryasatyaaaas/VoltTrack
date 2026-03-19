"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, Zap, Wallet, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { TimelineItem } from "@/types";

interface ActivityTimelineProps {
    items: TimelineItem[];
}

function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 glass-card rounded-3xl p-14 text-center">
                <div className="rounded-full p-4" style={{ background: "rgba(0,229,195,0.08)" }}>
                    <Zap className="h-6 w-6 text-[#00E5C3]" />
                </div>
                <p className="text-zinc-500 text-sm">No charging sessions yet — time to plug in!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
                    Recent Sessions
                </h2>
                <Link
                    href="/history"
                    className="text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "#00E5C3" }}
                >
                    View All
                </Link>
            </div>

            {/* Session cards */}
            <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-card group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] md:gap-4 md:px-5 md:py-4"
                    >
                        {/* Location icon */}
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: "rgba(0,229,195,0.08)" }}
                        >
                            <MapPin className="h-5 w-5 text-[#00E5C3]" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-white text-xs md:text-sm">
                                {item.location}
                            </p>
                            <p className="mt-0.5 text-[10px] text-zinc-500 md:text-xs">
                                {formatDateTime(item.date)}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="hidden flex-col items-end sm:flex">
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                <Clock className="h-3 w-3" />
                                <span>{item.duration}</span>
                            </div>
                        </div>

                        {/* kWh */}
                        <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-bold md:text-sm" style={{ color: "#00E5C3" }}>
                                {item.kwh.toFixed(1)} kWh
                            </span>
                            <span className="text-[10px] text-zinc-600">energy</span>
                        </div>

                        {/* Cost */}
                        <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-bold md:text-sm" style={{ color: "#F5A623" }}>
                                {formatCurrency(item.cost)}
                            </span>
                            <span className="text-[10px] text-zinc-600">cost</span>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-500" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
