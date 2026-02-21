"use client";

import {
    AreaChart,
    Area,
    XAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import type { DashboardData } from "@/types";

interface TrendChartProps {
    data: DashboardData["weeklyTrend"];
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-black/90 p-3 shadow-xl backdrop-blur-md">
                <span className="font-semibold text-white">{payload[0].value} kWh</span>
                <span className="ml-2 text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
            </div>
        );
    }
    return null;
}

export function TrendChart({ data }: TrendChartProps) {
    return (
        <div className="h-[200px] w-full">
            <h3 className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Activity Trend
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#ffffff10" }} />
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
                        dataKey="kwh"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorKwh)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
