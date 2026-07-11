"use client";

import { useState } from "react";
import { X, FileDown, Loader2, Calendar, Filter } from "lucide-react";
import type { HistorySession } from "@/types";
import { exportHistoryPDF } from "@/lib/exportPDF";

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Fetches ALL sessions matching the active page filters */
    fetchAll: () => Promise<HistorySession[]>;
    /** Real total count from pagination.total */
    totalCount: number;
    currency?: string;
    userName?: string;
}

export function ExportModal({ isOpen, onClose, fetchAll, totalCount, currency = "IDR", userName = "User" }: ExportModalProps) {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [useCustomRange, setUseCustomRange] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const period = useCustomRange
        ? [from, to].filter(Boolean).join(" → ") || "Custom"
        : "Filtered view";

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Fetch ALL matching sessions fresh from API
            let allSessions = await fetchAll();

            // If user added an extra date range on top, filter client-side
            if (useCustomRange && (from || to)) {
                allSessions = allSessions.filter((s) => {
                    const d = new Date(s.sessionDate);
                    const fromOk = from ? d >= new Date(from) : true;
                    const toOk = to ? d <= new Date(to + "T23:59:59") : true;
                    return fromOk && toOk;
                });
            }

            if (allSessions.length === 0) return;

            await exportHistoryPDF({
                sessions: allSessions,
                currency,
                userName,
                period,
            });
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    const inputStyle = {
        background: "var(--white)",
        border: "1px solid var(--border)",
        color: "var(--ink)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 13,
        width: "100%",
        outline: "none",
    } as React.CSSProperties;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl"
                style={{ background: "var(--white)", border: "1px solid var(--border-md)" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1.5 transition"
                    style={{ color: "var(--muted)", background: "transparent" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl"
                        style={{ background: "rgba(255,107,53,0.1)" }}
                    >
                        <FileDown className="h-5 w-5" style={{ color: "var(--volt-orange)" }} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>
                            Export History as PDF
                        </h2>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                            Download a branded charging report
                        </p>
                    </div>
                </div>

                {/* Current filter info */}
                <div
                    className="mb-4 flex items-center gap-2 rounded-2xl p-3 text-xs"
                    style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                >
                    <Filter className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--volt-orange)" }} />
                    <span>
                        Will export <strong style={{ color: "var(--ink)" }}>{totalCount} sessions</strong> matching active filters
                    </span>
                </div>

                {/* Date range toggle */}
                <div className="mb-4 space-y-3">
                    <button
                        onClick={() => setUseCustomRange(!useCustomRange)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
                        style={{
                            background: useCustomRange ? "rgba(255,107,53,0.08)" : "var(--surface-2)",
                            color: useCustomRange ? "var(--volt-orange)" : "var(--ink)",
                            border: `1px solid ${useCustomRange ? "rgba(255,107,53,0.3)" : "var(--border)"}`,
                        }}
                    >
                        <Calendar className="h-4 w-4" />
                        {useCustomRange ? "Using custom date range" : "Add a custom date range (optional)"}
                    </button>

                    {useCustomRange && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={from}
                                    onChange={e => setFrom(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => (e.currentTarget.style.border = "1px solid var(--volt-orange)")}
                                    onBlur={e => (e.currentTarget.style.border = "1px solid var(--border)")}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={e => setTo(e.target.value)}
                                    style={inputStyle}
                                    onFocus={e => (e.currentTarget.style.border = "1px solid var(--volt-orange)")}
                                    onBlur={e => (e.currentTarget.style.border = "1px solid var(--border)")}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview count */}
                <div
                    className="mb-5 rounded-2xl p-3 text-center text-sm"
                    style={{
                        background: totalCount > 0 ? "rgba(6,214,160,0.08)" : "rgba(255,107,53,0.06)",
                        border: `1px solid ${totalCount > 0 ? "rgba(6,214,160,0.2)" : "rgba(255,107,53,0.15)"}`,
                    }}
                >
                    {totalCount > 0 ? (
                        <span style={{ color: "var(--ink)" }}>
                            📄 PDF will include{" "}
                            <strong style={{ color: "#06D6A0" }}>{totalCount} session{totalCount !== 1 ? "s" : ""}</strong>
                            {useCustomRange && (from || to) && " (date filter applied)"}
                        </span>
                    ) : (
                        <span style={{ color: "var(--volt-orange)" }}>
                            No sessions found
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl py-2.5 text-sm font-bold transition"
                        style={{ background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--border)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--surface-2)")}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting || totalCount === 0}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)",
                            boxShadow: "0 4px 16px rgba(255,107,53,0.25)",
                        }}
                    >
                        {isExporting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><FileDown className="h-4 w-4" /> Export PDF</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
