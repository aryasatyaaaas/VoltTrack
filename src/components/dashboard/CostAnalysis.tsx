"use client";

import { Card } from "@/components/ui/Card";
import { DollarSign, TrendingUp, MapPin } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/types";

interface CostAnalysisProps {
    weeklyTrend: DashboardData["weeklyTrend"];
    costByLocation: DashboardData["energyBreakdown"]["costByLocation"];
    hero: DashboardData["hero"];
}

function CostTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-black/90 p-3 shadow-xl backdrop-blur-md">
                <span className="font-semibold text-emerald-400">Rp {payload[0].value.toLocaleString("id-ID")}</span>
                <span className="ml-2 text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
            </div>
        );
    }
    return null;
}

export function CostAnalysis({ weeklyTrend, costByLocation, hero }: CostAnalysisProps) {
    const totalCostAllLocations = costByLocation.reduce((s, l) => s + l.cost, 0) || 1;
    const costPerKwh = hero.totalKwh > 0 ? Math.round(hero.totalCost / hero.totalKwh) : 0;

    return (
        <div className="space-y-4">
            {/* Top stats row */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-500/10 p-1.5">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Cost / kWh</p>
                            <p className="text-lg font-bold text-white">Rp {costPerKwh.toLocaleString("id-ID")}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-cyan-500/10 p-1.5">
                            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">This Week</p>
                            <p className="text-lg font-bold text-white">Rp {hero.cost.toLocaleString("id-ID")}</p>
                        </div>
                    </div>
                </Card>
                <Card className="col-span-2 p-4 md:col-span-1">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-purple-500/10 p-1.5">
                            <MapPin className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Cheapest</p>
                            <p className="text-lg font-bold text-white">
                                {costByLocation.length > 0 ? costByLocation[costByLocation.length - 1].name : "—"}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Weekly cost trend chart */}
            <Card className="p-5">
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Weekly Cost Trend
                </h4>
                <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyTrend} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip content={<CostTooltip />} cursor={{ stroke: "#ffffff10" }} />
                            <XAxis
                                dataKey="week"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#52525b", fontSize: 10 }}
                                dy={10}
                                interval="preserveStartEnd"
                            />
                            <Area
                                type="monotone"
                                dataKey="cost"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCost)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Cost by location mini breakdown */}
            {costByLocation.length > 1 && (
                <Card className="p-5">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Cost by Location
                    </h4>
                    <div className="space-y-2">
                        {costByLocation.map((loc) => (
                            <div key={loc.name} className="flex items-center gap-3">
                                <span className="w-24 truncate text-xs font-medium text-zinc-300">{loc.name}</span>
                                <div className="flex-1">
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all"
                                            style={{ width: `${Math.max(loc.percent, 2)}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-500">Rp {loc.cost.toLocaleString("id-ID")}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
