"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BatteryCharging, History } from "lucide-react";

interface HeaderProps {
    title: string;
    subtitle?: string;
}

const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/charging", label: "Charging", icon: BatteryCharging },
    { href: "/history", label: "History", icon: History },
];

interface UserInfo {
    name: string;
    avatarUrl: string | null;
}

export function Header({ title, subtitle }: HeaderProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {
                if (data) setUser({ name: data.name, avatarUrl: data.avatarUrl });
            })
            .catch(() => { });
    }, [pathname]); // re-fetch when navigating (e.g. after profile save + back)

    const today = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date());

    const displayName = user?.name ?? "User";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <header className="flex flex-col gap-4 border-b border-white/[0.06] bg-black/50 px-4 py-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:px-8 md:py-5">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                    {title}
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">
                    {subtitle ?? today}
                </p>
            </div>

            <div className="flex items-center gap-2">
                {/* Desktop Navigation Links */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>


                {/* Profile */}
                <div className="hidden items-center gap-2 border-l border-white/[0.08] pl-3 md:flex">
                    <Link href="/profile" className="group flex items-center gap-3 rounded-full bg-white/[0.02] py-1 pl-1 pr-3 ring-1 ring-white/[0.06] transition-all hover:bg-white/[0.05] hover:ring-white/[0.1]">
                        <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-black">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
                                    {initial}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-semibold text-white">{displayName}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
