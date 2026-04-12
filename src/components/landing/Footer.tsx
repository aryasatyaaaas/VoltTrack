import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t px-6 py-12" style={{ background: "white", borderColor: "var(--border)" }}>
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 md:flex-row md:justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-all group-hover:scale-105"
                        style={{ background: "#FF6B35" }}
                    >
                        <Zap className="h-4 w-4 text-white fill-white" />
                    </div>
                    <span className="text-base font-extrabold" style={{ color: "var(--ink)" }}>
                        VoltTrack
                    </span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-8">
                    {["Privacy Policy", "Terms & Conditions", "Contact Us"].map((link) => (
                        <a key={link} href="#" className="text-[13px] font-semibold transition-colors hover:opacity-80" style={{ color: "var(--ink-muted)" }}>
                            {link}
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-[13px] font-medium" style={{ color: "var(--ink-muted)" }}>
                    © {new Date().getFullYear()} VoltTrack. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
