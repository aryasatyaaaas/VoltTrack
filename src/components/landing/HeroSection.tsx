"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, DollarSign } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-20">
            {/* Ambient background effects */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
                <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/[0.05] blur-[100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Left: Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-center lg:text-left"
                    >
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-400">
                            <Zap className="h-3.5 w-3.5" />
                            Smart EV Charging Tracker
                        </div>

                        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Track Your EV Charging.{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                Smarter.
                            </span>
                        </h1>

                        <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400 sm:text-xl">
                            Monitor energy, cost, and efficiency in real-time.
                            Your personal EV charging companion.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95"
                            >
                                Get Started Free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/[0.06] active:scale-95"
                            >
                                Login
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right: Dashboard Preview Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
                            {/* Mini dashboard mockup */}
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                                <span className="ml-2 text-xs text-zinc-600">VoltTrack Dashboard</span>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: Zap, label: "This Week", value: "134 kWh", color: "text-cyan-400" },
                                    { icon: DollarSign, label: "Cost", value: "Rp 779K", color: "text-emerald-400" },
                                    { icon: TrendingUp, label: "Trend", value: "+12.5%", color: "text-blue-400" },
                                ].map((stat) => (
                                    <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                                        <stat.icon className={`mb-1.5 h-4 w-4 ${stat.color}`} />
                                        <p className="text-[10px] text-zinc-500">{stat.label}</p>
                                        <p className="text-sm font-bold text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Fake Chart Area */}
                            <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                <p className="mb-3 text-xs font-medium text-zinc-500">WEEKLY TREND</p>
                                <div className="flex items-end gap-2 h-24">
                                    {[40, 55, 35, 70, 50, 85, 65].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                                            className="flex-1 rounded-t-md bg-gradient-to-t from-cyan-500/30 to-cyan-500/60"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Glow effect behind card */}
                        <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 blur-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
