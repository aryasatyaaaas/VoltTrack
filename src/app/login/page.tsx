"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            // Read as text first to avoid JSON parse errors on HTML error pages
            const text = await res.text();
            let data: any = {};
            try {
                data = JSON.parse(text);
            } catch {
                // Server returned non-JSON (e.g. HTML error page)
                setError("Server error. Please try again later.");
                return;
            }

            if (!res.ok) {
                setError(data.error || "Invalid email or password");
                return;
            }

            // Force a hard navigation so middleware picks up the new cookie correctly
            window.location.href = "/dashboard";
        } catch {
            setError("Could not connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#00E5C3]/[0.05] blur-[120px]" />
            </div>

            {/* Back Button */}
            <Link
                href="/"
                className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-400 backdrop-blur-md transition-all hover:bg-white/10 hover:text-[#00E5C3] md:left-8 md:top-8"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 group">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00E5C3]/15 ring-1 ring-[#00E5C3]/30 transition-all group-hover:bg-[#00E5C3]/25">
                        <Zap className="h-6 w-6 text-[#00E5C3] fill-[#00E5C3]" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                        Volt<span className="text-[#00E5C3]">Track</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/80 backdrop-blur-xl ring-1 ring-white/10">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
                        <p className="mt-1 text-sm text-zinc-500">Sign in to your account</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-[#00E5C3]/50 focus:bg-white/[0.05]"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-[#00E5C3]/50 focus:bg-white/[0.05]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-400"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-[#00E5C3] accent-[#00E5C3]"
                                />
                                <span className="text-xs text-zinc-500">Remember me</span>
                            </label>
                            <a href="#" className="text-xs text-[#00E5C3] transition-colors hover:text-[#00E5C3]/80">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-[#00E5C3] to-[#0066FF] py-3 text-sm font-semibold text-white shadow-lg shadow-[#00E5C3]/20 transition-all hover:shadow-[#00E5C3]/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-600">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-medium text-[#00E5C3] transition-colors hover:text-[#00E5C3]/80">
                            Register
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
