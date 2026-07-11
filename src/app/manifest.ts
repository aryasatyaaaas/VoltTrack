import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "VoltTrack",
        short_name: "VoltTrack",
        description: "Track your EV charging sessions, energy usage, and costs.",
        start_url: "/dashboard",
        display: "standalone",
        background_color: "#FAFAF8",
        theme_color: "#FF6B35",
        orientation: "portrait",
        categories: ["productivity", "utilities"],
        icons: [
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
