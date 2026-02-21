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
            await fetch("/api/auth/logout", { method: "POST" });
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
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-400/70">
                    <AlertTriangle className="h-3 w-3" /> Danger Zone
                </h3>

                <Card className="space-y-3 border-red-500/10 p-6">
                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-60"
                    >
                        {isLoggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                        ) : (
                            <LogOut className="h-4 w-4 text-zinc-500" />
                        )}
                        {isLoggingOut ? "Logging out…" : "Log Out"}
                    </button>

                    {/* Delete Account */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex w-full items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
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
