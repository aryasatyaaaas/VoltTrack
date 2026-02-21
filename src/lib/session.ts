import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function getSessionUser() {
    const tokenPayload = await getAuthUser();

    if (!tokenPayload) {
        throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
        where: { id: tokenPayload.userId },
        select: { id: true, email: true, name: true },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}
