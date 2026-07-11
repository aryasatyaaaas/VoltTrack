"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
    {
        href: "/dashboard",
        label: "Home",
        icon: (
            <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3h2v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
        ),
    },
    {
        href: "/charging",
        label: "Charging",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2L5.5 11H10L8.5 18 16 9h-5l2-7z" />
            </svg>
        ),
    },

    {
        href: "/history",
        label: "History",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <circle cx="10" cy="10" r="7" />
                <path d="M10 6.5v3.5l2.5 2.5" />
            </svg>
        ),
    },
    {
        href: "/analytics",
        label: "Analytics",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,14 7,10 10,13 14,8 17,11" />
            </svg>
        ),
    },
    {
        href: "/profile",
        label: "Profile",
        icon: (
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="7" r="3" />
                <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" />
            </svg>
        ),
    },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn("bottom-nav-item", isActive && "active")}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

