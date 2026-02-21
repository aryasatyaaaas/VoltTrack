"use client";

import { Menu } from "lucide-react";
import { Zap } from "lucide-react";

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-zinc-950 px-4 py-3 md:hidden">
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600">
                    <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold tracking-tight text-white">VoltTrack</span>
            </div>
            <button
                type="button"
                onClick={onMenuClick}
                className="relative z-50 cursor-pointer rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/[0.1] hover:text-white active:scale-95 touch-manipulation"
                aria-label="Open sidebar"
            >
                <Menu className="h-6 w-6" />
            </button>
        </div>
    );
}
