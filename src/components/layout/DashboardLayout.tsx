"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="app">
            <Sidebar />
            
            <main className="main">
                <div className="mx-auto w-full max-w-5xl flex flex-col gap-[22px]">
                    {children}
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
}
