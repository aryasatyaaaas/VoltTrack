"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ChargingForm } from "@/components/charging/ChargingForm";
import { SessionList } from "@/components/charging/SessionList";
import { motion } from "framer-motion";

export default function ChargingPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSuccess = () => {
        // Trigger list refresh
        setRefreshTrigger((prev) => prev + 1);
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Header title="Charging" subtitle="Log your recent sessions" />

            <main className="flex-1 space-y-8 p-4 md:p-8 pb-24 md:pb-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <ChargingForm onSuccess={handleSuccess} />
                    </motion.div>

                    <SessionList refreshTrigger={refreshTrigger} />
                </div>
            </main>
        </div>
    );
}
