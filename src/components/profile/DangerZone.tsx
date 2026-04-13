"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { LogOut, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { DeleteAccountModal } from "./DeleteAccountModal";

interface DangerZoneProps {
    onDeleteAccount: (password: string) => Promise<void>;
}

export function DangerZone({ onDeleteAccount }: DangerZoneProps) {
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const csrfRes = await fetch("/api/csrf");
            const { csrfToken } = await csrfRes.json();

            await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "x-csrf-token": csrfToken }
            });
            router.push("/login");
        } catch {
            setIsLoggingOut(false);
        }
    };

    const handleDeleteAccount = async (password: string) => {
        await onDeleteAccount(password);
    };

    return (
        <>
            <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
                    <AlertTriangle className="h-3 w-3" /> Danger Zone
                </h3>

                <Card className="space-y-3 border-red-200 p-6 shadow-sm">
                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--ink)] transition disabled:opacity-60 shadow-sm"
                        style={{ background: "var(--white)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--white)")}>
                        {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--muted)" }} />
                        ) : (
                            <LogOut className="h-4 w-4" style={{ color: "var(--muted)" }} />
                        )}
                        {isLoggingOut ? "Logging out…" : "Log Out"}
                    </button>

                    {/* Delete Account */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 shadow-sm"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                    </button>
                </Card>
            </div>

            <DeleteAccountModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleDeleteAccount}
            />
        </>
    );
}
