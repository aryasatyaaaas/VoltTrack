"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BatteryCharging,
    History,
    User,
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/charging", label: "Charging", icon: BatteryCharging },
    { href: "/history", label: "History", icon: History },
    { href: "/profile", label: "Profile", icon: User },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-50 flex justify-center md:hidden">
            <nav className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/20 bg-black/80 p-2 shadow-xl backdrop-blur-lg">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex flex-col items-center justify-center gap-1 overflow-hidden px-4 py-2 transition-all active:scale-95",
                                isActive ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-0 -z-10 rounded-xl bg-white/10"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <Icon
                                className={cn(
                                    "h-5 w-5 transition-transform duration-200",
                                    isActive ? "scale-110" : "scale-100 group-hover:scale-110"
                                )}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-glow"
                                    className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.5)]"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
