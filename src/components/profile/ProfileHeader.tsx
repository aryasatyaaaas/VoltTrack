"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Pencil, Check, X, Loader2, Camera, AlertCircle } from "lucide-react";
import type { UserProfile } from "@/types";

interface ProfileHeaderProps {
    profile: UserProfile;
    onUpdate: (name: string) => Promise<void>;
    onAvatarChange?: (avatarUrl: string) => void;
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Compress an image file using Canvas API.
 * Resizes to max 256x256 and converts to JPEG at 0.7 quality.
 */
function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const MAX_SIZE = 256;
                let { width, height } = img;

                // Scale down proportionally
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject(new Error("Failed to get canvas context"));

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error("Compression failed"));
                        const compressed = new File([blob], `avatar.jpg`, { type: "image/jpeg" });
                        resolve(compressed);
                    },
                    "image/jpeg",
                    0.7 // quality
                );
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

export function ProfileHeader({ profile, onUpdate, onAvatarChange }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.name);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
    const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: "error" | "success" = "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSave = async () => {
        if (name.trim().length < 2) return;
        setIsSaving(true);
        try {
            await onUpdate(name.trim());
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setName(profile.name);
        setIsEditing(false);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("Please select an image file (JPG, PNG, etc.).");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast("Image is too large. Maximum size is 10MB.");
            return;
        }

        setIsUploading(true);
        try {
            // Compress the image before uploading
            const compressed = await compressImage(file);

            const formData = new FormData();
            formData.append("avatar", compressed);

            const csrfRes = await fetch("/api/csrf");
            const { csrfToken } = await csrfRes.json();

            const res = await fetch("/api/profile/avatar", {
                method: "POST",
                headers: { "x-csrf-token": csrfToken },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Upload failed");
            }

            const data = await res.json();
            setAvatarUrl(data.avatarUrl);
            onAvatarChange?.(data.avatarUrl);
            showToast("Profile photo updated!", "success");
        } catch (err: any) {
            showToast(err?.message || "Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <Card className="relative overflow-hidden p-0 border-[var(--border)] bg-white shadow-sm">
            {/* Toast notification */}
            {toast && (
                <div
                    className={`absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur-md transition-all ${toast.type === "error"
                            ? "border border-red-200 bg-red-50 text-red-700"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        }`}
                >
                    {toast.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
                    {toast.message}
                    <button onClick={() => setToast(null)} className="ml-1 shrink-0 text-current opacity-60 hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Gradient header strip */}
            <div className="h-24" style={{ background: "linear-gradient(90deg, rgba(255,107,53,0.1), var(--bg-secondary), transparent)" }} />

            <div className="px-6 pb-6">
                {/* Avatar with upload */}
                <div className="-mt-12 mb-4">
                    <div className="group relative w-fit">
                        <button
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full font-bold text-3xl text-white shadow-lg ring-4 ring-white transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                            style={{
                                background: "linear-gradient(135deg, #FF6B35 0%, #FFD93D 100%)",
                                boxShadow: "0 4px 16px rgba(255,107,53,0.3)"
                            }}
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={profile.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                getInitials(profile.name)
                            )}

                            {/* Hover overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                {isUploading ? (
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                ) : (
                                    <Camera className="h-8 w-8 text-white" />
                                )}
                            </div>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Name + Edit */}
                <div className="space-y-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rounded-xl border border-[var(--border)] bg-gray-50 px-4 py-2 text-lg font-bold outline-none transition-all"
                                style={{ color: "var(--ink)" }}
                                onFocus={e => e.currentTarget.style.border = "1px solid var(--volt-orange)"}
                                onBlur={e => e.currentTarget.style.border = "1px solid var(--border)"}
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-xl p-2.5 transition disabled:opacity-50 hover:bg-opacity-80"
                                style={{ background: "rgba(255,107,53,0.1)", color: "var(--volt-orange)" }}
                            >
                                {isSaving ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Check className="h-5 w-5" />
                                )}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="rounded-xl bg-gray-100 p-2.5 transition hover:bg-gray-200"
                                style={{ color: "var(--ink-muted)" }}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>{profile.name}</h2>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="rounded-xl bg-gray-100 p-2 transition hover:bg-gray-200"
                                style={{ color: "var(--ink-muted)" }}
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <p className="text-sm" style={{ color: "var(--ink-muted)" }}>{profile.email}</p>

                    <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-4)" }}>
                            Member since {memberSince}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
