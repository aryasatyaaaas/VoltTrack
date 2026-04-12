"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import type { TimelineItem } from "@/types";

interface ActivityTimelineProps {
    items: TimelineItem[];
}

function getRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(date).getTime() - new Date().getTime()) / 86400000);
    if (daysDifference === 0) return "Today";
    if (daysDifference === -1) return "Yesterday";
    return rtf.format(daysDifference, 'day');
}

function getSpeedClass(kwh: number) {
    if (kwh >= 20) return "fast";
    if (kwh >= 10) return "normal";
    return "slow";
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
    if (items.length === 0) {
        return (
            <div className="volt-card flex flex-col items-center justify-center gap-3 rounded-3xl p-14 text-center">
                <p className="text-sm font-medium" style={{ color: "var(--ink-muted)" }}>
                    No charging sessions yet — time to plug in!
                </p>
                <Link
                    href="/charging"
                    className="mt-1 rounded-xl px-5 py-2 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
                    style={{ background: "var(--volt-orange)" }}
                >
                    Log First Session
                </Link>
            </div>
        );
    }

    return (
        <div className="sessions">
            {items.map((item, i) => {
                const speedClass = getSpeedClass(item.kwh);
                // Fake percentage for battery UI based on kWh
                const pct = Math.min(100, Math.max(10, (item.kwh / 40) * 100));

                return (
                    <div key={item.id} className="session-row">
                        <div className={`session-dot ${speedClass}`}></div>
                        <div className="session-info">
                            <div className="session-name">{item.location}</div>
                            <div className="session-meta">{getRelativeTime(item.date)}</div>
                        </div>
                        <div className="session-right">
                            <div className="session-kwh">{item.kwh.toFixed(1)} kWh</div>
                            <div className="session-dur">{item.duration}</div>
                            <div className="battery-wrap">
                                <div 
                                    className={`battery-fill ${speedClass}`} 
                                    style={{ width: `${pct}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

