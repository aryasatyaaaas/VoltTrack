"use client";

import { motion } from "framer-motion";
import { Plus, BarChart3, Lightbulb } from "lucide-react";

const steps = [
    {
        num: "01",
        icon: Plus,
        title: "Log Your Session",
        description: "Record every charging session with energy, cost, location, and charger type details.",
        color: "linear-gradient(135deg, #FF6B35, #FFD93D)",
    },
    {
        num: "02",
        icon: BarChart3,
        title: "Track Usage",
        description: "Monitor weekly trends, cost summaries, and real-time energy statistics.",
        color: "linear-gradient(135deg, #06D6A0, #118AB2)",
    },
    {
        num: "03",
        icon: Lightbulb,
        title: "Gain Insights",
        description: "Get analytics-driven tips to optimize your charging habits.",
        color: "linear-gradient(135deg, #FFD93D, #FF6B35)",
    },
];

export function HowItWorks() {
    return (
        <section className="relative px-6 py-24" style={{ background: "white" }}>
            {/* Background accent */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[120px]" style={{ background: "var(--volt-teal)" }} />
            </div>

            <div className="relative mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--ink)", fontFamily: "var(--font-jakarta)" }}>
                        How it works
                    </h2>
                    <p className="mt-4 text-lg" style={{ color: "var(--ink-muted)" }}>
                        Three easy steps to smarter EV charging control.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connection line (desktop) */}
                    <div className="absolute left-0 right-0 top-16 hidden h-[2px] md:block" style={{ background: "linear-gradient(to right, transparent, rgba(26,26,46,0.1), transparent)" }} />

                    <div className="grid gap-12 md:grid-cols-3">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.num}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="relative text-center"
                                >
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ring-[6px]" style={{ background: "white", "--tw-ring-color": "rgba(255,255,255,0.8)" } as React.CSSProperties}>
                                        <div className="flex h-full w-full items-center justify-center rounded-2xl" style={{ background: step.color }}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                    </div>

                                    <span className="mb-2 block text-xs font-extrabold uppercase tracking-widest" style={{ color: "var(--volt-orange)" }}>
                                        STEP {step.num}
                                    </span>
                                    <h3 className="mb-3 text-xl font-bold" style={{ color: "var(--ink)" }}>
                                        {step.title}
                                    </h3>
                                    <p className="text-base leading-relaxed p-4" style={{ color: "var(--ink-muted)" }}>
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
