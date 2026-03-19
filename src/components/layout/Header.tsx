"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Zap, LayoutDashboard, BatteryCharging, History } from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/charging", label: "Charging", icon: BatteryCharging },
    { href: "/history", label: "History", icon: History },
];

interface UserInfo {
    name: string;
    avatarUrl: string | null;
}

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

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md border-b border-white/[0.05] md:px-6">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00E5C3]/15 ring-1 ring-[#00E5C3]/30 transition-all group-hover:bg-[#00E5C3]/25">
                    <Zap className="h-4 w-4 text-[#00E5C3]" fill="currentColor" />
                </div>
                <span className="hidden text-sm font-bold tracking-tight text-white sm:block">VoltTrack</span>
            </Link>

            {/* Center Nav — desktop only (mobile handled by MobileBottomNav) */}
            <nav className="hidden items-center gap-0.5 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.06] md:flex">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-[#00E5C3]/15 text-[#00E5C3] shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {/* Icon always visible, label hidden on xs */}
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:block">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Avatar */}
            <Link href="/profile" className="group relative shrink-0">
                <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[#00E5C3]/20 transition-all group-hover:ring-[#00E5C3]/50 group-hover:shadow-[0_0_12px_rgba(0,229,195,0.25)] md:h-9 md:w-9">
                    {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#00E5C3] to-teal-600 text-xs font-bold text-black">
                            {initial}
                        </div>
                    )}
                </div>
            </Link>
        </header>
    );
}
