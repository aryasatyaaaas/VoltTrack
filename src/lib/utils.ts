import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (handles conflicts) */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format kWh with unit */
export function formatKwh(value: number): string {
    return `${value.toFixed(1)} kWh`;
}

/** Format IDR currency (legacy helper) */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Returns a short prefix for a currency code.
 * IDR → "Rp", USD → "$", EUR → "€".
 * All other currencies fall back to the ISO code (e.g. "GBP", "JPY").
 */
export function getCurrencySymbol(code: string): string {
    const MAP: Record<string, string> = {
        IDR: "Rp",
        USD: "$",
        EUR: "€",
    };
    return MAP[code] ?? code;
}

/**
 * Format a monetary value with the correct currency prefix.
 * Uses locale "en-US" for grouping separators.
 */
export function formatCurrencyDynamic(value: number, currency: string): string {
    const symbol = getCurrencySymbol(currency);
    const formatted = Math.round(value).toLocaleString("en-US");
    // Symbol-only currencies go before the number; code-style go before with a space
    const needsSpace = symbol.length > 1 && !/^[$€£¥₩₹]$/.test(symbol);
    return needsSpace ? `${symbol} ${formatted}` : `${symbol}${formatted}`;
}

/** Calculate percentage change between two numbers */
export function getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

/** Format a date to readable string */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(date);
}

/** Get day name abbreviation */
export function getDayName(date: Date): string {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}
