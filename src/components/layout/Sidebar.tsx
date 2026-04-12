"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";

const navItems = [
    {
        href: "/dashboard",
        label: "Dashboard",
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
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <Link href="/dashboard" className="logo-mark">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 2L4.5 11H10L8.5 18L16 9H10.5L13 2H11z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round" />
                </svg>
            </Link>

            <ul className="nav-list">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={item.href}>
                            <Link href={item.href} className={cn("nav-item", isActive && "active")} title="">
                                {item.icon}
                                <span className="nav-tooltip">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className="sidebar-footer">
                <Link href="/profile" className="sidebar-icon-btn">
                    <Settings style={{ width: "20px", height: "20px", strokeWidth: "1.7" }} />
                </Link>
                <div className="user-avatar">N</div>
            </div>
        </aside>
    );
}


