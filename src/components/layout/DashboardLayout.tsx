"use client";

import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col overflow-hidden text-zinc-100 bg-black">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 scrollbar-hide">
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation (Floating) */}
            <MobileBottomNav />
        </div>
    );
}
