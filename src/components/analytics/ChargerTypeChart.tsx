"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
    { name: "Home Charger", value: 65, color: "#FF6B35" },
    { name: "Supercharger", value: 25, color: "#06D6A0" },
    { name: "Public AC", value: 10, color: "#118AB2" },
];

export function ChargerTypeChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex h-full flex-col rounded-3xl border bg-white p-6"
            style={{ borderColor: "var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
        >
            <div className="mb-4">
                <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>Charger Distribution</h3>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Your charging locations</p>
            </div>

            <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => [`${value}%`, "Usage"]}
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => (
                                <span style={{ color: "var(--ink)", fontWeight: 600, fontSize: "14px" }}>{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
