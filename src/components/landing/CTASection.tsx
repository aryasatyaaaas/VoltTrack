"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export function CTASection() {
    return (
        <section className="relative px-6 py-24">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E5C3]/[0.05] blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative mx-auto max-w-2xl text-center"
            >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00E5C3]/15 ring-1 ring-[#00E5C3]/30">
                    <Zap className="h-8 w-8 text-[#00E5C3] fill-[#00E5C3]" />
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
                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00E5C3] to-[#0066FF] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#00E5C3]/20 transition-all hover:shadow-[#00E5C3]/30 hover:scale-[1.02] active:scale-95"
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
