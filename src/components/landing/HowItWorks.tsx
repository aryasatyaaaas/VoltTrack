"use client";

import { motion } from "framer-motion";
import { Plus, BarChart3, Lightbulb } from "lucide-react";

const steps = [
    {
        num: "01",
        icon: Plus,
        title: "Add Your Session",
        description: "Log your charging session with energy, cost, location, and charger type.",
        color: "from-[#00E5C3] to-[#0066FF]",
    },
    {
        num: "02",
        icon: BarChart3,
        title: "Track Usage & Cost",
        description: "See real-time dashboards with weekly trends, cost breakdowns, and energy stats.",
        color: "from-[#0066FF] to-blue-700",
    },
    {
        num: "03",
        icon: Lightbulb,
        title: "Get Smart Insights",
        description: "Receive AI-powered tips to optimize charging habits and reduce costs.",
        color: "from-[#F5A623] to-amber-600",
    },
];

export function HowItWorks() {
    return (
        <section className="relative px-6 py-24">
            {/* Background accent */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E5C3]/[0.03] blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        How it works
                    </h2>
                    <p className="mt-4 text-lg text-zinc-500">
                        Three simple steps to smarter EV charging.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connection line (desktop) */}
                    <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent md:block" />

                    <div className="grid gap-8 md:grid-cols-3 md:gap-12">
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
                                    {/* Step number */}
                                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
                                        <div className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br ${step.color}`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                    </div>

                                    <span className="mb-2 block text-xs font-bold text-zinc-600">
                                        STEP {step.num}
                                    </span>
                                    <h3 className="mb-2 text-lg font-semibold text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-zinc-500">
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
