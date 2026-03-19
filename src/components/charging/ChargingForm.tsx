"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, MapPin, Calendar, Clock, Loader2, Plug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types";

const formSchema = z.object({
    kwh: z.number().positive("Energy must be greater than 0"),
    date: z.string(),
    location: z.string().min(1, "Location is required"),
    cost: z.number().nonnegative().optional(),
    chargerType: z.string(),
    duration: z.number().int().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LOCATION_suggestions = ["Home", "Office", "Public Station", "Mall", "Highway Rest Stop"];
const CHARGER_TYPES = ["AC", "CCS2", "CHAdeMO"];

interface ChargingFormProps {
    onSuccess?: () => void;
}

export function ChargingForm({ onSuccess }: ChargingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isAutoCalculating, setIsAutoCalculating] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kwh: undefined,
            date: new Date().toISOString().slice(0, 16),
            location: "",
            cost: undefined,
            chargerType: "AC",
            duration: undefined,
        },
    });

    const watchedKwh = form.watch("kwh");
    const watchedChargerType = form.watch("chargerType");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data);
                    if (data.preferences?.defaultLocation) {
                        if (!form.getValues("location")) {
                            form.setValue("location", data.preferences.defaultLocation);
                        }
                    }
                }
            } catch (err) { }
        };
        loadProfile();
    }, [form]);

    // Fetch user profile for preferences (favorite locations, etc)

    useEffect(() => {
        if (!isAutoCalculating) return;
        const costPerKwh = userProfile?.preferences?.costPerKwh || 0;
        if (watchedKwh && costPerKwh > 0 && !Number.isNaN(watchedKwh)) {
            form.setValue("cost", Math.round(watchedKwh * costPerKwh), { shouldValidate: true });
        } else if (!watchedKwh) {
            form.setValue("cost", undefined);
        }
    }, [watchedKwh, userProfile, isAutoCalculating, form]);

    const handleCostManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.valueAsNumber;
        if (!Number.isNaN(val)) {
            setIsAutoCalculating(false);
            form.setValue("cost", val);
        } else {
            setIsAutoCalculating(true);
            form.setValue("cost", undefined);
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setSuccessMessage(null);
        try {
            const csrfRes = await fetch("/api/csrf");
            if (!csrfRes.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfRes.json();

            const response = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
                body: JSON.stringify({ ...data, date: new Date(data.date).toISOString() }),
            });

            if (!response.ok) throw new Error("Failed to save session");

            setSuccessMessage("Session logged! ⚡");
            form.reset({
                kwh: undefined,
                date: new Date().toISOString().slice(0, 16),
                location: "",
                cost: undefined,
                chargerType: "AC",
                duration: undefined,
            });
            setIsAutoCalculating(true);
            if (onSuccess) onSuccess();
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currencySymbol = userProfile?.preferences?.currency === "USD" ? "$"
        : userProfile?.preferences?.currency === "EUR" ? "€" : "Rp";

    const allLocations = Array.from(new Set([
        ...LOCATION_suggestions,
        ...(userProfile?.preferences?.favoriteLocations || []),
    ]));

    return (
        <div className="relative w-full">
            {/* Ambient glow behind the card */}
            <div
                className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-3/4 rounded-full blur-3xl"
                style={{ background: "radial-gradient(ellipse, rgba(0,229,195,0.12) 0%, transparent 70%)" }}
            />

            <div
                className="relative overflow-hidden rounded-3xl p-8"
                style={{
                    background: "rgba(18,18,22,0.85)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 0 0 1px rgba(0,229,195,0.08) inset, 0 32px 64px rgba(0,0,0,0.5)",
                }}
            >
                {/* Top teal glow edge */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,195,0.6), transparent)" }}
                />

                {/* Success toast */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="absolute inset-x-0 top-0 z-20 flex items-center justify-center rounded-t-3xl py-3 text-sm font-semibold text-emerald-300"
                            style={{ background: "rgba(16,185,129,0.15)", backdropFilter: "blur(8px)" }}
                        >
                            {successMessage}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl"
                        style={{
                            background: "rgba(0,229,195,0.12)",
                            boxShadow: "0 0 16px rgba(0,229,195,0.25)",
                        }}
                    >
                        <Zap className="h-5 w-5" style={{ color: "#00E5C3" }} />
                    </motion.div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Log a Charge</h2>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* ── Energy Hero Input ── */}
                    <div className="flex flex-col items-center gap-1">
                        <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                            Energy Added
                        </label>
                        <div
                            className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl transition-all"
                            style={{
                                background: "rgba(0,229,195,0.04)",
                                border: "1.5px solid rgba(0,229,195,0.2)",
                                boxShadow: "0 0 32px rgba(0,229,195,0.08) inset",
                            }}
                        >
                            <input
                                {...form.register("kwh", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                autoFocus
                                className="w-full bg-transparent py-6 text-center text-7xl font-bold tracking-tight text-white outline-none placeholder-zinc-800 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="0.0"
                                style={{ caretColor: "#00E5C3" }}
                            />
                            <span
                                className="absolute right-6 text-xl font-semibold"
                                style={{ color: "rgba(0,229,195,0.5)" }}
                            >
                                kWh
                            </span>
                        </div>
                        {form.formState.errors.kwh && (
                            <p className="mt-1 text-xs text-red-400">{form.formState.errors.kwh.message}</p>
                        )}
                    </div>

                    {/* ── Date & Charger Type ── */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                <Calendar className="h-3 w-3" /> Date
                            </label>
                            <div className="relative">
                                <input
                                    {...form.register("date")}
                                    type="datetime-local"
                                    className="w-full rounded-2xl px-4 py-3 text-sm text-zinc-300 outline-none transition-all"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        colorScheme: "dark",
                                    }}
                                    onFocus={e => {
                                        e.currentTarget.style.border = "1px solid rgba(0,229,195,0.4)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,195,0.08)";
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>

                        {/* Charger Type toggle */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                <Plug className="h-3 w-3" /> Charger Type
                            </label>
                            <div
                                className="flex gap-2 rounded-2xl p-1"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                {CHARGER_TYPES.map((type) => {
                                    const active = watchedChargerType === type;
                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => form.setValue("chargerType", type)}
                                            className="relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-all"
                                            style={{
                                                color: active ? "#0F0F12" : "rgba(161,161,170,1)",
                                                background: active
                                                    ? "linear-gradient(135deg, #00E5C3, #00c4a8)"
                                                    : "transparent",
                                                boxShadow: active ? "0 2px 12px rgba(0,229,195,0.35)" : "none",
                                            }}
                                        >
                                            {type}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Location ── */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                            <MapPin className="h-3 w-3" /> Location
                        </label>
                        <div className="relative">
                            <MapPin
                                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                                style={{ color: "rgba(0,229,195,0.5)" }}
                            />
                            <select
                                {...form.register("location")}
                                className="w-full appearance-none rounded-2xl py-3 pl-10 pr-4 text-sm text-zinc-300 outline-none transition-all [&>option]:bg-zinc-900"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}
                                onFocus={e => {
                                    e.currentTarget.style.border = "1px solid rgba(0,229,195,0.4)";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,195,0.08)";
                                }}
                                onBlur={e => {
                                    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <option value="" disabled>Select location...</option>
                                {allLocations.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                        {form.formState.errors.location && (
                            <p className="text-xs text-red-400">{form.formState.errors.location.message}</p>
                        )}
                    </div>

                    {/* ── Cost & Duration ── */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Cost */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                    <span className="text-xs">Rp</span> Cost (IDR)
                                </label>
                                {isAutoCalculating && userProfile?.preferences?.costPerKwh ? (
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                        style={{ background: "rgba(0,229,195,0.1)", color: "#00E5C3" }}
                                    >
                                        Auto
                                    </span>
                                ) : null}
                            </div>
                            <div className="relative">
                                <span
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold"
                                    style={{ color: "rgba(245,166,35,0.7)" }}
                                >
                                    Rp
                                </span>
                                <input
                                    {...form.register("cost", { valueAsNumber: true })}
                                    type="number"
                                    step="1"
                                    onChange={handleCostManualChange}
                                    className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={{
                                        background: isAutoCalculating && userProfile?.preferences?.costPerKwh
                                            ? "rgba(245,166,35,0.06)"
                                            : "rgba(255,255,255,0.04)",
                                        border: isAutoCalculating && userProfile?.preferences?.costPerKwh
                                            ? "1px solid rgba(245,166,35,0.25)"
                                            : "1px solid rgba(255,255,255,0.08)",
                                        color: isAutoCalculating && userProfile?.preferences?.costPerKwh
                                            ? "#F5A623"
                                            : "rgb(212,212,216)",
                                        colorScheme: "dark",
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                <Clock className="h-3 w-3" /> Duration (min)
                            </label>
                            <div className="relative">
                                <Clock
                                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                                    style={{ color: "rgba(255,255,255,0.15)" }}
                                />
                                <input
                                    {...form.register("duration", { valueAsNumber: true })}
                                    type="number"
                                    className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-zinc-300 outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        colorScheme: "dark",
                                    }}
                                    placeholder="e.g. 45"
                                    onFocus={e => {
                                        e.currentTarget.style.border = "1px solid rgba(0,229,195,0.4)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,195,0.08)";
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Save Button ── */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl font-bold text-base tracking-wide text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: "linear-gradient(135deg, #00E5C3 0%, #0066FF 100%)",
                            boxShadow: "0 8px 32px rgba(0,229,195,0.3), 0 2px 8px rgba(0,102,255,0.2)",
                        }}
                    >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Zap className="h-5 w-5" />
                                Save Session
                            </>
                        )}
                    </motion.button>
                </form>
            </div>
        </div>
    );
}
