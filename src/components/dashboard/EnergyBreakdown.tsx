"use client";

import { Card } from "@/components/ui/Card";
import { MapPin, Plug } from "lucide-react";
import type { DashboardData } from "@/types";

const LOCATION_COLORS: Record<string, string> = {
    Home: "bg-cyan-500",
    Office: "bg-blue-500",
    "Public Station": "bg-purple-500",
    Mall: "bg-amber-500",
    "Highway Rest Stop": "bg-emerald-500",
};

const CHARGER_COLORS: Record<string, string> = {
    AC: "bg-cyan-400",
    CCS2: "bg-blue-400",
    CHAdeMO: "bg-violet-400",
};

interface EnergyBreakdownProps {
    data: DashboardData["energyBreakdown"];
}

function BreakdownBar({ name, kwh, percent, color }: { name: string; kwh: number; percent: number; color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-300">{name}</span>
                <span className="text-zinc-500">{kwh} kWh · {percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                    className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.max(percent, 2)}%` }}
                />
            </div>
        </div>
    );
}

export function EnergyBreakdown({ data }: EnergyBreakdownProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* By Location */}
            <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-cyan-500/10 p-1.5">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Energy by Location
                    </h4>
                </div>
                <div className="space-y-3">
                    {data.locationBreakdown.map((item) => (
                        <BreakdownBar
                            key={item.name}
                            {...item}
                            color={LOCATION_COLORS[item.name] ?? "bg-zinc-500"}
                        />
                    ))}
                    {data.locationBreakdown.length === 0 && (
                        <p className="text-xs text-zinc-600">No data yet</p>
                    )}
                </div>
            </Card>

            {/* By Charger Type */}
            <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-blue-500/10 p-1.5">
                        <Plug className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Energy by Charger
                    </h4>
                </div>
                <div className="space-y-3">
                    {data.chargerBreakdown.map((item) => (
                        <BreakdownBar
                            key={item.name}
                            {...item}
                            color={CHARGER_COLORS[item.name] ?? "bg-zinc-500"}
                        />
                    ))}
                    {data.chargerBreakdown.length === 0 && (
                        <p className="text-xs text-zinc-600">No data yet</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
