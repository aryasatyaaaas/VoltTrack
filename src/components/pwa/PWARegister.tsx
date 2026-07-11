"use client";

import { useEffect } from "react";

/**
 * PWARegister — registers the service worker on the client side.
 * Must be a Client Component ("use client") to access window/navigator.
 * Placed in RootLayout so it runs on every page load.
 *
 * SW is only active in production builds (not in `next dev`).
 */
export function PWARegister() {
    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("serviceWorker" in navigator) ||
            process.env.NODE_ENV !== "production"
        ) {
            return;
        }

        const registerSW = async () => {
            try {
                const registration = await navigator.serviceWorker.register("/sw.js", {
                    scope: "/",
                    updateViaCache: "none", // Always check for SW updates from network
                });

                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener("statechange", () => {
                        if (
                            newWorker.state === "installed" &&
                            navigator.serviceWorker.controller
                        ) {
                            // New SW installed, optionally notify user to refresh
                            console.log("[SW] New version available. Refresh to update.");
                        }
                    });
                });

                if (process.env.NODE_ENV === "development") {
                    console.log("[SW] Registered with scope:", registration.scope);
                }
            } catch (err) {
                console.error("[SW] Registration failed:", err);
            }
        };

        // Register after page is fully loaded to not block initial paint
        if (document.readyState === "complete") {
            registerSW();
        } else {
            window.addEventListener("load", registerSW, { once: true });
        }
    }, []);

    return null; // No UI output
}
