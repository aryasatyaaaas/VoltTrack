"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from "recharts";

const data = [
    { month: "Jan", energy: 120, cost: 240000 },
    { month: "Feb", energy: 115, cost: 230000 },
    { month: "Mar", energy: 130, cost: 260000 },
    { month: "Apr", energy: 140, cost: 280000 },
    { month: "May", energy: 125, cost: 250000 },
    { month: "Jun", energy: 150, cost: 300000 },
];

export function EnergyCostChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border bg-white p-6"
            style={{ borderColor: "var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
        >
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold" style={{ color: "var(--ink)" }}>Trend Energi & Biaya</h3>
                    <p className="text-sm" style={{ color: "var(--ink-muted)" }}>6 bulan terakhir</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full" style={{ background: "var(--volt-orange)" }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>Energy (kWh)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-full" style={{ background: "var(--volt-teal)" }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--ink-muted)" }}>Cost (Rp)</span>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,26,46,0.05)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B6B8A" }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B6B8A" }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6B6B8A" }} tickFormatter={(val) => `Rp ${val/1000}k`} />
                        <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", background: "var(--bg-primary)" }}
                            itemStyle={{ color: "var(--ink)", fontWeight: 600, fontSize: "14px" }}
                            labelStyle={{ color: "var(--ink-muted)", marginBottom: "8px" }}
                        />
                        <Area yAxisId="left" type="monotone" dataKey="energy" stroke="#FF6B35" strokeWidth={3} fill="url(#colorEnergy)" />
                        <Bar yAxisId="right" dataKey="cost" barSize={12} fill="#06D6A0" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
