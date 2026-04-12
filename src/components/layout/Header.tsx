"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BatteryCharging,
    History,
    BarChart3,
    User,
    Zap,
} from "lucide-react";

interface UserInfo {
    name: string;
    avatarUrl: string | null;
}

const navGroups = [
    {
        label: "Main",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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

export function Header() {
    const pathname = usePathname();
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data) setUser({ name: data.name, avatarUrl: data.avatarUrl });
            })
            .catch(() => { });
    }, [pathname]);

    const displayName = user?.name ?? "User";
    const initial = displayName.charAt(0).toUpperCase();

    const pageTitle = (() => {
        if (pathname === "/dashboard") return "Dashboard";
        if (pathname === "/charging") return "Log Charging";
        if (pathname === "/history") return "History";
        if (pathname === "/analytics") return "Analytics";
        if (pathname === "/profile") return "Profile";
        return "VoltTrack";
    })();

    return (
        <header
            className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-6"
            style={{
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border)",
                boxShadow: "0 1px 0 var(--border)",
            }}
        >
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl transition-all group-hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #FF6B35, #FFD93D)" }}
                >
                    <Zap className="h-4 w-4 text-white" fill="currentColor" />
                </div>
                <span
                    className="hidden text-base font-extrabold tracking-tight sm:block"
                    style={{ color: "var(--ink)" }}
                >
                    VoltTrack
                </span>
            </Link>

            {/* Page Title — mobile */}
            <span
                className="text-sm font-semibold sm:hidden"
                style={{ color: "var(--ink)" }}
            >
                {pageTitle}
            </span>

            {/* Center Nav — desktop only */}
            <nav className="hidden items-center gap-0.5 md:flex">
                {navGroups.flatMap((g) => g.items).map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "text-white"
                                    : "hover:bg-[--bg-secondary]"
                            )}
                            style={isActive ? {
                                background: "var(--volt-orange)",
                                color: "#fff",
                            } : {
                                color: "var(--ink-muted)",
                            }}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Avatar */}
            <Link href="/profile" className="group relative shrink-0">
                <div
                    className="relative h-8 w-8 overflow-hidden rounded-full transition-all group-hover:scale-105 md:h-9 md:w-9"
                    style={{
                        border: "2px solid var(--volt-orange)",
                        boxShadow: "0 0 0 2px rgba(255,107,53,0.15)",
                    }}
                >
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #FF6B35, #FFD93D)" }}
                        >
                            {initial}
                        </div>
                    )}
                </div>
            </Link>
        </header>
    );
}
