"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { m } from "framer-motion";
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
        if (!email || !password) { setError("Please fill in all fields"); return; }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const text = await res.text();
            let data: any = {};
            try { data = JSON.parse(text); } catch { setError("Server error. Please try again."); return; }
            if (!res.ok) { setError(data.error || "Invalid email or password"); return; }
            window.location.href = "/dashboard";
        } catch {
            setError("Could not connect to server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative flex min-h-screen items-center justify-center px-4"
            style={{ background: "var(--bg-primary)" }}
        >
            {/* Decorative blob */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full opacity-30"
                style={{
                    background: "radial-gradient(circle, rgba(255,107,53,0.2) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            {/* Back Button */}
            <Link
                href="/"
                className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:scale-[1.02] md:left-8 md:top-8"
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--ink-muted)",
                    boxShadow: "var(--shadow-card)",
                }}
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>

            <m.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 group">
                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl transition-all group-hover:scale-105"
                        style={{ background: "#FF6B35" }}
                    >
                        <Zap className="h-6 w-6 text-white fill-white" />
                    </div>
                    <span className="text-xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                        Volt<span style={{ color: "#FF6B35" }}>Track</span>
                    </span>
                </Link>

                {/* Card */}
                <div
                    className="rounded-2xl p-8"
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
                    }}
                >
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold" style={{ color: "var(--ink)" }}>Welcome back</h1>
                        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>Sign in to your account</p>
                    </div>

                    {error && (
                        <m.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </m.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                                style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border-strong)",
                                    color: "var(--ink)",
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all"
                                    style={{
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border-strong)",
                                        color: "var(--ink)",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: "var(--ink-muted)" }}
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
                                    className="h-3.5 w-3.5 rounded"
                                    style={{ accentColor: "var(--volt-orange)" }}
                                />
                                <span className="text-xs" style={{ color: "var(--ink-muted)" }}>Remember me</span>
                            </label>
                            <a href="#" className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: "var(--volt-orange)" }}>
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                            style={{
                                background: "linear-gradient(135deg, #FF6B35, #FFD93D)",
                                boxShadow: "0 4px 16px rgba(255,107,53,0.3)",
                            }}
                        >
                            {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-bold transition-opacity hover:opacity-70" style={{ color: "var(--volt-orange)" }}>
                            Register
                        </Link>
                    </p>
                </div>
            </m.div>
        </div>
    );
}
