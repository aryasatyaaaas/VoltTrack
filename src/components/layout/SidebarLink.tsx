"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SidebarLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
}

export function SidebarLink({ href, icon: Icon, label }: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className="group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-colors"
        >
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                    initial={false}
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                    }}
                >
                    <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                </motion.div>
            )}

            <Icon
                className={cn(
                    "relative z-10 h-5 w-5 transition-colors duration-200",
                    isActive
                        ? "text-cyan-400"
                        : "text-zinc-500 group-hover:text-zinc-300"
                )}
            />

            <span
                className={cn(
                    "relative z-10 transition-colors duration-200",
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                )}
            >
                {label}
            </span>

            {/* Subtle hover background (non-active only) */}
            {!isActive && (
                <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:bg-white/[0.04] group-hover:opacity-100" />
            )}
        </Link>
    );
}
