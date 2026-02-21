"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BatteryCharging,
    History,
    BarChart3,
    Zap,
    User,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navGroups = [
    {
        label: "Main",
        items: [
            { href: "/", label: "Dashboard", icon: LayoutDashboard },
        ],
    },
    {
        label: "Activity",
        items: [
            { href: "/charging", label: "Charging", icon: BatteryCharging },
            { href: "/history", label: "History", icon: History },
            { href: "/analytics", label: "Analytics", icon: BarChart3 },
        ],
    },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        onClose();
    }, [pathname, onClose]);

    if (!mounted) return null;

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <div
                onClick={onClose}
                className={cn(
                    "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
            />

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-black transition-transform duration-300 ease-in-out md:translate-x-0 md:bg-transparent",
                    isOpen
                        ? "translate-x-0"
                        : "-translate-x-full pointer-events-none md:pointer-events-auto md:static md:translate-x-0"
                )}
            >
                {/* Top Branding Section */}
                <div className="relative px-6 py-8">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 ring-1 ring-white/10 shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)]">
                            <Zap className="h-5 w-5 text-cyan-400" />
                            <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-lg" />
                        </div>
                        <div>
                            <h1 className="font-semibold tracking-tight text-white text-lg">
                                VoltTrack
                            </h1>
                            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                                Personal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-8 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <h3 className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
                                {group.label}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 outline-none",
                                                isActive
                                                    ? "text-cyan-400 bg-cyan-500/10"
                                                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                                            )}
                                        >
                                            {/* Active Indicator Bar */}
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
                                            )}

                                            <Icon
                                                className={cn(
                                                    "relative z-10 h-4 w-4 transition-colors duration-200",
                                                    isActive
                                                        ? "text-cyan-400"
                                                        : "text-zinc-500 group-hover:text-zinc-300"
                                                )}
                                            />
                                            <span className="relative z-10">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
