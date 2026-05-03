"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, Zap, BatteryCharging, ChartBar } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16 text-center">
            {/* Ambient Background Gradient Mesh */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]" style={{ background: "radial-gradient(circle, var(--volt-yellow) 0%, transparent 60%)" }} />
                <div className="absolute right-0 top-1/4 h-[500px] w-[600px] rounded-full opacity-15 blur-[120px]" style={{ background: "radial-gradient(circle, var(--volt-orange) 0%, transparent 70%)" }} />
                <div className="absolute left-0 bottom-0 h-[400px] w-[500px] rounded-full opacity-10 blur-[100px]" style={{ background: "radial-gradient(circle, var(--volt-teal) 0%, transparent 70%)" }} />
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
                    style={{ background: "rgba(255, 107, 53, 0.1)", color: "var(--volt-orange)" }}
                >
                    <Zap className="h-4 w-4" fill="currentColor" />
                    Smart Energy for the Future
                </m.div>

                <m.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
                    style={{ color: "var(--ink)", fontFamily: "var(--font-jakarta)" }}
                >
                    Track Your EV Charging.<br />
                    <span style={{ color: "var(--volt-orange)" }}>Smarter.</span>
                </m.h1>

                <m.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 max-w-xl text-lg md:text-xl leading-relaxed"
                    style={{ color: "var(--ink-muted)" }}
                >
                    Monitor energy, track costs, and optimize your EV charging instantly — no fuss.
                </m.p>

                <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 gap-4 flex flex-col sm:flex-row w-full sm:w-auto"
                >
                    <Link
                        href="/register"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:scale-105 sm:w-auto"
                        style={{ background: "linear-gradient(135deg, #FF6B35, #FFD93D)", boxShadow: "0 8px 24px rgba(255,107,53,0.3)" }}
                    >
                        Start for Free
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </m.div>

                {/* Dashboard Previews or Stat Cards Array */}
                <m.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {[
                        { title: "Total Charges", val: "142.5 kWh", icon: BatteryCharging, color: "var(--volt-orange)", bg: "rgba(255,107,53,0.1)" },
                        { title: "Efficiency", val: "94%", icon: Zap, color: "var(--volt-teal)", bg: "rgba(6,214,160,0.1)" },
                        { title: "Cost Saved", val: "Rp 320k", icon: ChartBar, color: "var(--volt-blue)", bg: "rgba(17,138,178,0.1)" }
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center p-6 border rounded-2xl shadow-sm hover:shadow-md transition-shadow" style={{ background: "var(--white)", borderColor: "var(--border)" }}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full mb-4" style={{ background: stat.bg, color: stat.color }}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "var(--ink-muted)" }}>{stat.title}</h3>
                            <p className="text-2xl font-extrabold" style={{ color: "var(--ink)", fontFamily: "var(--font-jakarta)" }}>{stat.val}</p>
                        </div>
                    ))}
                </m.div>
            </div>
        </section>
    );
}
