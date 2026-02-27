"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, MapPin, Calendar, Clock, DollarSign, Plug, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
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

    // Auto-calculation explicit toggle
    const [isAutoCalculating, setIsAutoCalculating] = useState(true);

    // Local storage state
    const [recentLocations, setRecentLocations] = useState<string[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kwh: undefined,
            date: new Date().toISOString().slice(0, 16), // datetime-local format
            location: "",
            cost: undefined,
            chargerType: "AC",
            duration: undefined,
        },
    });

    const watchedKwh = form.watch("kwh");
    const watchedLocation = form.watch("location");

    // Fetch user profile for preferences (costPerKwh, currency)
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data);

                    // Auto-fill default location if the user hasn't typed anything yet
                    if (data.preferences?.autoFillLocation && data.preferences?.defaultLocation) {
                        if (!form.getValues("location")) {
                            form.setValue("location", data.preferences.defaultLocation);
                        }
                    }
                }
            } catch (err) { }
        };
        loadProfile();
    }, [form]);

    // Load suggestions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("volttrack_locations");
        if (saved) {
            setRecentLocations(JSON.parse(saved));
        } else {
            setRecentLocations(LOCATION_suggestions.slice(0, 3));
        }
    }, []);

    // Auto-calculate cost when kWh changes
    useEffect(() => {
        if (!isAutoCalculating) return;

        const costPerKwh = userProfile?.preferences?.costPerKwh || 0;
        if (watchedKwh && costPerKwh > 0 && !Number.isNaN(watchedKwh)) {
            // Calculate and round to 0 decimal places for IDR, or 2 for others if needed
            const calculatedCost = Math.round(watchedKwh * costPerKwh);
            form.setValue("cost", calculatedCost, { shouldValidate: true });
        } else if (!watchedKwh) {
            form.setValue("cost", undefined);
        }
    }, [watchedKwh, userProfile, isAutoCalculating, form]);

    const handleCostManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.valueAsNumber;
        if (!Number.isNaN(val)) {
            setIsAutoCalculating(false); // Disable auto-calc once user manually overrides it
            form.setValue("cost", val);
        } else {
            setIsAutoCalculating(true); // Re-enable if they clear it
            form.setValue("cost", undefined);
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setSuccessMessage(null);

        try {
            // Fetch CSRF token first
            const csrfRes = await fetch("/api/csrf");
            if (!csrfRes.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfRes.json();

            const response = await fetch("/api/sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken
                },
                body: JSON.stringify({
                    ...data,
                    date: new Date(data.date).toISOString()
                }),
            });

            if (!response.ok) throw new Error("Failed to save session");

            // Save location to localStorage if new
            const newLocations = Array.from(new Set([data.location.trim(), ...recentLocations])).slice(0, 10);
            setRecentLocations(newLocations);
            localStorage.setItem("volttrack_locations", JSON.stringify(newLocations));

            setSuccessMessage("Charging session saved successfully! ⚡");
            form.reset({
                kwh: undefined,
                date: new Date().toISOString().slice(0, 16),
                location: userProfile?.preferences?.rememberInput ? data.location : "",
                cost: undefined,
                chargerType: userProfile?.preferences?.rememberInput ? data.chargerType : "AC",
                duration: undefined,
            });
            setIsAutoCalculating(true);

            if (onSuccess) onSuccess();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error) {
            console.error(error);
            // handled by generic error for now or toast
        } finally {
            setIsSubmitting(false);
        }
    };

    const currencySymbol = userProfile?.preferences?.currency === "USD" ? "$" :
        userProfile?.preferences?.currency === "EUR" ? "€" : "Rp";

    return (
        <Card className="glass-panel relative overflow-visible p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Quick Add Session</h2>
                <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-400">
                    <Zap className="h-5 w-5" />
                </div>
            </div>

            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-0 z-10 flex w-full items-center justify-center rounded-t-2xl bg-emerald-500/20 py-2 text-sm font-medium text-emerald-400 backdrop-blur-md"
                    >
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>


            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Energy (kWh) - Primary Focus */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        Energy Added
                    </label>
                    <div className="relative">
                        <input
                            {...form.register("kwh", { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            autoFocus
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-2xl font-bold text-white placeholder-zinc-700 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                            placeholder="0.0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-500">
                            kWh
                        </span>
                    </div>
                    {form.formState.errors.kwh && (
                        <p className="text-xs text-red-400">{form.formState.errors.kwh.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Date */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            <Calendar className="h-3 w-3" /> Date
                        </label>
                        <input
                            {...form.register("date")}
                            type="datetime-local"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50"
                        />
                    </div>

                    {/* Charger Type */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            <Plug className="h-3 w-3" /> Type
                        </label>
                        <select
                            {...form.register("chargerType")}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-zinc-900"
                        >
                            {CHARGER_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <MapPin className="h-3 w-3" /> Location
                    </label>
                    <select
                        {...form.register("location")}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-zinc-900"
                    >
                        <option value="" disabled>Select location...</option>
                        {Array.from(new Set([
                            ...LOCATION_suggestions,
                            ...(userProfile?.preferences?.favoriteLocations || [])
                        ])).map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    {form.formState.errors.location && (
                        <p className="text-xs text-red-400">{form.formState.errors.location.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Cost */}
                    <div className="space-y-1.5 mb-1">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                <DollarSign className="h-3 w-3" /> Cost ({userProfile?.preferences?.currency || "IDR"})
                            </label>
                            {isAutoCalculating && userProfile?.preferences?.costPerKwh ? (
                                <span className="text-[10px] text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">Auto</span>
                            ) : null}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">{currencySymbol}</span>
                            <input
                                {...form.register("cost", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                onChange={handleCostManualChange}
                                className={`w-full rounded-lg border ${isAutoCalculating && userProfile?.preferences?.costPerKwh ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-100" : "border-white/10 bg-white/5 text-zinc-300"} pl-8 pr-3 py-2 text-sm outline-none focus:border-cyan-500/50 transition-colors`}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            <Clock className="h-3 w-3" /> Duration (min)
                        </label>
                        <input
                            {...form.register("duration", { valueAsNumber: true })}
                            type="number"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50"
                            placeholder="e.g. 45"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        "Save Session"
                    )}
                </button>
            </form>
        </Card>
    );
}
