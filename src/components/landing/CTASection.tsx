"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
    return (
        <section className="relative px-6 py-24">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative mx-auto max-w-2xl text-center"
            >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                    <Zap className="h-8 w-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Start tracking your EV today
                </h2>
                <p className="mt-4 text-lg text-zinc-400">
                    Join the smart EV revolution. Free, private, and self-hosted.
                </p>

                <div className="mt-10">
                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95"
                    >
                        Create Free Account
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <p className="mt-4 text-xs text-zinc-600">
                    No credit card • Self-hosted • 100% free
                </p>
            </motion.div>
        </section>
    );
}
