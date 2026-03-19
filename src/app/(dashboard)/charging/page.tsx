"use client";

import { useState } from "react";
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
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <ChargingForm onSuccess={handleSuccess} />
            </motion.div>

            <SessionList refreshTrigger={refreshTrigger} />
        </div>
    );
}
