import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        const formData = await req.formData();
        const file = formData.get("avatar") as File | null;

        if (!file || !file.type.startsWith("image/")) {
            return NextResponse.json({ error: "No valid image provided" }, { status: 400 });
        }

        // Max 2MB (already compressed on frontend, but safety check)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
        }

        // Convert to base64 data URL and store in database
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";
        const avatarUrl = `data:${mimeType};base64,${base64}`;

        // Update user record with base64 avatar
        await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl },
        });

        return NextResponse.json({ avatarUrl });
    } catch (error) {
        console.error("Failed to upload avatar:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
