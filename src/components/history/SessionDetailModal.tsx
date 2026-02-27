"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Zap, MapPin, Clock, Plug, Calendar, Pencil, Trash2, Loader2, Check } from "lucide-react";
import type { HistorySession, UserProfile } from "@/types";

const LOCATIONS = ["Home", "Office", "Public Station", "Mall", "Highway Rest Stop"];

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
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Edit fields
    const [energyKwh, setEnergyKwh] = useState(0);
    const [cost, setCost] = useState<number | null>(null);
    const [location, setLocation] = useState("");
    const [chargerType, setChargerType] = useState("");
    const [durationMinutes, setDurationMinutes] = useState<number | null>(null);

    // Fetch profile for favorite locations
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.ok) setUserProfile(await res.json());
            } catch { }
        };
        loadProfile();
    }, []);

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-black p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-500/10 p-2.5">
                        <Zap className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Session Details</h3>
                        <p className="text-xs text-zinc-500">
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
                                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Energy (kWh)</label>
                                    <input type="number" step="0.1" value={energyKwh} onChange={(e) => setEnergyKwh(parseFloat(e.target.value) || 0)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Cost (Rp)</label>
                                    <input type="number" value={cost ?? ""} onChange={(e) => setCost(e.target.value ? parseFloat(e.target.value) : null)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Location</label>
                                <select value={location} onChange={(e) => setLocation(e.target.value)}
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50 [&>option]:bg-black">
                                    {Array.from(new Set([
                                        ...LOCATIONS,
                                        ...(userProfile?.preferences?.favoriteLocations || [])
                                    ])).map((loc) => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Charger Type</label>
                                    <select value={chargerType} onChange={(e) => setChargerType(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50 [&>option]:bg-black">
                                        <option value="AC">AC</option>
                                        <option value="CCS2">CCS2</option>
                                        <option value="CHAdeMO">CHAdeMO</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Duration (min)</label>
                                    <input type="number" value={durationMinutes ?? ""} onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : null)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50" />
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
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-50">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10">
                                <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            {confirmDelete ? (
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/20 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/30 disabled:opacity-50">
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
                                </button>
                            ) : (
                                <button onClick={() => setConfirmDelete(true)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10">
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
        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
        </div>
    );
}
