"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function Navbar() {
    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#0F0F12]/80 backdrop-blur-xl"
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00E5C3]/15 ring-1 ring-[#00E5C3]/30 transition-all group-hover:bg-[#00E5C3]/25">
                        <Zap className="h-5 w-5 text-[#00E5C3] fill-[#00E5C3]" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-white">
                        Volt<span className="text-[#00E5C3]">Track</span>
                    </span>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-[#00E5C3]"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-xl bg-gradient-to-r from-[#00E5C3] to-[#0066FF] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#00E5C3]/20 transition-all hover:shadow-[#00E5C3]/30 hover:scale-[1.02] active:scale-95"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
