"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!password) {
            setError("Password is required");
            return;
        }
        setIsDeleting(true);
        setError(null);
        try {
            await onConfirm(password);
        } catch (err: any) {
            setError(err.message || "Failed to delete account");
        } finally {
            setIsDeleting(false);
        }
    };

    // Close on Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition hover:bg-gray-100 hover:text-zinc-600"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>

                <h3 className="text-lg font-bold text-zinc-900">Delete Account</h3>
                <p className="mt-2 text-sm text-zinc-600">
                    This action is <strong className="text-red-600">permanent</strong> and cannot be undone.
                    All your charging sessions, preferences, and account data will be deleted.
                </p>

                <div className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-zinc-700">
                            Confirm with your password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-xl border border-[var(--border)] bg-gray-50 px-4 py-2.5 text-sm text-[var(--ink)] placeholder-zinc-400 outline-none transition-colors focus:border-red-400 focus:bg-white"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-gray-50 shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 shadow-sm"
                    >
                        {isDeleting ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
                        ) : (
                            "Delete My Account"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
