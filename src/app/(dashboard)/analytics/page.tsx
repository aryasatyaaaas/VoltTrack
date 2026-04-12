"use client";

import { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Chart, Doughnut, Line } from "react-chartjs-2";
import type { HistorySession } from "@/types";

ChartJS.register(
    CategoryScale, LinearScale,
    PointElement, LineElement,
    BarElement, BarController, LineController,
    ArcElement,
    Title, Tooltip, Legend
);

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
        // Group by week-of-month (1–4)
        const week = Math.min(Math.ceil(date.getDate() / 7), 4);
        return `Wk ${week}`;
    }
    // year: group by month
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][date.getMonth()];
}

/** "week" = sessions from Mon–Sun of the current week */
function filterByPeriod(sessions: HistorySession[], period: Period): HistorySession[] {
    const now = new Date();
    if (period === "week") {
        const day = now.getDay(); // 0=Sun
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        return sessions.filter(s => {
            const d = isoToDate(s.sessionDate);
            return d >= monday && d <= sunday;
        });
    }
    if (period === "month") {
        // current month only
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return sessions.filter(s => isoToDate(s.sessionDate) >= start);
    }
    // year: current year
    const start = new Date(now.getFullYear(), 0, 1);
    return sessions.filter(s => isoToDate(s.sessionDate) >= start);
}

/** Build ordered labels array for a period */
function buildLabels(period: Period): string[] {
    if (period === "week") return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (period === "month") {
        // 4 weeks of the current month
        return ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];
    }
    // year: all 12 months
    return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
}

function aggregateByLabel(
    sessions: HistorySession[],
    labels: string[],
    period: Period
): { energy: number[]; cost: number[] } {
    const energyMap: Record<string, number> = {};
    const costMap: Record<string, number> = {};
    labels.forEach(l => { energyMap[l] = 0; costMap[l] = 0; });

    sessions.forEach(s => {
        const key = getLabelKey(isoToDate(s.sessionDate), period);
        if (energyMap[key] !== undefined) {
            energyMap[key] += s.energyKwh;
            costMap[key]   += (s.cost ?? 0) / 1000; // display in thousands
        }
    });

    return {
        energy: labels.map(l => Math.round(energyMap[l] * 10) / 10),
        cost:   labels.map(l => Math.round(costMap[l] * 10) / 10),
    };
}

/** Build 7×24 heatmap from ALL sessions (day‑of‑week × hour) */
function buildHeatmap(sessions: HistorySession[]): number[] {
    // counts[dayIndex * 24 + hour], dayIndex: 0=Mon…6=Sun
    const counts = new Array(7 * 24).fill(0);
    sessions.forEach(s => {
        const d = isoToDate(s.sessionDate);
        const dow = d.getDay(); // 0=Sun,1=Mon…6=Sat
        const dayIdx = dow === 0 ? 6 : dow - 1; // 0=Mon…6=Sun
        const hour = d.getHours();
        counts[dayIdx * 24 + hour]++;
    });
    const max = Math.max(...counts, 1);
    return counts.map(c => c / max);
}

/** Assign a consistent color from a palette to each unique location */
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
    period: Period
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

    const subMap: Record<Period, string> = {
        week:  "last 7 days",
        month: "this month",
        year:  "this year",
    };

    const fmtCost = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
        return Math.round(n).toLocaleString("en-US");
    };

    return {
        kpiKwh:    totalKwh.toFixed(1),
        kpiCost:   fmtCost(totalCost),
        kpiRate:   Math.round(rate).toLocaleString("id-ID"),
        kwdDelta:  pKwh.str,
        costDelta: pCost.str,
        rateDelta: pRate.str,
        kwdClass:  pKwh.cls,
        costClass: pCost.cls,
        rateClass: pRate.cls,
        sub:       subMap[period],
    };
}

/** Previous period sessions for delta calculation */
function getPreviousPeriod(sessions: HistorySession[], period: Period): HistorySession[] {
    const now = new Date();
    if (period === "week") {
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const thisMonday = new Date(now);
        thisMonday.setDate(now.getDate() + mondayOffset);
        thisMonday.setHours(0, 0, 0, 0);
        const prevMonday = new Date(thisMonday);
        prevMonday.setDate(thisMonday.getDate() - 7);
        const prevSunday = new Date(thisMonday);
        prevSunday.setDate(thisMonday.getDate() - 1);
        prevSunday.setHours(23, 59, 59, 999);
        return sessions.filter(s => {
            const d = isoToDate(s.sessionDate);
            return d >= prevMonday && d <= prevSunday;
        });
    }
    if (period === "month") {
        // previous month
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end   = new Date(now.getFullYear(), now.getMonth(), 1);
        return sessions.filter(s => {
            const d = isoToDate(s.sessionDate);
            return d >= start && d < end;
        });
    }
    // previous year
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end   = new Date(now.getFullYear(), 0, 1);
    return sessions.filter(s => {
        const d = isoToDate(s.sessionDate);
        return d >= start && d < end;
    });
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const [allSessions, setAllSessions] = useState<HistorySession[]>([]);
    const [loading, setLoading]         = useState(true);
    const [period, setPeriod]           = useState<Period>("month");

    useEffect(() => {
        fetch("/api/history?limit=2000")
            .then(r => r.json())
            .then(data => { if (data.sessions) setAllSessions(data.sessions); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // ── Derived data ──────────────────────────────────────────────────────
    const current  = filterByPeriod(allSessions, period);
    const previous = getPreviousPeriod(allSessions, period);
    const labels   = buildLabels(period);
    const { energy, cost } = aggregateByLabel(current, labels, period);
    const kpi      = computeKpi(current, previous, period);
    const heatmap  = buildHeatmap(allSessions);

    const locationColors = buildLocationColors(allSessions);

    // Charger distribution — grouped by actual location name
    const locationCount: Record<string, number> = {};
    allSessions.forEach(s => {
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

    // Scatter data — grouped by location (top 4 for readability)
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

    // Duration by label
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

    // ── Trend chart data ──────────────────────────────────────────────────
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
                label: "Cost (Rp K)",
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
            <div className="topbar">
                <div className="page-title">Analytics</div>
                <div className="period-switcher">
                    {(["week", "month", "year"] as Period[]).map(p => (
                        <button
                            key={p}
                            className={`period-btn${period === p ? " active" : ""}`}
                            onClick={() => setPeriod(p)}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
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
                    <div className="kpi-val">Rp <span style={{ fontSize: "22px" }}>{loading ? "—" : kpi.kpiCost}</span></div>
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
                        <div className="legend-item"><div className="legend-line" style={{ background: "#06D6A0" }}></div> Cost (Rp K)</div>
                    </div>
                </div>
                <div className="chart-wrap" style={{ height: "220px" }}>
                    <Chart
                        type="bar"
                        data={trendData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false }, tooltip: TOOLTIP_CFG },
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
                            <Doughnut
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
                    <Line
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
                                tooltip: { ...TOOLTIP_CFG, callbacks: { label: (ctx: any) => `${ctx.raw} min` } },
                            },
                            scales: { x: SCALE_X, y: SCALE_Y },
                        }}
                    />
                </div>
            </div>
        </>
    );
}
