import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/types";

/**
 * Shared React Query hook for /api/profile.
 * Replaces 4 duplicate useEffect+fetch patterns across the app.
 * Result is cached for 5 minutes — no duplicate network requests.
 */
export function useProfile() {
    return useQuery<UserProfile | null>({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await fetch("/api/profile");
            if (!res.ok) return null;
            return res.json();
        },
        staleTime: 5 * 60 * 1000,
    });
}
