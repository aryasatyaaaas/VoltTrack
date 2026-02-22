import { Card } from "@/components/ui/Card";
import { Zap, BatteryCharging } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { RecentSession } from "@/types";

interface RecentSessionsProps {
    sessions: RecentSession[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
    return (
        <Card className="h-full">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
                Recent Activity
            </h3>
            <div className="space-y-4">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3 transition hover:bg-white/[0.04]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-400">
                                <Zap className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-white">
                                    {session.energyKwh.toFixed(1)} kWh
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {new Date(session.sessionDate).toLocaleDateString([], {
                                        month: "short",
                                        day: "numeric",
                                    })}{" "}
                                    • {session.location}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-white">
                                {formatCurrency(session.cost || 0)}
                            </p>
                            <div className="flex items-center justify-end gap-1 text-xs text-zinc-500">
                                <BatteryCharging className="h-3 w-3" />
                                {session.chargerType}
                            </div>
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && (
                    <p className="py-4 text-center text-sm text-zinc-500">
                        No recent sessions found.
                    </p>
                )}
            </div>
        </Card>
    );
}
