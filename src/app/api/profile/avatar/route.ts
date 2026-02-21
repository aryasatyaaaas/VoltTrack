import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
    try {
        const user = await getSessionUser();
        const formData = await req.formData();
        const file = formData.get("avatar") as File | null;

        if (!file || !file.type.startsWith("image/")) {
            return NextResponse.json({ error: "No valid image provided" }, { status: 400 });
        }

        // Max 2MB
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads/avatars/
        const ext = file.name.split(".").pop() || "png";
        const filename = `${user.id}-${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);

        const avatarUrl = `/uploads/avatars/${filename}`;

        // Update user record
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
