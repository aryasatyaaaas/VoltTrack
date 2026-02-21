"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Zap, MapPin, DollarSign, Loader2 } from "lucide-react";
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
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const hasChanges =
        defaultLocation !== preferences.defaultLocation ||
        costPerKwh !== preferences.costPerKwh ||
        currency !== preferences.currency;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ defaultLocation, costPerKwh, currency });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setIsSaving(false);
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

            <div className="space-y-4">
                {/* Default Location */}
                <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                        <MapPin className="h-3 w-3" /> Default Charging Location
                    </label>
                    <select
                        value={defaultLocation}
                        onChange={(e) => setDefaultLocation(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-black"
                    >
                        {LOCATIONS.map((loc) => (
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
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-black"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Save button */}
            <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
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
