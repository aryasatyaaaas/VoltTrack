"use client";

import { motion } from "framer-motion";
import { Zap, Wallet, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HighlightCardsProps {
    kwh: number;
    cost: number;
    topLocation: string;
}

const cards = (kwh: number, cost: number, topLocation: string) => [
    {
        id: "kwh",
        icon: Zap,
        iconColor: "#00E5C3",
        iconBg: "rgba(0,229,195,0.12)",
        glowColor: "rgba(0,229,195,0.1)",
        value: `${kwh.toFixed(1)} kWh`,
        label: "Total Energy",
        valueColor: "#00E5C3",
    },
    {
        id: "cost",
        icon: Wallet,
        iconColor: "#F5A623",
        iconBg: "rgba(245,166,35,0.12)",
        glowColor: "rgba(245,166,35,0.1)",
        value: formatCurrency(cost),
        label: "Total Cost",
        valueColor: "#F5A623",
    },
    {
        id: "location",
        icon: MapPin,
        iconColor: "#00E5C3",
        iconBg: "rgba(0,229,195,0.12)",
        glowColor: "rgba(0,229,195,0.08)",
        value: topLocation || "—",
        label: "Most Used",
        valueColor: "#ffffff",
    },
];

export function HighlightCards({ kwh, cost, topLocation }: HighlightCardsProps) {
    const items = cards(kwh, cost, topLocation);

    return (
        <div className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-600">
                This Week&apos;s Highlights
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {items.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                            className="glass-card group flex flex-col items-start gap-3 rounded-2xl p-4 transition-all duration-300 cursor-default sm:gap-4 sm:p-5"
                            style={{
                                ["--glow" as string]: card.glowColor,
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow =
                                    `0 0 28px ${card.glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = "";
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ background: card.iconBg }}
                            >
                                <Icon className="h-5 w-5" style={{ color: card.iconColor }} />
                            </div>

                            {/* Stat */}
                            <div>
                                <p
                                    className="text-xl font-bold leading-tight tracking-tight"
                                    style={{ color: card.valueColor }}
                                >
                                    {card.value}
                                </p>
                                <p className="mt-1 text-xs font-medium text-zinc-500">
                                    {card.label}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
