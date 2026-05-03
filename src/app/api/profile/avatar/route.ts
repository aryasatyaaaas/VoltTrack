import { verifyCsrfRequest } from "@/lib/csrf";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Magic bytes for allowed image types
const MAGIC_BYTES: Record<string, number[][]> = {
    png: [[0x89, 0x50, 0x4e, 0x47]],
    jpg: [[0xff, 0xd8, 0xff]],
    jpeg: [[0xff, 0xd8, 0xff]],
    gif: [[0x47, 0x49, 0x46, 0x38]],
    webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function validateMagicBytes(buffer: Buffer, ext: string): boolean {
    const patterns = MAGIC_BYTES[ext];
    if (!patterns) return false;
    return patterns.some((pattern) =>
        pattern.every((byte, i) => buffer[i] === byte)
    );
}

export async function POST(req: Request) {
    try {
        if (!(await verifyCsrfRequest(req))) {
            return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const user = await getSessionUser();
        const formData = await req.formData();
        const file = formData.get("avatar") as File | null;

        if (!file || !file.type.startsWith("image/")) {
            return NextResponse.json({ error: "No valid image provided" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
        }

        // 1. Validate extension against allowlist
        const rawExt = (file.name.split(".").pop() || "").toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(rawExt)) {
            return NextResponse.json({ error: "Unsupported image format" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 2. Validate magic bytes match claimed extension
        if (!validateMagicBytes(buffer, rawExt)) {
            return NextResponse.json(
                { error: "File content does not match extension" },
                { status: 400 }
            );
        }

        // 3. Store as base64 data URL in database (no filesystem write)
        const base64 = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";
        const avatarUrl = `data:${mimeType};base64,${base64}`;

        await prisma.user.update({
            where: { id: user.userId },
            data: { avatarUrl },
        });

        return NextResponse.json({ avatarUrl });
    } catch (error) {
        console.error("Failed to upload avatar:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
