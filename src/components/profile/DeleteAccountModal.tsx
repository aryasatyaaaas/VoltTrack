"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl border border-red-500/20 bg-black p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>

                <h3 className="text-lg font-bold text-white">Delete Account</h3>
                <p className="mt-2 text-sm text-zinc-400">
                    This action is <strong className="text-red-400">permanent</strong> and cannot be undone.
                    All your charging sessions, preferences, and account data will be deleted.
                </p>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
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
