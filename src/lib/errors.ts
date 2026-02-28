import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ─── Typed error classes ─────────────────────────────────

export class AppError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(404, message);
        this.name = "NotFoundError";
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(403, message);
        this.name = "ForbiddenError";
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(409, message);
        this.name = "ConflictError";
    }
}

export class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(400, message);
        this.name = "ValidationError";
    }
}

// ─── Standardized error handler ──────────────────────────

export function handleApiError(error: unknown) {
    console.error("[API Error]:", error);

    if (error instanceof ZodError) {
        return NextResponse.json(
            { error: "Validation failed" },
            { status: 400 }
        );
    }

    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
        );
    }

    return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
    );
}

// ─── Standardized success response ──────────────────────

export function apiResponse<T>(data: T, status = 200) {
    return NextResponse.json(data, { status });
}
