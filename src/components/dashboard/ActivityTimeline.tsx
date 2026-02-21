"use client";

import { motion } from "framer-motion";
import { TimelineItem } from "@/types";
import { MapPin, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ActivityTimelineProps {
    items: TimelineItem[];
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-3xl bg-white/[0.02] border border-white/5 p-12 text-center">
                <div className="rounded-full bg-white/5 p-4 text-zinc-600">
                    <Zap className="h-6 w-6" />
                </div>
                <p className="text-zinc-500">There's no charging yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Timeline
            </h3>
            <div className="relative space-y-8 pl-4 before:absolute before:bottom-0 before:left-[19px] before:top-2 before:w-px before:bg-gradient-to-b before:from-white/10 before:to-transparent">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex items-start gap-6"
                    >
                        {/* Timeline Dot */}
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black ring-4 ring-black border border-white/10">
                            <Zap className="h-4 w-4 text-cyan-400" />
                        </div>

                        <div className="flex-1 space-y-1 pt-1">
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-white">
                                    Charged {item.kwh.toFixed(1)} kWh
                                </p>
                                <span className="text-xs font-medium text-zinc-500">
                                    {item.timeAgo}
                                </span>
                            </div>

                            <div className="flex items-center text-sm text-zinc-400">
                                <MapPin className="mr-1.5 h-3.5 w-3.5 text-white/20" />
                                {item.location}
                            </div>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="inline-flex items-center rounded-full bg-white/[0.05] px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                                    {formatCurrency(item.cost)}
                                </span>
                                <span className="text-xs text-zinc-600">
                                    {item.duration} duration
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
