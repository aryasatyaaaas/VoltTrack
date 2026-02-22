"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Zap, MapPin, DollarSign, Loader2, Star, Plus, X } from "lucide-react";
import type { UserPreferencesData } from "@/types";

interface EVPreferencesCardProps {
    preferences: UserPreferencesData;
    onSave: (data: Partial<UserPreferencesData>) => Promise<void>;
}

const LOCATIONS = ["Home", "Office", "Public Station", "Mall", "Highway Rest Stop"];
const CURRENCIES = ["IDR", "USD"] as const;

export function EVPreferencesCard({ preferences, onSave }: EVPreferencesCardProps) {
    const [defaultLocation, setDefaultLocation] = useState(preferences.defaultLocation);
    const [costPerKwh, setCostPerKwh] = useState(preferences.costPerKwh);
    const [currency, setCurrency] = useState(preferences.currency);
    const [favoriteLocations, setFavoriteLocations] = useState<string[]>(preferences.favoriteLocations || []);

    // For adding a new custom location
    const [newLocationInput, setNewLocationInput] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Combine original options and newly added favorite locations for the defaultLocation dropdown
    const availableDefaults = Array.from(new Set([...LOCATIONS, ...favoriteLocations]));

    const hasChanges =
        defaultLocation !== preferences.defaultLocation ||
        costPerKwh !== preferences.costPerKwh ||
        currency !== preferences.currency ||
        JSON.stringify(favoriteLocations) !== JSON.stringify(preferences.favoriteLocations || []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ defaultLocation, costPerKwh, currency, favoriteLocations });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddFavorite = () => {
        const val = newLocationInput.trim();
        if (val && !favoriteLocations.includes(val)) {
            setFavoriteLocations(prev => [...prev, val]);
        }
        setNewLocationInput("");
    };

    const handleRemoveFavorite = (locToRemove: string) => {
        setFavoriteLocations(prev => prev.filter(l => l !== locToRemove));
        if (defaultLocation === locToRemove) {
            setDefaultLocation(LOCATIONS[0]); // Reset to first basic option if they deleted the active default
        }
    };

    return (
        <Card className="space-y-5 p-6">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-400">
                    <Zap className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                    EV Preferences
                </h3>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    {/* Default Location */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                            <MapPin className="h-3 w-3" /> Default Charging Location
                        </label>
                        <select
                            value={defaultLocation}
                            onChange={(e) => setDefaultLocation(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-zinc-900"
                        >
                            {availableDefaults.map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Cost per kWh */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                                <DollarSign className="h-3 w-3" /> Cost / kWh
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={costPerKwh}
                                onChange={(e) => setCostPerKwh(parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50"
                            />
                        </div>

                        {/* Currency */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                                Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-zinc-900"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Favorite Locations Section */}
                <div className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <Star className="h-3 w-3" /> Custom Favorite Locations
                    </label>
                    <p className="text-xs text-zinc-500">
                        Add your frequent charging spots (like &quot;Grand Indonesia&quot; or &quot;My Secret Garage&quot;) to easily pick them in your log.
                    </p>

                    <div className="flex items-center justify-between gap-2">
                        <input
                            type="text"
                            placeholder="Add new location..."
                            value={newLocationInput}
                            onChange={(e) => setNewLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddFavorite()}
                            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-cyan-500/50"
                        />
                        <button
                            type="button"
                            onClick={handleAddFavorite}
                            disabled={!newLocationInput.trim()}
                            className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/30 disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" /> Add
                        </button>
                    </div>

                    {/* Chips */}
                    {favoriteLocations.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {favoriteLocations.map((loc) => (
                                <span key={loc} className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
                                    {loc}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFavorite(loc)}
                                        className="rounded-full bg-cyan-500/20 p-0.5 text-cyan-300 transition-colors hover:bg-cyan-500/40 hover:text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Save button */}
            <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
            >
                {isSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                ) : saved ? (
                    "Saved ✓"
                ) : (
                    "Save Preferences"
                )}
            </button>
        </Card>
    );
}
