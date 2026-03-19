"use client";

import { motion } from "framer-motion";
import { Zap, DollarSign, BarChart3, CalendarDays } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Real-time Tracking",
        description: "Monitor every charging session with live energy consumption tracking and detailed logging.",
        color: "text-[#00E5C3]",
        bg: "bg-[#00E5C3]/10",
        border: "border-[#00E5C3]/20",
    },
    {
        icon: DollarSign,
        title: "Cost Analytics",
        description: "Track spending per kWh, compare home vs public charging costs, and find the cheapest options.",
        color: "text-[#F5A623]",
        bg: "bg-[#F5A623]/10",
        border: "border-[#F5A623]/20",
    },
    {
        icon: BarChart3,
        title: "Smart Insights",
        description: "AI-powered insights about your charging patterns, efficiency trends, and optimization tips.",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
    },
    {
        icon: CalendarDays,
        title: "Charging History",
        description: "Complete history with filters, search, and detailed breakdowns of every session.",
        color: "text-[#00E5C3]",
        bg: "bg-[#00E5C3]/10",
        border: "border-[#00E5C3]/20",
    },
];

export function FeaturesGrid() {
    return (
        <section className="relative px-6 py-24">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Everything you need to{" "}
                        <span className="text-[#00E5C3]">manage your EV</span>
                    </h2>
                    <p className="mt-4 text-lg text-zinc-500">
                        Powerful features designed for EV owners who want full control.
                    </p>
                </motion.div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`group rounded-2xl border ${feature.border} bg-white/[0.03] p-6 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/[0.12]`}
                            >
                                <div className={`mb-4 inline-flex rounded-xl ${feature.bg} p-3`}>
                                    <Icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <h3 className="mb-2 text-base font-semibold text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-zinc-500">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
