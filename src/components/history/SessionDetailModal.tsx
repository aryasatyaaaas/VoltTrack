"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Zap, MapPin, Clock, Plug, Calendar, Pencil, Trash2, Loader2, Check, Star } from "lucide-react";
import type { HistorySession } from "@/types";
import { m, AnimatePresence } from "framer-motion";
import { useStations } from "@/hooks/useStations";
import type { NormalizedStation } from "@/lib/normalizeStation";
import { formatCurrencyDynamic } from "@/lib/utils";

interface SessionDetailModalProps {
    session: HistorySession | null;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<HistorySession>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

function formatDuration(minutes: number | null): string {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function SessionDetailModal({ session, onClose, onUpdate, onDelete }: SessionDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Favorite locations from profile
    const [favoriteLocations, setFavoriteLocations] = useState<string[]>([]);
    const [currency, setCurrencyState] = useState("IDR");

    // Location combobox state
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLon, setUserLon] = useState<number | null>(null);

    const { data: stationsData } = useStations({
        lat: userLat,
        lon: userLon,
        distance: userLat && userLon ? 10000 : undefined,
        maxresults: 1000,
    });
    const stations: NormalizedStation[] = stationsData || [];

    // Edit fields
    const [energyKwh, setEnergyKwh] = useState(0);
    const [cost, setCost] = useState<number | null>(null);
    const [location, setLocation] = useState("");
    const [chargerType, setChargerType] = useState("");
    const [durationMinutes, setDurationMinutes] = useState<number | null>(null);

    // Fetch favorite locations from profile
    useEffect(() => {
        const loadLocations = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) {
                    const data = await res.json();
                    setFavoriteLocations(data.preferences?.favoriteLocations || []);
                    if (data.preferences?.currency) setCurrencyState(data.preferences.currency);
                }
            } catch { }
        };
        loadLocations();
    }, []);

    // Location fetch removed on mount to avoid iOS Safari auto-blocking geolocation without user interaction.

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
    };

    // Location suggestions: favorites first, then nearby SPKLU
    const locationSuggestions = (() => {
        const favLocs = favoriteLocations.map(title => {
            const station = stations.find(s => s.name === title);
            let dist: number | undefined;
            if (station && userLat !== null && userLon !== null && station.lat !== null && station.lon !== null) {
                dist = getDistance(userLat, userLon, station.lat, station.lon);
            }
            return { title, distance: dist, isFav: true };
        });

        const ocmLocs = stations
            .filter(s => !favoriteLocations.includes(s.name))
            .map(s => {
                let dist: number | undefined;
                if (userLat !== null && userLon !== null && s.lat !== null && s.lon !== null) {
                    dist = getDistance(userLat, userLon, s.lat, s.lon);
                }
                return { title: s.name, distance: dist, isFav: false };
            })
            .sort((a, b) => {
                if (a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
                if (a.distance !== undefined) return -1;
                if (b.distance !== undefined) return 1;
                return 0;
            });

        let all = [...favLocs, ...ocmLocs];
        if (location) {
            const q = location.toLowerCase();
            all = all.filter(l => l.title.toLowerCase().includes(q));
        }

        const seen = new Set<string>();
        return all.filter(l => { if (seen.has(l.title)) return false; seen.add(l.title); return true; }).slice(0, 20);
    })();

    useEffect(() => {
        if (session) {
            setEnergyKwh(session.energyKwh);
            setCost(session.cost);
            setLocation(session.location);
            setChargerType(session.chargerType ?? "");
            setDurationMinutes(session.durationMinutes);
            setIsEditing(false);
            setConfirmDelete(false);
        }
    }, [session]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (session) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [session, handleKeyDown]);

    if (!session) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(session.id, {
                energyKwh,
                cost,
                location,
                chargerType,
                durationMinutes,
            });
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(session.id);
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    const date = new Date(session.sessionDate);

    // Helper classes
    const inputStyle = {
        border: "1px solid var(--border)",
        background: "var(--white)",
        color: "var(--ink)",
    } as React.CSSProperties;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg rounded-3xl p-6 shadow-2xl" style={{ background: "var(--white)", border: "1px solid var(--border-md)" }}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 transition"
                    style={{ color: "var(--muted)", background: "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl p-2.5" style={{ background: "rgba(255,107,53,0.1)" }}>
                        <Zap className="h-5 w-5" style={{ color: "var(--volt-orange)" }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>Session Details</h3>
                        <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                            {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                            {" · "}
                            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {isEditing ? (
                        /* Edit mode */
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Energy (kWh)</label>
                                    <input type="number" step="0.1" value={energyKwh} onChange={(e) => setEnergyKwh(parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={e => e.currentTarget.style.border = "1px solid var(--volt-orange)"}
                                        onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Cost</label>
                                    <input type="number" value={cost ?? ""} onChange={(e) => setCost(e.target.value ? parseFloat(e.target.value) : null)}
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={e => e.currentTarget.style.border = "1px solid var(--volt-orange)"}
                                        onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Location</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Search SPKLU or type custom..."
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                        style={inputStyle}
                                        autoComplete="off"
                                        onFocus={e => {
                                            setShowLocationDropdown(true);
                                            e.currentTarget.style.border = "1px solid var(--volt-orange)";
                                        }}
                                        onBlur={e => {
                                            setTimeout(() => setShowLocationDropdown(false), 200);
                                            e.currentTarget.style.border = "1px solid var(--border)";
                                        }}
                                    />
                                    <AnimatePresence>
                                        {showLocationDropdown && locationSuggestions.length > 0 && (
                                            <m.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg no-scrollbar"
                                            >
                                                {locationSuggestions.map((loc, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors"
                                                        style={{ color: "var(--ink)" }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.background = "rgba(255,107,53,0.08)";
                                                            e.currentTarget.style.color = "var(--volt-orange)";
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.background = "transparent";
                                                            e.currentTarget.style.color = "var(--ink)";
                                                        }}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setLocation(loc.title);
                                                            setShowLocationDropdown(false);
                                                        }}
                                                    >
                                                        <span className="truncate pr-3 font-medium flex items-center gap-1.5" style={{ color: "var(--ink)" }}>
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
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Charger Type</label>
                                    <select value={chargerType} onChange={(e) => setChargerType(e.target.value)}
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                        style={inputStyle}>
                                        <option value="AC">AC</option>
                                        <option value="CCS2">CCS2</option>
                                        <option value="CHAdeMO">CHAdeMO</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Duration (min)</label>
                                    <input type="number" value={durationMinutes ?? ""} onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={e => e.currentTarget.style.border = "1px solid var(--volt-orange)"}
                                        onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* View mode */
                        <div className="grid grid-cols-2 gap-3">
                            <DetailRow icon={Zap} label="Energy" value={`${session.energyKwh.toFixed(1)} kWh`} />
                            <DetailRow icon={MapPin} label="Location" value={session.location} />
                            <DetailRow icon={Clock} label="Duration" value={formatDuration(session.durationMinutes)} />
                            <DetailRow icon={Plug} label="Charger" value={session.chargerType ?? "—"} />
                            <DetailRow icon={Calendar} label="Date" value={date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                            <DetailRow
                                icon={Zap}
                                label="Cost"
                                value={session.cost !== null ? formatCurrencyDynamic(session.cost, currency) : "—"}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)}
                                className="flex-1 rounded-xl py-2.5 text-sm font-bold transition"
                                style={{ border: "1px solid var(--border)", color: "var(--ink)", background: "var(--white)" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--white)")}
                            >
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)", boxShadow: "0 4px 12px rgba(255,107,53,0.2)" }}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition"
                                style={{ border: "1px solid var(--border)", color: "var(--ink)", background: "var(--white)" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "var(--white)")}>
                                <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            {confirmDelete ? (
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                                    style={{ background: "#EF4444", boxShadow: "0 4px 12px rgba(239,68,68,0.2)" }}>
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
                                </button>
                            ) : (
                                <button onClick={() => setConfirmDelete(true)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition hover:bg-red-500/10"
                                    style={{ border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return (
        <div className="rounded-xl p-3" style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <p className="mt-1 text-sm font-bold" style={{ color: "var(--ink)" }}>{value}</p>
        </div>
    );
}
