"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface PersonalHeroProps {
    kwh: number;
    cost: number;
    trendPercentage: number;
    sessionsCount: number;
    sparkData: number[];
}

function useCountUp(target: number, duration = 1.4) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = (target / (duration * 60));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { 
                setDisplay(target); 
                clearInterval(timer); 
            } else {
                setDisplay(start);
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [target, duration]);
    return display;
}

export function PersonalHero({ kwh, cost, trendPercentage, sessionsCount, sparkData }: PersonalHeroProps) {
    const animKwh = useCountUp(kwh);
    
    // Process sparkData dynamically
    const maxH = Math.max(...sparkData, 1); // fallback to 1 to avoid /0

    const isUp = trendPercentage > 0;
    const trendLabel = isUp ? `+${trendPercentage}% vs last month` : `${trendPercentage}% vs last month`;

    return (
        <div className="hero">
            <div className="hero-left">
                <div className="hero-eyebrow">energy this month</div>
                <div className="hero-number">
                    {animKwh.toFixed(1)}<span className="unit">kWh</span>
                </div>
                <div className="hero-meta">
                    <div className="hero-cost">
                        Total cost: <strong>{formatCurrency(cost)}</strong>
                    </div>
                    {trendPercentage !== 0 && (
                        <div className="hero-change">
                            {trendLabel}
                        </div>
                    )}
                </div>
            </div>
            <div className="hero-right">
                <div className="sparkline">
                    {sparkData.map((val, i) => {
                        const h = Math.max(4, (val / maxH) * 52); // scale height to ~52px
                        const isActive = i === sparkData.length - 1;
                        const isMid = i >= sparkData.length - 2 && !isActive;
                        let className = "spark-bar";
                        if (isActive) className += " active";
                        else if (isMid) className += " mid";
                        
                        return (
                            <div 
                                key={i} 
                                className={className} 
                                style={{ height: `${h}px` }} 
                            />
                        );
                    })}
                </div>
                <div className="hero-sessions">
                    <div className="hero-sessions-val">{sessionsCount} sessions</div>
                    <div className="hero-sessions-label">this month</div>
                </div>
            </div>
        </div>
    );
}


