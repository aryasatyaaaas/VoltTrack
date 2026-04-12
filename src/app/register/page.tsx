"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak",        color: "#EF476F" };
    if (score <= 2) return { score: 2, label: "Fair",        color: "#FF6B35" };
    if (score <= 3) return { score: 3, label: "Good",        color: "#FFD93D" };
    if (score <= 4) return { score: 4, label: "Strong",      color: "#06D6A0" };
    return          { score: 5, label: "Very Strong",        color: "#118AB2" };
}

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName]                     = useState("");
    const [email, setEmail]                   = useState("");
    const [password, setPassword]             = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword]     = useState(false);
    const [error, setError]                   = useState("");
    const [loading, setLoading]               = useState(false);

    const strength     = useMemo(() => getPasswordStrength(password), [password]);
    const emailValid   = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordMatch = confirmPassword === "" || password === confirmPassword;
    const passwordLong  = password === "" || password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }
        if (!emailValid) {
            setError("Invalid email format");
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
        <div style={{
            minHeight: "100vh",
            background: "var(--surface, #F5F4F0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
            {/* Back */}
            <Link
                href="/"
                style={{
                    position: "absolute", top: 20, left: 20,
                    display: "flex", alignItems: "center", gap: 6,
                    fontSize: 13, fontWeight: 500,
                    color: "var(--muted, #888780)",
                    textDecoration: "none",
                    background: "var(--white, #fff)",
                    border: "0.5px solid var(--border, rgba(26,26,46,0.09))",
                    borderRadius: 100,
                    padding: "6px 14px",
                    transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = "#FF6B35";
                    (e.currentTarget as HTMLElement).style.borderColor = "#FF6B35";
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = "var(--muted, #888780)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border, rgba(26,26,46,0.09))";
                }}
            >
                <ArrowLeft size={14} />
                Back
            </Link>

            <div style={{ width: "100%", maxWidth: 440 }}>
                {/* Logo */}
                <Link href="/" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 10, marginBottom: 28, textDecoration: "none",
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: "#FF6B35",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Zap size={20} color="#fff" fill="#fff" />
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "var(--ink, #1A1A2E)", letterSpacing: "-0.3px" }}>
                        Volt<span style={{ color: "#FF6B35" }}>Track</span>
                    </span>
                </Link>

                {/* Card */}
                <div style={{
                    background: "var(--white, #fff)",
                    border: "0.5px solid var(--border, rgba(26,26,46,0.09))",
                    borderRadius: 20,
                    padding: "32px 32px 28px",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(26,26,46,0.04)",
                }}>
                    <div style={{ marginBottom: 24, textAlign: "center" }}>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink, #1A1A2E)", margin: 0, letterSpacing: "-0.3px" }}>
                            Create your account
                        </h1>
                        <p style={{ fontSize: 13, color: "var(--muted, #888780)", marginTop: 6, marginBottom: 0 }}>
                            Start tracking your EV charging
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            background: "rgba(239,71,111,0.08)",
                            border: "0.5px solid rgba(239,71,111,0.25)",
                            borderRadius: 10, padding: "10px 14px",
                            marginBottom: 16,
                            fontSize: 13, color: "#C0392B",
                        }}>
                            <AlertCircle size={15} style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* Nama */}
                        <Field label="Full Name">
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                                style={inputStyle()}
                                onFocus={e => applyFocusStyle(e.currentTarget)}
                                onBlur={e => removeFocusStyle(e.currentTarget)}
                            />
                        </Field>

                        {/* Email */}
                        <Field label="Email" hint={!emailValid ? "Invalid email format" : undefined} hintType="error">
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={inputStyle(!emailValid)}
                                onFocus={e => applyFocusStyle(e.currentTarget, !emailValid)}
                                onBlur={e => removeFocusStyle(e.currentTarget, !emailValid)}
                            />
                        </Field>

                        {/* Password */}
                        <Field label="Password" hint={!passwordLong ? "Min. 6 characters" : undefined} hintType="error">
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    style={{ ...inputStyle(!passwordLong), paddingRight: 44 }}
                                    onFocus={e => applyFocusStyle(e.currentTarget, !passwordLong)}
                                    onBlur={e => removeFocusStyle(e.currentTarget, !passwordLong)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute", right: 12, top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none", border: "none",
                                        cursor: "pointer", color: "var(--muted, #888780)",
                                        display: "flex", alignItems: "center", padding: 0,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Strength bars */}
                            {password && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        {[1, 2, 3, 4, 5].map(level => (
                                            <div key={level} style={{
                                                flex: 1, height: 3, borderRadius: 2,
                                                background: level <= strength.score ? strength.color : "rgba(26,26,46,0.1)",
                                                transition: "background 0.2s",
                                            }} />
                                        ))}
                                    </div>
                                    <p style={{ marginTop: 4, fontSize: 11, color: "var(--muted, #888780)" }}>
                                        Strength: <span style={{ color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                                    </p>
                                </div>
                            )}
                        </Field>

                        {/* Confirm Password */}
                        <Field label="Confirm Password">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                style={inputStyle(!passwordMatch && confirmPassword !== "")}
                                onFocus={e => applyFocusStyle(e.currentTarget, !passwordMatch && confirmPassword !== "")}
                                onBlur={e => removeFocusStyle(e.currentTarget, !passwordMatch && confirmPassword !== "")}
                            />
                            {confirmPassword && (
                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                                    {passwordMatch
                                        ? <CheckCircle2 size={13} color="#06D6A0" />
                                        : <AlertCircle size={13} color="#EF476F" />
                                    }
                                    <span style={{ fontSize: 11, color: passwordMatch ? "#06D6A0" : "#EF476F", fontWeight: 500 }}>
                                        {passwordMatch ? "Passwords match" : "Passwords do not match"}
                                    </span>
                                </div>
                            )}
                        </Field>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: 4,
                                width: "100%", padding: "12px",
                                borderRadius: 12, border: "none",
                                background: "linear-gradient(135deg, #FF6B35, #FFD93D)",
                                color: "#fff", fontSize: 14, fontWeight: 700,
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                                boxShadow: "0 4px 14px rgba(255,107,53,0.25)",
                                transition: "transform 0.15s, box-shadow 0.15s",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontFamily: "inherit",
                            }}
                            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.transform = "scale(1.01)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                        >
                            {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : "Create Account"}
                        </button>
                    </form>

                    <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--muted, #888780)" }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "#FF6B35", fontWeight: 600, textDecoration: "none" }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: #AAAAAA; }
            `}</style>
        </div>
    );
}

/* ── Helpers ── */

function Field({ label, children, hint, hintType }: {
    label: string;
    children: React.ReactNode;
    hint?: string;
    hintType?: "error" | "info";
}) {
    return (
        <div>
            <label style={{
                display: "block", marginBottom: 6,
                fontSize: 12, fontWeight: 600,
                color: "var(--ink-2, #2D2D44)",
            }}>
                {label}
            </label>
            {children}
            {hint && (
                <p style={{
                    marginTop: 4, fontSize: 11,
                    color: hintType === "error" ? "#EF476F" : "var(--muted, #888780)",
                }}>{hint}</p>
            )}
        </div>
    );
}

function inputStyle(hasError = false): React.CSSProperties {
    return {
        width: "100%",
        padding: "11px 14px",
        borderRadius: 10,
        border: `0.5px solid ${hasError ? "rgba(239,71,111,0.5)" : "rgba(26,26,46,0.14)"}`,
        background: hasError ? "rgba(239,71,111,0.04)" : "#FAFAF9",
        color: "var(--ink, #1A1A2E)",
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: "border-color 0.15s, background 0.15s",
    };
}

function applyFocusStyle(el: HTMLInputElement, hasError = false) {
    el.style.borderColor = hasError ? "rgba(239,71,111,0.6)" : "#FF6B35";
    el.style.background   = "#fff";
}

function removeFocusStyle(el: HTMLInputElement, hasError = false) {
    el.style.borderColor = hasError ? "rgba(239,71,111,0.5)" : "rgba(26,26,46,0.14)";
    el.style.background   = hasError ? "rgba(239,71,111,0.04)" : "#FAFAF9";
}
