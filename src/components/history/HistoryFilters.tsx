"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { HistoryFiltersState } from "@/types";

const CHARGER_TYPES = [
    { value: "all", label: "All Types" },
    { value: "AC", label: "AC" },
    { value: "CCS2", label: "CCS2" },
    { value: "CHAdeMO", label: "CHAdeMO" },
];

const LOCATIONS = [
    { value: "all", label: "All Locations" },
    { value: "Home", label: "Home" },
    { value: "Office", label: "Office" },
    { value: "Public Station", label: "Public Station" },
    { value: "Mall", label: "Mall" },
    { value: "Highway Rest Stop", label: "Highway Rest Stop" },
];

interface HistoryFiltersProps {
    filters: HistoryFiltersState;
    onChange: (filters: HistoryFiltersState) => void;
}

export function HistoryFilters({ filters, onChange }: HistoryFiltersProps) {
    const [expanded, setExpanded] = useState(false);

    const update = (key: keyof HistoryFiltersState, value: string) => {
        onChange({ ...filters, [key]: value });
    };

    const hasActiveFilters =
        filters.from || filters.to || filters.location !== "all" || filters.chargerType !== "all" || filters.search;

    const clearFilters = () => {
        onChange({ from: "", to: "", location: "all", chargerType: "all", search: "" });
    };

    return (
        <div className="space-y-3">
            {/* Search + Toggle row */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => update("search", e.target.value)}
                        placeholder="Search by location..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-zinc-300 outline-none placeholder:text-zinc-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                    />
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${expanded || hasActiveFilters
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
                        }`}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </button>
            </div>

            {/* Expandable filters */}
            {expanded && (
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">From</label>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => update("from", e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">To</label>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => update("to", e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Location</label>
                        <select
                            value={filters.location}
                            onChange={(e) => update("location", e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-black"
                        >
                            {LOCATIONS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Charger</label>
                        <select
                            value={filters.chargerType}
                            onChange={(e) => update("chargerType", e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500/50 [&>option]:bg-black"
                        >
                            {CHARGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/10"
                        >
                            <X className="h-3 w-3" /> Clear
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
