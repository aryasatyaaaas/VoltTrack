"use client";

import { useState } from "react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EVPreferencesCard } from "@/components/profile/EVPreferencesCard";
import { DangerZone } from "@/components/profile/DangerZone";
import { m } from "framer-motion";
import type { UserProfile, UserPreferencesData } from "@/types";

interface ProfileClientViewProps {
    initialProfile: UserProfile;
}

export function ProfileClientView({ initialProfile }: ProfileClientViewProps) {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);

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
        setProfile((prev) => ({ ...prev, ...updated }));
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
        setProfile((prev) => ({ ...prev, preferences: updated }));
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

    return (
        <div className="space-y-6">
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <ProfileHeader profile={profile} onUpdate={handleUpdateName} />
            </m.div>

            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
            >
                <EVPreferencesCard
                    preferences={profile.preferences}
                    onSave={handleSavePreferences}
                />
            </m.div>


            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
            >
                <DangerZone onDeleteAccount={handleDeleteAccount} />
            </m.div>
        </div>
    );
}
