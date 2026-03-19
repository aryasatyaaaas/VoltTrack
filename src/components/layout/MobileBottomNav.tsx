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
            <nav
                className="pointer-events-auto flex items-center gap-0.5 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl"
                style={{
                    background: "rgba(15,15,18,0.92)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-xl px-5 py-2 transition-all active:scale-95",
                                isActive ? "text-[#00E5C3]" : "text-zinc-600 hover:text-zinc-400"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-0 -z-10 rounded-xl"
                                    style={{ background: "rgba(0,229,195,0.1)" }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <Icon
                                className={cn(
                                    "h-5 w-5 transition-transform duration-200",
                                    isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                                )}
                            />
                            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>

                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-glow"
                                    className="absolute bottom-1 h-0.5 w-4 rounded-full"
                                    style={{
                                        background: "#00E5C3",
                                        boxShadow: "0 0 8px 2px rgba(0,229,195,0.5)",
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
