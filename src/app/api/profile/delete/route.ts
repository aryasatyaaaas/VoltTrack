import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function DELETE() {
    try {
        const sessionUser = await getSessionUser();

        // Cascade delete: preferences + sessions are deleted via onDelete: Cascade
        await prisma.user.delete({
            where: { id: sessionUser.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete account:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
