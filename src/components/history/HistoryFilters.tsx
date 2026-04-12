"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X, Calendar, MapPin, Plug } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { HistoryFiltersState } from "@/types";

const CHARGER_TYPES = [
    { value: "all", label: "All Types" },
    { value: "AC", label: "AC" },
    { value: "CCS2", label: "CCS2" },
    { value: "CHAdeMO", label: "CHAdeMO" },
];

interface HistoryFiltersProps {
    filters: HistoryFiltersState;
    onChange: (filters: HistoryFiltersState) => void;
}

export function HistoryFilters({ filters, onChange }: HistoryFiltersProps) {
    const [expanded, setExpanded] = useState(false);
    const [locations, setLocations] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/history/locations")
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                setLocations(data?.locations ?? []);
            })
            .catch(() => { });
    }, []);

    const update = (key: keyof HistoryFiltersState, value: string) => {
        onChange({ ...filters, [key]: value });
    };

    const hasActiveFilters =
        filters.from || filters.to || filters.location !== "all" || filters.chargerType !== "all" || filters.search;

    const clearFilters = () => {
        onChange({ from: "", to: "", location: "all", chargerType: "all", search: "" });
    };

    const pillInputStyle = {
        background: "white",
        border: "1px solid var(--border)",
        color: "var(--ink)",
    } as React.CSSProperties;

    return (
        <div className="space-y-3">
            {/* Search + Filter toggle row */}
            <div className="flex items-center gap-2">
                {/* Search pill */}
                <div className="relative flex-1">
                    <Search
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                        style={{ color: "var(--volt-orange)" }}
                    />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => update("search", e.target.value)}
                        placeholder="Search sessions..."
                        className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition-all"
                        style={pillInputStyle}
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

                {/* Filter toggle pill */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl transition-all"
                    style={{
                        background: expanded || hasActiveFilters
                            ? "var(--volt-orange)"
                            : "white",
                        border: "1px solid var(--border)",
                        color: expanded || hasActiveFilters ? "white" : "var(--ink-muted)",
                    }}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </button>
            </div>

            {/* Expanded filter panel */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div
                            className="flex flex-wrap items-end gap-3 rounded-2xl p-4"
                            style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            {/* From date */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                    <Calendar className="h-3 w-3" /> From
                                </label>
                                <input
                                    type="date"
                                    value={filters.from}
                                    onChange={(e) => update("from", e.target.value)}
                                    className="rounded-xl px-3 py-2 text-sm outline-none transition-all bg-white"
                                    style={pillInputStyle}
                                    onFocus={e => {
                                        e.currentTarget.style.border = "1px solid var(--volt-orange)";
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.border = "1px solid var(--border)";
                                    }}
                                />
                            </div>

                            {/* To date */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                    <Calendar className="h-3 w-3" /> To
                                </label>
                                <input
                                    type="date"
                                    value={filters.to}
                                    onChange={(e) => update("to", e.target.value)}
                                    className="rounded-xl px-3 py-2 text-sm outline-none transition-all bg-white"
                                    style={pillInputStyle}
                                    onFocus={e => {
                                        e.currentTarget.style.border = "1px solid var(--volt-orange)";
                                    }}
                                    onBlur={e => {
                                        e.currentTarget.style.border = "1px solid var(--border)";
                                    }}
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                    <MapPin className="h-3 w-3" /> Location
                                </label>
                                <select
                                    value={filters.location}
                                    onChange={(e) => update("location", e.target.value)}
                                    className="appearance-none rounded-xl px-4 py-2 text-sm outline-none transition-all bg-white"
                                    style={pillInputStyle}
                                >
                                    <option value="all">All Locations</option>
                                    {locations.map((loc) => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Charger type */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--ink-muted)" }}>
                                    <Plug className="h-3 w-3" /> Charger
                                </label>
                                <select
                                    value={filters.chargerType}
                                    onChange={(e) => update("chargerType", e.target.value)}
                                    className="appearance-none rounded-xl px-4 py-2 text-sm outline-none transition-all bg-white"
                                    style={pillInputStyle}
                                >
                                    {CHARGER_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition hover:bg-gray-100"
                                    style={{
                                        background: "white",
                                        border: "1px solid var(--border)",
                                        color: "var(--ink)",
                                    }}
                                >
                                    <X className="h-3 w-3" /> Clear
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
