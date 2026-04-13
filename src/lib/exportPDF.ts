import type { HistorySession } from "@/types";

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function formatCurrency(amount: number | null, currency = "IDR"): string {
    if (amount === null) return "—";
    try {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toLocaleString()}`;
    }
}

function formatDuration(minutes: number | null): string {
    if (!minutes) return "—";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export interface ExportOptions {
    sessions: HistorySession[];
    currency?: string;
    userName?: string;
    /** e.g. "Apr 2026" or "All time" */
    period?: string;
}

export async function exportHistoryPDF({
    sessions,
    currency = "IDR",
    userName = "VoltTrack User",
    period = "All time",
}: ExportOptions): Promise<void> {
    // Dynamic import — keeps initial bundle small
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 16;

    // ── Brand header bar ────────────────────────────────────────────
    doc.setFillColor(255, 107, 53); // --volt-orange
    doc.rect(0, 0, pageW, 24, "F");

    // ── Logo: white rounded box ──────────────────────────────────────
    const logoX = margin;
    const logoY = 6;
    const logoSize = 12;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(logoX, logoY, logoSize, logoSize, 2, 2, "F");

    // ── Lightning bolt inside logo box (orange fill, drawn as polygon) ─
    // Lucide Zap simplified polygon in 24×24 space
    const boltPts: [number, number][] = [
        [14, 2], [5, 14], [11, 14], [10, 22], [19, 10], [13, 10],
    ];
    const bScale = (logoSize * 0.58) / 24;
    const bOffX = logoX + (logoSize - 24 * bScale) / 2 + 0.3;
    const bOffY = logoY + (logoSize - 24 * bScale) / 2 + 0.3;

    const absPts = boltPts.map(([x, y]) => [bOffX + x * bScale, bOffY + y * bScale] as [number, number]);
    const deltaLines: [number, number][] = absPts.slice(1).map((pt, i) => [
        pt[0] - absPts[i][0],
        pt[1] - absPts[i][1],
    ]);

    doc.setFillColor(255, 107, 53);
    (doc as any).lines(deltaLines, absPts[0][0], absPts[0][1], [1, 1], "F", true);

    // ── "VoltTrack" wordmark ─────────────────────────────────────────
    const wordY = logoY + logoSize / 2 + 2.5;
    const wordX = logoX + logoSize + 3.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255); // white "Volt"
    doc.text("Volt", wordX, wordY);
    const voltW = doc.getTextWidth("Volt");

    doc.setTextColor(255, 255, 255); // white "Track"
    doc.text("Track", wordX + voltW, wordY);

    // ── Right side label ─────────────────────────────────────────────
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Charging History Report", pageW - margin, wordY, { align: "right" });

    // ── Meta info block ─────────────────────────────────────────────
    doc.setTextColor(60, 60, 80);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const generated = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    doc.text(`User: ${userName}`, margin, 34);
    doc.text(`Period: ${period}`, margin, 40);
    doc.text(`Generated: ${generated}`, margin, 46);
    doc.text(`Total sessions: ${sessions.length}`, pageW - margin, 34, { align: "right" });

    // Summary stats
    const totalKwh = sessions.reduce((s, r) => s + r.energyKwh, 0);
    const totalCost = sessions.reduce((s, r) => s + (r.cost ?? 0), 0);
    doc.text(`Total energy: ${totalKwh.toFixed(2)} kWh`, pageW - margin, 40, { align: "right" });
    doc.text(`Total cost: ${formatCurrency(totalCost, currency)}`, pageW - margin, 46, { align: "right" });

    // Divider
    doc.setDrawColor(230, 230, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, 52, pageW - margin, 52);

    // ── Sessions table ──────────────────────────────────────────────
    const rows = sessions.map((s, i) => [
        (i + 1).toString(),
        formatDate(s.sessionDate),
        s.location,
        `${s.energyKwh.toFixed(2)} kWh`,
        formatDuration(s.durationMinutes),
        s.chargerType ?? "—",
        formatCurrency(s.cost, currency),
    ]);

    autoTable(doc, {
        startY: 56,
        head: [["#", "Date & Time", "Location", "Energy", "Duration", "Charger", "Cost"]],
        body: rows,
        margin: { left: margin, right: margin },
        headStyles: {
            fillColor: [255, 107, 53],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 8,
            cellPadding: 3,
        },
        bodyStyles: {
            fontSize: 7.5,
            cellPadding: 2.5,
            textColor: [40, 40, 60],
        },
        alternateRowStyles: {
            fillColor: [252, 251, 248],
        },
        columnStyles: {
            0: { cellWidth: 8, halign: "center" },     // #
            1: { cellWidth: 36 },                       // Date
            2: { cellWidth: "auto" },                   // Location
            3: { cellWidth: 22, halign: "right" },      // kWh
            4: { cellWidth: 18, halign: "right" },      // Duration
            5: { cellWidth: 18, halign: "center" },     // Charger
            6: { cellWidth: 28, halign: "right" },      // Cost
        },
        didDrawPage: (data) => {
            // Footer on each page
            const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
            const total = (doc as any).internal.pages.length - 1;
            doc.setFontSize(7);
            doc.setTextColor(160);
            doc.text(
                `VoltTrack — Charging History  •  Page ${pageNum}`,
                margin,
                pageH - 8
            );
            doc.text(generated, pageW - margin, pageH - 8, { align: "right" });
        },
    });

    // ── Download ────────────────────────────────────────────────────
    const safeUser = userName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const safePeriod = period.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`volttrack_history_${safeUser}_${safePeriod}.pdf`);
}
