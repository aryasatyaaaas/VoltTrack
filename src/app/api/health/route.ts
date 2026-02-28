import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/errors";
import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 * Returns DB connectivity status and uptime.
 */
export async function GET() {
    const start = Date.now();

    try {
        // Quick DB connectivity check
        await prisma.$queryRaw`SELECT 1`;
        const dbLatencyMs = Date.now() - start;

        return apiResponse({
            status: "healthy",
            timestamp: new Date().toISOString(),
            db: {
                connected: true,
                latencyMs: dbLatencyMs,
            },
        });
    } catch (error) {
        console.error("[Health Check] DB connection failed:", error);
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                db: { connected: false },
            },
            { status: 503 }
        );
    }
}
