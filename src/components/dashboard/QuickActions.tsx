"use client";

import Link from "next/link";
import { Plus, History } from "lucide-react";

export function QuickActions() {
    return (
        <div className="flex gap-3">
            <Link
                href="/charging"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
                <Plus className="h-4 w-4" />
                Add Charging
            </Link>
            <Link
                href="/history"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/[0.06] active:scale-95"
            >
                <History className="h-4 w-4" />
                View History
            </Link>
        </div>
    );
}
