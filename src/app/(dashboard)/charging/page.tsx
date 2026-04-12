"use client";

import { ChargingForm } from "@/components/charging/ChargingForm";
import { motion } from "framer-motion";

export default function ChargingPage() {
    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <ChargingForm onSuccess={() => {}} />
            </motion.div>
        </div>
    );
}

