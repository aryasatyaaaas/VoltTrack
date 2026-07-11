"use client";

import { Suspense } from "react";
import { ChargingForm } from "@/components/charging/ChargingForm";
import { m } from "framer-motion";

export default function ChargingPage() {
    return (
        <div className="space-y-8">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Suspense fallback={<div className="flex justify-center p-8 text-[var(--ink-muted)]">Loading form...</div>}>
                    <ChargingForm />
                </Suspense>
            </m.div>
        </div>
    );
}

