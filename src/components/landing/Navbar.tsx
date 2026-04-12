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
            className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-xl"
            style={{ borderColor: "var(--border)" }}
        >
            <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl transition-all group-hover:scale-105"
                        style={{ background: "#FF6B35" }}
                    >
                        <Zap className="h-5 w-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                        Volt<span style={{ color: "#FF6B35" }}>Track</span>
                    </span>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="rounded-lg px-4 py-2 text-[15px] font-bold transition-colors"
                        style={{ color: "var(--ink-muted)" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--volt-orange)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--ink-muted)"}
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-xl px-6 py-2.5 text-[15px] font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #FF6B35, #FFD93D)", boxShadow: "0 4px 12px rgba(255,107,53,0.2)" }}
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
