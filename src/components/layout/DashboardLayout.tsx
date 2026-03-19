"use client";

import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col" style={{ background: "#0F0F12" }}>
            <Header />
            <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
                <div className="mx-auto max-w-2xl px-4 py-6 md:px-0">
                    {children}
                </div>
            </main>
            <MobileBottomNav />
        </div>
    );
}
