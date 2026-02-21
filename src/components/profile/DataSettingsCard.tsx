"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Settings } from "lucide-react";
import type { UserPreferencesData } from "@/types";

interface DataSettingsCardProps {
    preferences: UserPreferencesData;
    onToggle: (key: keyof Pick<UserPreferencesData, "rememberInput" | "autoFillLocation" | "smartInsights">, value: boolean) => Promise<void>;
}

function Toggle({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5">
            <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-zinc-500">{description}</p>
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-cyan-500" : "bg-zinc-700"
                    }`}
            >
                <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}

export function DataSettingsCard({ preferences, onToggle }: DataSettingsCardProps) {
    const [settings, setSettings] = useState({
        rememberInput: preferences.rememberInput,
        autoFillLocation: preferences.autoFillLocation,
        smartInsights: preferences.smartInsights,
    });

    const handleToggle = async (key: keyof typeof settings, value: boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        await onToggle(key, value);
    };

    return (
        <Card className="space-y-5 p-6">
            <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/5 p-2 text-zinc-400">
                    <Settings className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                    Data Settings
                </h3>
            </div>

            <div className="space-y-3">
                <Toggle
                    label="Remember last input"
                    description="Pre-fill your last charging values"
                    checked={settings.rememberInput}
                    onChange={(v) => handleToggle("rememberInput", v)}
                />
                <Toggle
                    label="Auto-fill location"
                    description="Automatically use your last location"
                    checked={settings.autoFillLocation}
                    onChange={(v) => handleToggle("autoFillLocation", v)}
                />
                <Toggle
                    label="Smart insights"
                    description="Get AI-driven usage tips on your dashboard"
                    checked={settings.smartInsights}
                    onChange={(v) => handleToggle("smartInsights", v)}
                />
            </div>
        </Card>
    );
}
