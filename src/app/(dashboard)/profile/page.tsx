"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EVPreferencesCard } from "@/components/profile/EVPreferencesCard";
import { DataSettingsCard } from "@/components/profile/DataSettingsCard";
import { DangerZone } from "@/components/profile/DangerZone";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { UserProfile, UserPreferencesData } from "@/types";

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            if (!res.ok) throw new Error("Failed to load profile");
            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError("Could not load your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async (name: string) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();

        const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "x-csrf-token": csrfToken
            },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error("Failed to update profile");
        const updated = await res.json();
        setProfile((prev) => prev ? { ...prev, ...updated } : prev);
    };

    const handleSavePreferences = async (data: Partial<UserPreferencesData>) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();

        const res = await fetch("/api/profile/preferences", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "x-csrf-token": csrfToken
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update preferences");
        const updated = await res.json();
        setProfile((prev) => prev ? { ...prev, preferences: updated } : prev);
    };

    const handleTogglePreference = async (
        key: keyof Pick<UserPreferencesData, "rememberInput" | "autoFillLocation" | "smartInsights">,
        value: boolean
    ) => {
        await handleSavePreferences({ [key]: value });
    };

    const handleDeleteAccount = async (password: string) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();

        const res = await fetch("/api/profile/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-csrf-token": csrfToken
            },
            body: JSON.stringify({ password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete account");
        }

        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header title="Profile" subtitle="Manage your account" />
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header title="Profile" subtitle="Manage your account" />
                <div className="flex flex-1 items-center justify-center p-4">
                    <p className="text-sm text-red-400">{error || "Something went wrong."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header title="Profile" subtitle="Manage your account" />

            <main className="flex-1 space-y-6 p-4 md:p-8 pb-24 md:pb-8">
                <div className="mx-auto max-w-2xl space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ProfileHeader profile={profile} onUpdate={handleUpdateName} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                    >
                        <EVPreferencesCard
                            preferences={profile.preferences}
                            onSave={handleSavePreferences}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <DataSettingsCard
                            preferences={profile.preferences}
                            onToggle={handleTogglePreference}
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                    >
                        <DangerZone onDeleteAccount={handleDeleteAccount} />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
