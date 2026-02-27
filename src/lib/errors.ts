import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standardized API Error Handler
 * Prevents internal schema leaks and provides consistent error responses.
 */
export function handleApiError(error: unknown) {
    console.error("[API Error]:", error);

    if (error instanceof ZodError) {
        return NextResponse.json(
            { error: "Validation failed" }, // Generic message to prevent schema leak
            { status: 400 }
        );
    }

    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        // Custom error types could be handled here
        if (msg.includes("unauthorized") || msg.includes("not authenticated")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (error.message.includes("not found")) {
            return NextResponse.json({ error: "Resource not found" }, { status: 404 });
        }
    }

    return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
    );
}

/**
 * Standardized API Success Response
 */
export function apiResponse<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}
