"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ChevronDown, Check } from "lucide-react";
import type { HistorySession } from "@/types";
import { getCurrencySymbol } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const MixedChart = dynamic(() => import('@/components/analytics/LazyCharts').then(mod => mod.MixedChart), {
    ssr: false,
    loading: () => <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
});

const DoughnutChart = dynamic(() => import('@/components/analytics/LazyCharts').then(mod => mod.DoughnutChart), {
    ssr: false,
    loading: () => <div className="h-full w-full rounded-full animate-pulse aspect-square" style={{ background: 'var(--surface)' }} />
});

const LineChart = dynamic(() => import('@/components/analytics/LazyCharts').then(mod => mod.LineChart), {
    ssr: false,
    loading: () => <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />
});

// ── Constants ──────────────────────────────────────────────────────────────
type Period = "week" | "month" | "year";

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TOOLTIP_CFG = {
    backgroundColor:  "#1A1A2E",
    titleColor:       "#fff",
    bodyColor:        "rgba(255,255,255,0.7)",
    padding:          10,
    cornerRadius:     8,
    displayColors:    false as const,
};

const SCALE_X = {
    grid: { display: false },
    border: { display: false },
    ticks: { color: "#888780" },
};
const SCALE_Y = {
    grid: { color: "rgba(26,26,46,0.05)" },
    border: { display: false },
    ticks: { color: "#888780" },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function isoToDate(s: string) { return new Date(s); }

/** Returns a label key for grouping by period */
function getLabelKey(date: Date, period: Period): string {
    if (period === "week") {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
    }
    if (period === "month") {
        const week = Math.min(Math.ceil(date.getDate() / 7), 4);
        return `W${week}`;
    }
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][date.getMonth()];
}

/** Build ordered labels array for a period */
function buildLabels(period: Period): string[] {
    if (period === "week") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (period === "month") return ["W1", "W2", "W3", "W4"];
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
}

/**
 * Compute start/end Date boundaries for a period+offset.
 * offset=0 → current period, offset=-1 → previous, etc.
 */
