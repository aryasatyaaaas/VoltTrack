"use client";

import { useEffect, useState } from "react";

interface ThemeToggleProps {
    variant?: "icon" | "pill";
}

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    }, []);

    const toggle = () => {
        const html = document.documentElement;
        const next = isDark ? "light" : "dark";
        html.setAttribute("data-theme", next);
        localStorage.setItem("volttrack-theme", next);
        setIsDark(!isDark);
    };

    const icon = isDark ? (
        /* Sun icon */
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="4" />
            <line x1="10" y1="2" x2="10" y2="4" />
            <line x1="10" y1="16" x2="10" y2="18" />
            <line x1="2" y1="10" x2="4" y2="10" />
            <line x1="16" y1="10" x2="18" y2="10" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="14.36" y1="14.36" x2="15.78" y2="15.78" />
            <line x1="4.22" y1="15.78" x2="5.64" y2="14.36" />
            <line x1="14.36" y1="5.64" x2="15.78" y2="4.22" />
        </svg>
    ) : (
        /* Moon icon */
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 12.5A7.5 7.5 0 0 1 7.5 2.5a7.5 7.5 0 1 0 10 10z" />
        </svg>
    );

    if (variant === "pill") {
        return (
            <button
                onClick={toggle}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                title={isDark ? "Light mode" : "Dark mode"}
                className="pill-btn"
                style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
                {icon}
                {isDark ? "Light" : "Dark"}
            </button>
        );
    }

    return (
        <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--muted)",
                background: "transparent",
                border: "none",
                transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
            {icon}
        </button>
    );
}

