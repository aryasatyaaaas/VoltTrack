import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { compare } from "bcryptjs";
import { z } from "zod";
import { handleApiError, apiResponse } from "@/lib/errors";

const deleteSchema = z.object({
    password: z.string().min(1, "Password is required"),
}).strict();

export async function POST(req: Request) {
    try {
        const sessionUser = await getSessionUser();
        const body = await req.json();

        const result = deleteSchema.safeParse(body);
        if (!result.success) {
            throw result.error;
        }

        // Verify password
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { passwordHash: true },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const isValid = await compare(result.data.password, user.passwordHash);
        if (!isValid) {
            return handleApiError(new Error("Unauthorized: Incorrect password"));
        }

        // Cascade delete: preferences + sessions are deleted via onDelete: Cascade
        await prisma.user.delete({
            where: { id: sessionUser.id },
        });

        return apiResponse({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