function getPeriodBounds(period: Period, offset: number): { start: Date; end: Date } {
    const now = new Date();

    if (period === "week") {
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const thisMonday = new Date(now);
        thisMonday.setDate(now.getDate() + mondayOffset);
        thisMonday.setHours(0, 0, 0, 0);

        const start = new Date(thisMonday);
        start.setDate(thisMonday.getDate() + offset * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    if (period === "month") {
        const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        const end   = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59, 999);
        return { start, end };
    }

    // year
    const y = now.getFullYear() + offset;
    const start = new Date(y, 0, 1);
    const end   = new Date(y, 11, 31, 23, 59, 59, 999);
    return { start, end };
}

function filterByBounds(sessions: HistorySession[], start: Date, end: Date): HistorySession[] {
    return sessions.filter(s => {
        const d = isoToDate(s.sessionDate);
        return d >= start && d <= end;
    });
}

/** Human-readable label for the current navigation state */
function getPeriodLabel(period: Period, offset: number): string {
    const now = new Date();
    if (offset === 0) {
        return period === "week" ? "This Week" : period === "month" ? "This Month" : "This Year";
    }

    if (period === "week") {
        const { start } = getPeriodBounds("week", offset);
        return `Week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    if (period === "month") {
        const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
        return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    return String(now.getFullYear() + offset);
}

function aggregateByLabel(
    sessions: HistorySession[],
    labels: string[],
    period: Period
): { energy: number[]; cost: number[]; costRaw: number[] } {
    const energyMap: Record<string, number> = {};
    const costMap: Record<string, number>   = {};
    labels.forEach(l => { energyMap[l] = 0; costMap[l] = 0; });

    sessions.forEach(s => {
        const key = getLabelKey(isoToDate(s.sessionDate), period);
        if (energyMap[key] !== undefined) {
            energyMap[key] += s.energyKwh;
            costMap[key]   += (s.cost ?? 0) / 1000;
        }
    });

    return {
        energy:  labels.map(l => Math.round(energyMap[l] * 10) / 10),
        cost:    labels.map(l => Math.round(costMap[l]   * 10) / 10),
        costRaw: labels.map(l => Math.round((costMap[l] ?? 0) * 1000)),
    };
}

/** Build 7×24 heatmap from ALL sessions */
function buildHeatmap(sessions: HistorySession[]): number[] {
    const counts = new Array(7 * 24).fill(0);
    sessions.forEach(s => {
        const d = isoToDate(s.sessionDate);
        const dow = d.getDay();
        const dayIdx = dow === 0 ? 6 : dow - 1;
        const hour = d.getHours();
        counts[dayIdx * 24 + hour]++;
    });
    const max = Math.max(...counts, 1);
    return counts.map(c => c / max);
}

const LOCATION_PALETTE = [
    "#FF6B35", "#06D6A0", "#118AB2", "#7B5EA7",
    "#FFD93D", "#EF476F", "#26C6DA", "#9CCC65",
];

function buildLocationColors(sessions: HistorySession[]): Record<string, string> {
    const unique: string[] = [];
    sessions.forEach(s => {
        if (!unique.includes(s.location)) unique.push(s.location);
    });
    const map: Record<string, string> = {};
    unique.forEach((loc, i) => { map[loc] = LOCATION_PALETTE[i % LOCATION_PALETTE.length]; });
    return map;
}

interface KpiData {
    kpiKwh: string;
    kpiCost: string;
    kpiRate: string;
    kwdDelta: string;
    costDelta: string;
    rateDelta: string;
    kwdClass: string;
    costClass: string;
    rateClass: string;
    sub: string;
}

function computeKpi(
    current: HistorySession[],
    previous: HistorySession[],
    periodLabel: string
): KpiData {
    const totalKwh  = current.reduce((s, r) => s + r.energyKwh, 0);
    const totalCost = current.reduce((s, r) => s + (r.cost ?? 0), 0);
    const rate      = totalKwh > 0 ? totalCost / totalKwh : 0;

    const prevKwh  = previous.reduce((s, r) => s + r.energyKwh, 0);
    const prevCost = previous.reduce((s, r) => s + (r.cost ?? 0), 0);
    const prevRate = prevKwh > 0 ? prevCost / prevKwh : 0;

    const fmtPct = (cur: number, prev: number) => {
        if (prev === 0) return { str: "—", cls: "neu" };
        const diff = ((cur - prev) / prev) * 100;
        return { str: `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}%`, cls: diff >= 0 ? "up" : "down" };
    };

    const pKwh  = fmtPct(totalKwh, prevKwh);
    const pCost = fmtPct(totalCost, prevCost);
    const pRate = fmtPct(rate, prevRate);

    const fmtCost = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
        return Math.round(n).toLocaleString("en-US");
    };

    return {
        kpiKwh:    totalKwh.toFixed(1),
        kpiCost:   fmtCost(totalCost),
        kpiRate:   Math.round(rate).toLocaleString("en-US"),
        kwdDelta:  pKwh.str,
        costDelta: pCost.str,
        rateDelta: pRate.str,
        kwdClass:  pKwh.cls,
        costClass: pCost.cls,
        rateClass: pRate.cls,
        sub:       periodLabel,
    };
}

// ── Picker options generator ───────────────────────────────────────────────
interface PickerOption { label: string; offset: number; }

function buildPickerOptions(
    period: Period,
    sessions: HistorySession[],
    maxBack = 24
): PickerOption[] {
    const limit = period === "year" ? 10 : period === "week" ? 52 : maxBack;
    const opts: PickerOption[] = [];

    for (let i = 0; i >= -limit; i--) {
        // Always include the current period
        if (i === 0) {
            opts.push({ label: getPeriodLabel(period, i), offset: i });
            continue;
        }
        const { start, end } = getPeriodBounds(period, i);
        const hasData = sessions.some(s => {
            const d = isoToDate(s.sessionDate);
            return d >= start && d <= end;
        });
        if (hasData) {
            opts.push({ label: getPeriodLabel(period, i), offset: i });
        }
    }

    return opts;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const queryClient = useQueryClient();
    const [allSessions, setAllSessions] = useState<HistorySession[]>([]);
    const [loading, setLoading]         = useState(true);
    const [period, setPeriod]           = useState<Period>("month");
    const [offset, setOffset]           = useState(0);   // 0 = current, -1 = prev, etc.
    const [currency, setCurrency]       = useState("IDR");
    const [showPicker, setShowPicker]   = useState(false);
    const pickerRef                     = useRef<HTMLDivElement>(null);

    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ['analytics/stats'],
        queryFn: async () => {
            const r = await fetch("/api/history?limit=2000");
            if (!r.ok) throw new Error("Failed to fetch");
            return r.json();
        },
        staleTime: 60 * 1000
    });

    useEffect(() => {
        if (historyData?.sessions) {
            setAllSessions(historyData.sessions);
        }
        if (!historyLoading) {
            setLoading(false);
        }
    }, [historyData, historyLoading]);

    useEffect(() => {
        fetch("/api/profile")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.preferences?.currency) setCurrency(data.preferences.currency);
            })
            .catch(() => {});
    }, []);

    // Close picker on outside click
    useEffect(() => {
        if (!showPicker) return;
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showPicker]);

    // Reset offset when period changes
    const handlePeriodChange = (p: Period) => {
        setPeriod(p);
        setOffset(0);
        setShowPicker(false);
    };

    const handlePickerSelect = (o: number) => {
        setOffset(o);
        setShowPicker(false);
    };

    // ── Derived data ──────────────────────────────────────────────────────
    const { start: curStart, end: curEnd }   = getPeriodBounds(period, offset);
    const { start: prevStart, end: prevEnd } = getPeriodBounds(period, offset - 1);

    const current  = filterByBounds(allSessions, curStart, curEnd);
    const previous = filterByBounds(allSessions, prevStart, prevEnd);

    const labels   = buildLabels(period);
    const { energy, cost, costRaw } = aggregateByLabel(current, labels, period);
    const periodLabel = getPeriodLabel(period, offset);
    const kpi         = computeKpi(current, previous, periodLabel);
    const heatmap     = buildHeatmap(allSessions);

    const currencySymbol = getCurrencySymbol(currency);
    const costLabel = currencySymbol.length === 1
        ? `Cost (${currencySymbol}K)`
        : `Cost (K)`;
    // Format cost for tooltip
    const fmtCostTooltip = (raw: number) => {
        const sym = getCurrencySymbol(currency);
        const formatted = raw.toLocaleString("en-US");
        return sym.length === 1 ? `${sym}${formatted}` : `${sym} ${formatted}`;
    };

    const locationColors = buildLocationColors(allSessions);

    const locationCount: Record<string, number> = {};
    current.forEach(s => {
        locationCount[s.location] = (locationCount[s.location] ?? 0) + 1;
    });
    const total = Object.values(locationCount).reduce((a, b) => a + b, 0) || 1;
    const chargerRows = Object.entries(locationCount)
        .map(([name, count]) => ({
            name,
            pct: Math.round((count / total) * 100),
            sessions: count,
            color: locationColors[name] ?? "#888780",
        }))
        .sort((a, b) => b.sessions - a.sessions);

    const topLocations = chargerRows.slice(0, 4).map(c => c.name);
    const scatterDatasets = topLocations.map(loc => ({
        label: loc,
        data: allSessions
            .filter(s => s.location === loc && s.durationMinutes != null && s.energyKwh > 0)
            .map(s => ({ x: s.durationMinutes!, y: s.energyKwh })),
        backgroundColor: (locationColors[loc] ?? "#888780") + "CC",
        pointRadius: 6,
        pointHoverRadius: 8,
    }));

    const durationMap: Record<string, number[]> = {};
    labels.forEach(l => { durationMap[l] = []; });
    current.forEach(s => {
        if (s.durationMinutes == null) return;
        const key = getLabelKey(isoToDate(s.sessionDate), period);
        if (durationMap[key]) durationMap[key].push(s.durationMinutes);
    });
    const avgDuration = labels.map(l => {
        const vals = durationMap[l];
        if (!vals || vals.length === 0) return 0;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    });

    const trendData = {
        labels,
        datasets: [
            {
                type: "bar" as const,
                label: "Energy (kWh)",
                data: energy,
                backgroundColor: "rgba(255,107,53,0.18)",
                borderColor: "#FF6B35",
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false as const,
                yAxisID: "y",
            },
            {
                type: "line" as const,
                label: costLabel,
                data: cost,
                borderColor: "#06D6A0",
                borderWidth: 2,
                backgroundColor: "#06D6A0",
                pointBackgroundColor: "#06D6A0",
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
                fill: false as const,
                yAxisID: "y2",
            },
        ],
    };

    return (
        <>
            {/* ── TOPBAR ── */}
            {/*
                Desktop: [Analytics] .................. [Week Month Year] [This Month ▾]
                Mobile row 1: [Analytics] ............. [This Month ▾]
                Mobile row 2: [Week Month Year]
                Achieved with: flex-wrap on outer div + order via className
            */}
            <div className="analytics-topbar">
                {/* Title — always row 1 left */}
                <div className="page-title">Analytics</div>

                {/* Period switcher — row 1 on desktop, row 2 on mobile */}
                <div className="analytics-period-row period-switcher">
                    {(["week", "month", "year"] as Period[]).map(p => (
                        <button
                            key={p}
                            className={`period-btn${period === p ? " active" : ""}`}
                            onClick={() => handlePeriodChange(p)}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Picker — always row 1 right */}
                <div ref={pickerRef} className="analytics-picker-wrap">
                    <button
                        id="analytics-period-picker-btn"
                        onClick={() => setShowPicker(v => !v)}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            height: "32px", padding: "0 12px",
                            borderRadius: "10px",
                            border: `1px solid ${showPicker ? "var(--orange)" : "var(--border)"}`,
                            background: showPicker ? "rgba(255,107,53,0.06)" : "var(--white)",
                            cursor: "pointer",
                            fontSize: "12px", fontWeight: 600,
                            color: showPicker ? "var(--orange)" : "var(--ink)",
                            whiteSpace: "nowrap",
                            transition: "all 0.15s",
                        }}
                    >
                        {periodLabel}
                        <ChevronDown
                            size={13}
                            style={{
                                transition: "transform 0.2s",
                                transform: showPicker ? "rotate(180deg)" : "rotate(0deg)",
                                flexShrink: 0,
                            }}
                        />
                    </button>

                    {/* Dropdown list */}
                    {showPicker && (
                        <div style={{
                            position: "absolute", top: "calc(100% + 6px)", right: 0,
                            background: "var(--white)",
                            border: "1px solid var(--border)",
                            borderRadius: "14px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                            zIndex: 50,
                            minWidth: "160px",
                            maxHeight: "260px",
                            overflowY: "auto",
                            padding: "6px",
                        }}>
                            {buildPickerOptions(period, allSessions).map(opt => (
                                <button
                                    key={opt.offset}
                                    onClick={() => handlePickerSelect(opt.offset)}
                                    style={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                        width: "100%", padding: "8px 12px",
                                        borderRadius: "9px", border: "none",
                                        background: opt.offset === offset
                                            ? "rgba(255,107,53,0.08)"
                                            : "transparent",
                                        color: opt.offset === offset ? "var(--orange)" : "var(--ink)",
                                        fontSize: "13px", fontWeight: opt.offset === offset ? 600 : 400,
                                        cursor: "pointer", textAlign: "left",
                                        fontFamily: "inherit",
                                        transition: "background 0.12s",
                                    }}
                                    onMouseEnter={e => {
                                        if (opt.offset !== offset)
                                            (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLButtonElement).style.background =
                                            opt.offset === offset ? "rgba(255,107,53,0.08)" : "transparent";
                                    }}
                                >
                                    {opt.label}
                                    {opt.offset === offset && <Check size={13} style={{ flexShrink: 0 }} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── KPI CARDS ── */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-top">
                        <div className="kpi-icon orange">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 1.5L3.5 8H7.5L6 13.5 12.5 7H8L10 1.5z"/>
                            </svg>
                        </div>
                        <span className={`kpi-delta ${kpi.kwdClass}`}>{kpi.kwdDelta}</span>
                    </div>
                    <div className="kpi-val">{loading ? "—" : kpi.kpiKwh} <span className="unit">kWh</span></div>
                    <div className="kpi-label">Total energy — {kpi.sub}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-top">
                        <div className="kpi-icon green">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="13" height="10" rx="2"/>
                                <path d="M5 3V2M10 3V2M1 7h13"/>
                            </svg>
                        </div>
                        <span className={`kpi-delta ${kpi.costClass}`}>{kpi.costDelta}</span>
                    </div>
                    <div className="kpi-val">
                        {currencySymbol.length === 1 ? (
                            <>{currencySymbol}<span style={{ fontSize: "22px" }}>{loading ? "—" : kpi.kpiCost}</span></>
                        ) : (
                            <>{currencySymbol} <span style={{ fontSize: "22px" }}>{loading ? "—" : kpi.kpiCost}</span></>
                        )}
                    </div>
                    <div className="kpi-label">Total cost — {kpi.sub}</div>
                </div>
            </div>

            {/* ── TREND CHART ── */}
            <div className="chart-card">
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Energy &amp; Cost Trend</div>
                        <div className="chart-sub">{kpi.sub}</div>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item"><div className="legend-dot" style={{ background: "#FF6B35" }}></div> Energy (kWh)</div>
                        <div className="legend-item"><div className="legend-line" style={{ background: "#06D6A0" }}></div> {costLabel}</div>
                    </div>
                </div>
                <div className="chart-wrap" style={{ height: "220px" }}>
                    <ErrorBoundary fallback={<div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-gray-500">Grafik tidak dapat dimuat.</div>}>
                        <MixedChart
                            type="bar"
                            data={trendData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        ...TOOLTIP_CFG,
                                        callbacks: {
                                            label: (ctx: any) => {
                                                if (ctx.dataset.label === "Energy (kWh)") {
                                                    const rp = costRaw[ctx.dataIndex];
                                                    return [
                                                        `Energy: ${ctx.raw} kWh`,
                                                        `Cost: ${fmtCostTooltip(rp)}`,
                                                    ];
                                                }
                                                return `Cost: ${fmtCostTooltip((ctx.raw as number) * 1000)}`;
                                            },
                                        },
                                    },
                                },
                                scales: {
                                    x: SCALE_X,
                                    y: SCALE_Y,
                                    y2: {
                                        position: "right",
                                        grid: { display: false },
                                        border: { display: false },
                                        ticks: { color: "#06D6A0" },
                                    },
                                },
                            }}
                        />
                    </ErrorBoundary>
                </div>
            </div>

            {/* ── ROW 2: HEATMAP + CHARGER ── */}
            <div className="row-2">

                {/* Heatmap */}
                <div className="chart-card" style={{ margin: 0 }}>
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Charging Time Pattern</div>
                            <div className="chart-sub">Session intensity by hour &amp; day</div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item"><div className="legend-dot" style={{ background: "rgba(255,107,53,0.15)" }}></div> Rarely</div>
                            <div className="legend-item"><div className="legend-dot" style={{ background: "#FF6B35" }}></div> Often</div>
                        </div>
                    </div>
                    <div className="heatmap-wrap">
                        <div className="heatmap-grid">
                            <div />
                            {HOURS.map(h => (
                                <div key={h} className="hm-hour-label">{h % 6 === 0 ? `${h}h` : ""}</div>
                            ))}
                            {DAYS.map((day, di) => (
                                <div key={day} style={{ display: "contents" }}>
                                    <div className="hm-day-label">{day}</div>
                                    {HOURS.map((_, hi) => {
                                        const val   = heatmap[di * 24 + hi];
                                        const alpha = (0.08 + val * 0.92).toFixed(2);
                                        return (
                                            <div
                                                key={hi}
                                                className="hm-cell"
                                                style={{ background: `rgba(255,107,53,${alpha})` }}
                                                title={`${day} ${hi}:00 — ${Math.round(val * 5)} sessions`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "10px" }}>Hover a cell for details</div>
                </div>

                {/* Charger distribution */}
                <div className="chart-card" style={{ margin: 0 }}>
                    <div className="chart-header">
                        <div>
                            <div className="chart-title">Charger Distribution</div>
                            <div className="chart-sub">By number of sessions</div>
                        </div>
                    </div>
                    <div className="charger-layout">
                        <div className="charger-donut-wrap">
                            <ErrorBoundary fallback={<div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-gray-500">Grafik tidak dapat dimuat.</div>}>
                                <DoughnutChart
                                    data={{
                                        labels: chargerRows.map(c => c.name),
                                        datasets: [{ data: chargerRows.map(c => c.pct), backgroundColor: chargerRows.map(c => c.color), borderWidth: 0, hoverOffset: 6 }],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        cutout: "68%",
                                        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_CFG, displayColors: true } },
                                    }}
                                />
                            </ErrorBoundary>
                        </div>
                        <div className="charger-table">
                            {chargerRows.map((c, i) => (
                                <div key={i} className="charger-row">
                                    <div className="charger-dot" style={{ background: c.color }} />
                                    <div className="charger-name">{c.name}</div>
                                    <div>
                                        <div className="charger-pct">{c.pct}%</div>
                                        <div className="charger-sessions">{c.sessions} sessions</div>
                                    </div>
                                </div>
                            ))}
                            {chargerRows.length === 0 && (
                                <div style={{ color: "var(--muted)", fontSize: "12px" }}>No session data yet</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── DURATION CHART ── */}
            <div className="chart-card">
                <div className="chart-header">
                    <div>
                        <div className="chart-title">Avg Session Duration</div>
                        <div className="chart-sub">Trend — {kpi.sub} (minutes)</div>
                    </div>
                    <div className="chart-legend">
                        <div className="legend-item"><div className="legend-line" style={{ background: "#7B5EA7" }}></div> Avg Duration</div>
                    </div>
                </div>
                <div className="chart-wrap" style={{ height: "200px" }}>
                    <ErrorBoundary fallback={<div className="flex h-full w-full items-center justify-center p-4 text-center text-sm text-gray-500">Grafik tidak dapat dimuat.</div>}>
                        <LineChart
                            data={{
                                labels,
                                datasets: [{
                                    label: "Avg Duration (min)",
                                    data: avgDuration,
                                    borderColor: "#7B5EA7",
                                    borderWidth: 2,
                                    backgroundColor: "rgba(123,94,167,0.08)",
                                    pointBackgroundColor: "#7B5EA7",
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                    tension: 0.4,
                                    fill: true,
                                }],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        ...TOOLTIP_CFG,
                                        callbacks: {
                                            label: (ctx: any) => {
                                                const label = ctx.dataset.label ?? "";
                                                const mins = ctx.raw as number;
                                                const labelIdx = ctx.dataIndex;
                                                const rp = costRaw[labelIdx];
                                                return [
                                                    `${label}: ${mins} min`,
                                                    `Total cost: ${fmtCostTooltip(rp)}`,
                                                ];
                                            },
                                        },
                                    },
                                },
                                scales: { x: SCALE_X, y: SCALE_Y },
                            }}
                        />
                    </ErrorBoundary>
                </div>
            </div>
        </>
    );
}
