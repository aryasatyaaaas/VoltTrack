"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Zap, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PersonalHeroProps {
    greeting: string;
    kwh: number;
    cost: number;
    trendPercentage: number;
}

const WEEKLY_GOAL = 200;

// Ring dimensions — slightly smaller on mobile via CSS clamp
const RADIUS = 100;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE) * 2 + 8;

export function PersonalHero({ greeting, kwh, cost, trendPercentage }: PersonalHeroProps) {
    const [displayGreeting, setDisplayGreeting] = useState(greeting);

    useEffect(() => {
        const name = greeting.split(", ")[1] || "there";
        const hour = new Date().getHours();
        let prefix = "Good morning";
        if (hour >= 12 && hour < 18) prefix = "Good afternoon";
        else if (hour >= 18) prefix = "Good evening";
        setDisplayGreeting(`${prefix}, ${name}`);
    }, [greeting]);

    const progress = Math.min(kwh / WEEKLY_GOAL, 1);
    const animatedProgress = useMotionValue(0);
    const strokeDashoffset = useTransform(
        animatedProgress,
        (v) => CIRCUMFERENCE * (1 - v)
    );

    useEffect(() => {
        const controls = animate(animatedProgress, progress, {
            duration: 1.8,
            ease: [0.16, 1, 0.3, 1],
        });
        return controls.stop;
    }, [progress]);

    const isDown = trendPercentage < -5;
    const isUp = trendPercentage > 15;

    return (
        <div className="relative flex flex-col items-center pt-6 pb-2 md:pt-10 md:pb-4">
            {/* Ambient radial glow */}
            <div
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full opacity-20 md:h-80 md:w-80 md:opacity-25"
                style={{
                    background: "radial-gradient(circle, #00E5C3 0%, transparent 70%)",
                    filter: "blur(50px)",
                }}
            />

            {/* Greeting */}
            <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5 text-sm font-medium text-zinc-500"
            >
                {displayGreeting} 👋
            </motion.p>

            {/* Arc Ring — scales via wrapper */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
                style={{
                    width: SIZE,
                    height: SIZE,
                    // Scale down on very small screens
                    maxWidth: "min(85vw, 240px)",
                    aspectRatio: "1",
                }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    style={{ transform: "rotate(-90deg)" }}
                >
                    <defs>
                        <filter id="teal-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Track */}
                    <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                    />

                    {/* Progress arc */}
                    <motion.circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        stroke="#00E5C3"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        style={{ strokeDashoffset }}
                        filter="url(#teal-glow)"
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold tracking-tighter text-white leading-none md:text-6xl">
                        {kwh.toFixed(0)}
                    </span>
                    <span className="mt-1 text-xs font-medium tracking-widest text-zinc-500 uppercase">
                        kWh
                    </span>
                    {trendPercentage !== 0 && (
                        <span
                            className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                                color: isDown ? "#00E5C3" : isUp ? "#F5A623" : "#a1a1aa",
                                background: isDown
                                    ? "rgba(0,229,195,0.1)"
                                    : isUp
                                        ? "rgba(245,166,35,0.1)"
                                        : "rgba(255,255,255,0.05)",
                            }}
                        >
                            {isDown ? "▼" : "▲"} {Math.abs(trendPercentage)}% vs last week
                        </span>
                    )}
                </div>
            </motion.div>

            {/* Pill chips */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-6 flex items-center gap-3"
            >
                {/* kWh chip */}
                <div
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold md:px-5 md:py-2.5"
                    style={{
                        background: "rgba(0,229,195,0.1)",
                        border: "1px solid rgba(0,229,195,0.2)",
                        color: "#00E5C3",
                    }}
                >
                    <Zap className="h-3.5 w-3.5 shrink-0" fill="currentColor" />
                    <span>{kwh.toFixed(1)} kWh</span>
                </div>

                {/* Cost chip */}
                <div
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold md:px-5 md:py-2.5"
                    style={{
                        background: "rgba(245,166,35,0.1)",
                        border: "1px solid rgba(245,166,35,0.2)",
                        color: "#F5A623",
                    }}
                >
                    <Wallet className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatCurrency(cost)}</span>
                </div>
            </motion.div>
        </div>
    );
}
