"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, MapPin, Calendar, Clock, DollarSign, Plug, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

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

    // Load suggestions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("volttrack_locations");
        if (saved) {
            setRecentLocations(JSON.parse(saved));
        } else {
            setRecentLocations(LOCATION_suggestions.slice(0, 3));
        }
    }, []);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setSuccessMessage(null);

        try {
            const response = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    date: new Date(data.date).toISOString()
                }),
            });

            if (!response.ok) throw new Error("Failed to save session");

            // Save location to localStorage if new
            const newLocations = Array.from(new Set([data.location, ...recentLocations])).slice(0, 5);
            setRecentLocations(newLocations);
            localStorage.setItem("volttrack_locations", JSON.stringify(newLocations));

            setSuccessMessage("Charging session saved successfully! ⚡");
            form.reset({
                kwh: undefined,
                date: new Date().toISOString().slice(0, 16),
                location: data.location, // Keep last location for convenience? User said "remember last input"
                cost: undefined,
                chargerType: data.chargerType, // Keep last type
                duration: undefined,
            });

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

    // Helper to format IDR for display (not used in input directly to keep it number, but could add mask later)
    // For now simple number input.

    return (
        <Card className="glass-panel relative overflow-hidden p-6">
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
                        className="absolute left-0 top-0 z-10 flex w-full items-center justify-center bg-emerald-500/20 py-2 text-sm font-medium text-emerald-400 backdrop-blur-md"
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
                            step="0.1"
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
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-black"
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
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-black"
                    >
                        <option value="">Select location</option>
                        {LOCATION_suggestions.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                    {form.formState.errors.location && (
                        <p className="text-xs text-red-400">{form.formState.errors.location.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Cost (IDR) */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            <DollarSign className="h-3 w-3" /> Cost (IDR)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">Rp</span>
                            <input
                                {...form.register("cost", { valueAsNumber: true })}
                                type="number"
                                className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50"
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
