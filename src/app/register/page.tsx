"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
    if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
    if (score <= 4) return { score: 4, label: "Strong", color: "bg-emerald-500" };
    return { score: 5, label: "Very Strong", color: "bg-[#00E5C3]" };
}

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const strength = useMemo(() => getPasswordStrength(password), [password]);

    // Inline validation
    const emailValid = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordMatch = confirmPassword === "" || password === confirmPassword;
    const passwordLong = password === "" || password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }
        if (!emailValid) {
            setError("Please enter a valid email");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                return;
            }

            // Auto-login after registration
            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (loginRes.ok) {
                router.push("/dashboard");
            } else {
                router.push("/login");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
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
                        <h1 className="text-2xl font-bold text-white">Create your account</h1>
                        <p className="mt-1 text-sm text-zinc-500">Start tracking your EV charging</p>
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
                        {/* Full Name */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-[#00E5C3]/50 focus:bg-white/[0.05]"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:bg-white/[0.05] ${!emailValid ? "border-red-500/50" : "border-white/[0.08] focus:border-[#00E5C3]/50"
                                    }`}
                            />
                            {!emailValid && (
                                <p className="mt-1 text-xs text-red-400">Please enter a valid email</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:bg-white/[0.05] ${!passwordLong ? "border-red-500/50" : "border-white/[0.08] focus:border-[#00E5C3]/50"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-400"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {/* Password Strength */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-colors ${level <= strength.score ? strength.color : "bg-white/10"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Strength: <span className="text-zinc-400">{strength.label}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Confirm Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                className={`w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:bg-white/[0.05] ${!passwordMatch ? "border-red-500/50" : "border-white/[0.08] focus:border-[#00E5C3]/50"
                                    }`}
                            />
                            {confirmPassword && (
                                <div className="mt-1 flex items-center gap-1">
                                    {passwordMatch ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                                    )}
                                    <span className={`text-xs ${passwordMatch ? "text-emerald-400" : "text-red-400"}`}>
                                        {passwordMatch ? "Passwords match" : "Passwords do not match"}
                                    </span>
                                </div>
                            )}
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
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-zinc-600">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-[#00E5C3] transition-colors hover:text-[#00E5C3]/80">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
