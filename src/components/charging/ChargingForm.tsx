"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, MapPin, Calendar, Clock, Loader2, Plug, Star } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStations } from "@/hooks/useStations";

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

import type { NormalizedStation } from "@/lib/normalizeStation";

interface ChargingFormProps {
    onSuccess?: () => void;
}

export function ChargingForm({ onSuccess }: ChargingFormProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isAutoCalculating, setIsAutoCalculating] = useState(true);
    
    const queryClient = useQueryClient();

    // Combobox / API states
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLon, setUserLon] = useState<number | null>(null);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    const { data: stationsData } = useStations({
        lat: userLat,
        lon: userLon,
        distance: userLat && userLon ? 10000 : undefined,
        maxresults: 1000
    });
    const stations: NormalizedStation[] = stationsData || [];

    const urlLocation = searchParams.get("location") || "";
    const urlType = searchParams.get("type") || "AC";

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kwh: undefined,
            date: new Date().toISOString().slice(0, 16),
            location: urlLocation,
            cost: undefined,
            chargerType: CHARGER_TYPES.includes(urlType.toUpperCase()) ? urlType.toUpperCase() : "AC",
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

    useEffect(() => {
        if (!isAutoCalculating) return;
        const costPerKwh = userProfile?.preferences?.costPerKwh || 0;
        if (watchedKwh && costPerKwh > 0 && !Number.isNaN(watchedKwh)) {
            form.setValue("cost", Math.round(watchedKwh * costPerKwh), { shouldValidate: true });
        } else if (!watchedKwh) {
            form.setValue("cost", undefined);
        }
    }, [watchedKwh, userProfile, isAutoCalculating, form]);

    // Fetch Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    setUserLat(pos.coords.latitude);
                    setUserLon(pos.coords.longitude);
                },
                () => {},
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    }, []);

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

    const submitMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            const csrfRes = await fetch("/api/csrf");
            if (!csrfRes.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfRes.json();

            const response = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
                body: JSON.stringify({ ...data, date: new Date(data.date).toISOString() }),
            });

            if (!response.ok) throw new Error("Failed to save session");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            router.refresh();
            
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
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setSuccessMessage(null);
        try {
            await submitMutation.mutateAsync(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedCurrency = userProfile?.preferences?.currency || "IDR";
    const currencySymbol = (() => {
        try {
            return (
                new Intl.NumberFormat("en", { style: "currency", currency: selectedCurrency, minimumFractionDigits: 0 })
                    .formatToParts(1)
                    .find((p) => p.type === "currency")?.value ?? selectedCurrency
            );
        } catch {
            return selectedCurrency;
        }
    })();

    const defaultLocation = userProfile?.preferences?.defaultLocation || "";
    
    // Distance helper
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    };

    const watchedLocation = form.watch("location") || "";
    const locationSuggestions = useMemo(() => {
        const favs = userProfile?.preferences?.favoriteLocations || [];
        
        const customLocs = Array.from(new Set([
            ...favs,
            ...(urlLocation ? [urlLocation] : []),
            ...(defaultLocation ? [defaultLocation] : []),
            ...LOCATION_suggestions,
        ])).map(title => ({ 
            title, 
            distance: undefined as number | undefined,
            isFav: favs.includes(title)
        }));

        const ocmLocs = stations.map(s => {
            let dist = undefined;
            if (userLat !== null && userLon !== null && s.lat !== null && s.lon !== null) {
                dist = getDistance(userLat, userLon, s.lat, s.lon);
            }
            return { 
                title: s.name, 
                distance: dist, 
                isFav: favs.includes(s.name)
            };
        });

        let all = [...customLocs, ...ocmLocs];

        if (watchedLocation) {
            const query = watchedLocation.toLowerCase();
            all = all.filter(l => l.title.toLowerCase().includes(query));
        }

        all.sort((a, b) => {
            // 1. Favorites always at top
            if (a.isFav && !b.isFav) return -1;
            if (!a.isFav && b.isFav) return 1;
            
            // 2. No distance vs Distance
            if (a.distance === undefined && b.distance !== undefined) {
                // If both are favorites, prioritize the one WITH distance so the user sees the km
                if (a.isFav && b.isFav) return 1;
                // For non-favorites, put custom generic locations (Home, Office) above OCM lists
                return -1;
            }
            if (a.distance !== undefined && b.distance === undefined) {
                if (a.isFav && b.isFav) return -1;
                return 1;
            }
            
            // 3. Both have distance
            if (a.distance !== undefined && b.distance !== undefined) {
                return a.distance - b.distance;
            }
            return 0;
        });

        const uniqueTitles = new Set();
        const uniqueAll = [];
        for (const item of all) {
            if (!uniqueTitles.has(item.title)) {
                uniqueTitles.add(item.title);
                uniqueAll.push(item);
            }
        }

        return uniqueAll.slice(0, 20);
    }, [stations, userLat, userLon, watchedLocation, urlLocation, defaultLocation, userProfile]);

    const inputStyle = {
        background: "var(--white)",
        border: "1px solid var(--border)",
        color: "var(--ink)"
    } as React.CSSProperties;

    return (
        <div className="relative w-full">
            {/* Ambient glow behind the card */}
            <div
                className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-3/4 rounded-full blur-3xl opacity-50"
                style={{ background: "radial-gradient(ellipse, rgba(255,107,53,0.3) 0%, transparent 70%)" }}
            />

            <div
                className="relative overflow-hidden rounded-3xl p-8"
                style={{
                    background: "var(--white)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.03)",
                }}
            >
                {/* Top edge glow */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: "linear-gradient(90deg, transparent, var(--volt-orange), transparent)" }}
                />

                {/* Success toast */}
                <AnimatePresence>
                    {successMessage && (
                        <m.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="absolute inset-x-0 top-0 z-20 flex items-center justify-center rounded-t-3xl py-3 text-sm font-semibold text-emerald-600"
                            style={{ background: "rgba(16,185,129,0.1)", backdropFilter: "blur(8px)" }}
                        >
                            {successMessage}
                        </m.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <m.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(255,107,53,0.1)" }}
                    >
                        <Zap className="h-5 w-5" style={{ color: "var(--volt-orange)" }} />
                    </m.div>
                    <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--ink)" }}>Log a Charge</h2>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* ── Energy Hero Input ── */}
                    <div className="flex flex-col items-center gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                            Energy Added
                        </label>
                        <div
                            className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl transition-all"
                            style={{
                                background: "var(--bg-secondary)",
                                border: "1.5px solid var(--border)",
                            }}
                        >
                            <input
                                {...form.register("kwh", { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                autoFocus
                                className="w-full bg-transparent py-4 sm:py-6 text-center text-5xl sm:text-7xl font-extrabold tracking-tight outline-none placeholder-zinc-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="0.0"
                                style={{ caretColor: "var(--volt-orange)", color: "var(--ink)" }}
                            />
                            <span
                                className="absolute right-6 text-xl font-bold"
                                style={{ color: "var(--volt-orange)" }}
                            >
                                kWh
                            </span>
                        </div>
                        {form.formState.errors.kwh && (
                            <p className="mt-1 text-xs text-red-500">{form.formState.errors.kwh.message}</p>
                        )}
                    </div>

                    {/* ── Date & Charger Type ── */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                <Calendar className="h-3 w-3" /> Date
                            </label>
                            <div className="relative">
                                <input
                                    {...form.register("date")}
                                    type="datetime-local"
                                    className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                                    style={inputStyle}
                                    onFocus={e => {
                                        e.currentTarget.style.border = "1px solid var(--volt-orange)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.1)";
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.border = "1px solid var(--border)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>

                        {/* Charger Type toggle */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                <Plug className="h-3 w-3" /> Charger Type
                            </label>
                            <div
                                className="flex gap-2 rounded-2xl p-1"
                                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
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
                                                color: active ? "white" : "var(--ink-muted)",
                                                background: active ? "var(--volt-orange)" : "transparent",
                                                boxShadow: active ? "0 2px 12px rgba(255,107,53,0.2)" : "none",
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
                        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                            <MapPin className="h-3 w-3" /> Location
                        </label>
                        <div className="relative">
                            <MapPin
                                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                                style={{ color: "var(--volt-orange)" }}
                            />
                            <input
                                {...form.register("location")}
                                type="text"
                                placeholder="Search SPKLU or type custom..."
                                className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-all"
                                style={inputStyle}
                                autoComplete="off"
                                onFocus={e => {
                                    setShowLocationDropdown(true);
                                    e.currentTarget.style.border = "1px solid var(--volt-orange)";
                                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.1)";
                                }}
                                onBlur={e => {
                                    setTimeout(() => setShowLocationDropdown(false), 200);
                                    e.currentTarget.style.border = "1px solid var(--border)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            />
                            <AnimatePresence>
                                {showLocationDropdown && locationSuggestions.length > 0 && (
                                    <m.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg no-scrollbar"
                                    >
                                        {locationSuggestions.map((loc, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    form.setValue("location", loc.title, { shouldValidate: true });
                                                    setShowLocationDropdown(false);
                                                }}
                                            >
                                                <span className="truncate pr-4 font-medium flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
                                                    {loc.isFav && <Star className="h-3 w-3 flex-shrink-0 text-orange-500 fill-orange-500" />}
                                                    <span className="truncate">{loc.title}</span>
                                                </span>
                                                {loc.distance !== undefined && (
                                                    <span className="flex-shrink-0 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                                                        {loc.distance.toFixed(1)} km
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </m.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {form.formState.errors.location && (
                            <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>
                        )}
                    </div>

                    {/* ── Cost & Duration ── */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Cost */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                    <span className="text-xs">{currencySymbol}</span> Cost ({selectedCurrency})
                                </label>
                                {isAutoCalculating && userProfile?.preferences?.costPerKwh ? (
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                        style={{ background: "rgba(255,107,53,0.1)", color: "var(--volt-orange)" }}
                                    >
                                        Auto
                                    </span>
                                ) : null}
                            </div>
                            <div className="relative">
                                <span
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold"
                                    style={{ color: "var(--volt-blue)" }}
                                >
                                    {currencySymbol}
                                </span>
                                <input
                                    {...form.register("cost", { valueAsNumber: true })}
                                    type="number"
                                    step="1"
                                    onChange={handleCostManualChange}
                                    className="w-full rounded-2xl py-3 pl-16 pr-4 text-sm outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={{
                                        ...inputStyle,
                                        background: isAutoCalculating && userProfile?.preferences?.costPerKwh
                                            ? "var(--bg-secondary)" : "var(--white)",
                                        color: "var(--ink)",
                                    }}
                                    placeholder="0"
                                    onFocus={e => {
                                        e.currentTarget.style.border = "1px solid var(--volt-orange)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.1)";
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.border = "1px solid var(--border)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                <Clock className="h-3 w-3" /> Duration (min)
                            </label>
                            <div className="relative">
                                <Clock
                                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                                    style={{ color: "var(--ink-muted)" }}
                                />
                                <input
                                    {...form.register("duration", { valueAsNumber: true })}
                                    type="number"
                                    className="w-full rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    style={inputStyle}
                                    placeholder="e.g. 45"
                                    onFocus={e => {
                                        e.currentTarget.style.border = "1px solid var(--volt-orange)";
                                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.1)";
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.border = "1px solid var(--border)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Save Button ── */}
                    <m.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl font-bold text-base tracking-wide text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: "linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)",
                            boxShadow: "0 8px 32px rgba(255,107,53,0.25), 0 2px 8px rgba(255,107,53,0.15)",
                        }}
                    >
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
                    </m.button>
                </form>
            </div>
        </div>
    );
}
