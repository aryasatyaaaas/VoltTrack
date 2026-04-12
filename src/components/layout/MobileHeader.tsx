"use client";

import { Zap } from "lucide-react";

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <div
            className="flex items-center justify-between px-4 py-3 md:hidden"
            style={{
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border)",
            }}
        >
            <div className="flex items-center gap-2.5">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg, #FF6B35, #FFD93D)" }}
                >
                    <Zap className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="text-base font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                    VoltTrack
                </span>
            </div>
        </div>
    );
}
