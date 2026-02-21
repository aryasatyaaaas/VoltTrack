import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/[0.06] px-6 py-12">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 md:flex-row md:justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                        <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white">
                        Volt<span className="text-cyan-400">Track</span>
                    </span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-8">
                    {["About", "Privacy", "Contact"].map((link) => (
                        <a key={link} href="#" className="text-xs text-zinc-600 transition-colors hover:text-zinc-400">
                            {link}
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-xs text-zinc-700">
                    © {new Date().getFullYear()} VoltTrack. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
