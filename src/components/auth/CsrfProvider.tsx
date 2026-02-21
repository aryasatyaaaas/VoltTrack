"use client";

import { useEffect } from "react";

/**
 * CSRF Provider
 * Automatically attaches the CSRF token from cookies to all state-changing fetch requests.
 */
export function CsrfProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const originalFetch = window.fetch;

        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            const method = init?.method?.toUpperCase() || "GET";
            const csrfMethods = ["POST", "PATCH", "DELETE"];

            if (csrfMethods.includes(method)) {
                // Read CSRF token from cookie
                const cookies = document.cookie.split("; ");
                const csrfToken = cookies
                    .find((row) => row.startsWith("volttrack_csrf_token="))
                    ?.split("=")[1];

                if (csrfToken) {
                    const headers = new Headers(init?.headers || {});
                    headers.set("x-csrf-token", csrfToken);

                    if (init) {
                        init.headers = headers;
                    } else {
                        init = { headers };
                    }
                }
            }

            return originalFetch(input, init);
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, []);

    return <>{children}</>;
}
