"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
    return (
        <section className="relative px-6 py-24" style={{ background: "var(--bg-secondary)" }}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[120px]" style={{ background: "var(--volt-orange)" }} />
            </div>

            <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative mx-auto max-w-2xl text-center"
            >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(255,107,53,0.1)" }}>
                    <Zap className="h-8 w-8" style={{ color: "var(--volt-orange)" }} fill="currentColor" />
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ color: "var(--ink)", fontFamily: "var(--font-jakarta)" }}>
                    Start tracking your EV today
                </h2>
                <p className="mt-4 text-lg" style={{ color: "var(--ink-muted)" }}>
                    Join the smart EV revolution. Free, private, and secure.
                </p>

                <div className="mt-10">
                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #FF6B35, #FFD93D)", boxShadow: "0 8px 24px rgba(255,107,53,0.2)" }}
                    >
                        Create Free Account
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>


            </m.div>
        </section>
    );
}
