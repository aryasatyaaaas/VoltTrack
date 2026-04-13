"use client";

import { formatCurrency } from "@/lib/utils";

interface HighlightCardsProps {
    weeklyKwh: number;
    weeklyCost: number;
    topLocationMonth: string;
}

export function HighlightCards({ weeklyKwh, weeklyCost, topLocationMonth }: HighlightCardsProps) {
    return (
        <div className="metrics">
            <div className="metric-card">
                <div className="metric-icon orange">
                    <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 1.5L3.5 8H7.5L6 13.5 12.5 7H8L10 1.5z" />
                    </svg>
                </div>
                <div className="metric-val">{weeklyKwh.toFixed(1)} <span className="unit">kWh</span></div>
                <div className="metric-label">Total Energy — this week</div>
            </div>
            
            <div className="metric-card">
                <div className="metric-icon teal">
                    <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="13" height="10" rx="2" />
                        <path d="M5 3V2M10 3V2M1 7h13" />
                    </svg>
                </div>
                <div className="metric-val text-lg">
                    {formatCurrency(Math.round(weeklyCost))}
                </div>
                <div className="metric-label">Total Cost — this week</div>
            </div>
            
            <div className="metric-card">
                <div className="metric-icon purple">
                    <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7.5 1.5C5 1.5 2.5 3.7 2.5 6.5c0 3.5 5 7 5 7s5-3.5 5-7c0-2.8-2.5-5-5-5z" />
                        <circle cx="7.5" cy="6.5" r="1.5" />
                    </svg>
                </div>
                <div className="metric-val place">{topLocationMonth || "—"}</div>
                <div className="metric-label">Favorite Station — this month</div>
            </div>
        </div>
    );
}


