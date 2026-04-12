"use client";

import { motion } from "framer-motion";
import { Zap, DollarSign, BarChart3 } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Real-time Tracking",
        description: "Monitor every charging session with instant energy consumption tracking and detailed logs from our app.",
        color: "var(--volt-orange)",
        bg: "rgba(255,107,53,0.1)",
        border: "rgba(255,107,53,0.15)",
    },
    {
        icon: DollarSign,
        title: "Cost Analytics",
        description: "Track your spending per kWh, compare home vs public charging costs, and find the cheapest options.",
        color: "var(--volt-teal)",
        bg: "rgba(6,214,160,0.1)",
        border: "rgba(6,214,160,0.15)",
    },
    {
        icon: BarChart3,
        title: "Smart Insights",
        description: "Analytics-powered insights on your vehicle's charging patterns, efficiency trends, and power optimization tips.",
        color: "var(--volt-blue)",
        bg: "rgba(17,138,178,0.1)",
        border: "rgba(17,138,178,0.15)",
    }
];

export function FeaturesGrid() {
    return (
        <section className="relative px-6 py-24" style={{ background: "white" }}>
            <div className="mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--ink)", fontFamily: "var(--font-jakarta)" }}>
                        Everything you need for{" "}
                        <span style={{ color: "var(--volt-orange)" }}>your EV</span>
                    </h2>
                    <p className="mt-4 text-lg" style={{ color: "var(--ink-muted)" }}>
                        Powerful features designed specifically for modern EV owners.
                    </p>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group rounded-2xl border p-8 transition-all hover:-translate-y-1 hover:shadow-xl bg-white"
                                style={{ borderColor: "var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                            >
                                <div className="mb-6 inline-flex rounded-xl p-4 transition-transform group-hover:scale-110" style={{ background: feature.bg, border: `1px solid ${feature.border}` }}>
                                    <Icon className="h-7 w-7" style={{ color: feature.color }} />
                                </div>
                                <h3 className="mb-3 text-lg font-bold" style={{ color: "var(--ink)" }}>
                                    {feature.title}
                                </h3>
                                <p className="text-base leading-relaxed" style={{ color: "var(--ink-muted)" }}>
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
