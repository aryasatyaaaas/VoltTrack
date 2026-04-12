"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Zap, MapPin, Clock, Plug, Calendar, Pencil, Trash2, Loader2, Check } from "lucide-react";
import type { HistorySession } from "@/types";

const DEFAULT_LOCATIONS = ["Home", "Office", "Public Station", "Mall", "Highway Rest Stop"];

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
                }
            } catch { }
        };
        loadLocations();
    }, []);

    // Combine defaults + favorites (deduplicated)
    const allLocations = Array.from(new Set([...DEFAULT_LOCATIONS, ...favoriteLocations]));

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
        background: "white",
        color: "var(--ink)",
    } as React.CSSProperties;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" style={{ border: "1px solid var(--border)" }}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-gray-100"
                    style={{ color: "var(--ink-muted)" }}
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
                                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Cost (Rp)</label>
                                    <input type="number" value={cost ?? ""} onChange={(e) => setCost(e.target.value ? parseFloat(e.target.value) : null)}
                                        className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                        style={inputStyle}
                                        onFocus={e => e.currentTarget.style.border = "1px solid var(--volt-orange)"}
                                        onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>Location</label>
                                <select value={location} onChange={(e) => setLocation(e.target.value)}
                                    className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-all"
                                    style={inputStyle}>
                                    {Array.from(new Set([...allLocations, ...(location && !allLocations.includes(location) ? [location] : [])])).map((loc) => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
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
                                value={session.cost !== null ? `Rp ${session.cost.toLocaleString("id-ID")}` : "—"}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)}
                                className="flex-1 rounded-xl py-2.5 text-sm font-bold transition hover:bg-gray-100"
                                style={{ border: "1px solid var(--border)", color: "var(--ink)" }}>
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
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition hover:bg-gray-100"
                                style={{ border: "1px solid var(--border)", color: "var(--ink)" }}>
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
        <div className="rounded-xl p-3" style={{ border: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }}>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <p className="mt-1 text-sm font-bold" style={{ color: "var(--ink)" }}>{value}</p>
        </div>
    );
}
