import { verifyCsrfRequest } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { compare } from "bcryptjs";
import { z } from "zod";
import { handleApiError, apiResponse, NotFoundError, UnauthorizedError } from "@/lib/errors";

const deleteSchema = z.object({
    password: z.string().min(1, "Password is required"),
}).strict();

export async function POST(req: Request) {
    try {
        if (!(await verifyCsrfRequest(req))) {
            return new Response(JSON.stringify({ error: "Invalid CSRF token" }), { status: 403, headers: { "Content-Type": "application/json" } });
        }

        const sessionUser = await getSessionUser();
        const body = await req.json();

        const result = deleteSchema.safeParse(body);
        if (!result.success) {
            throw result.error;
        }

        const user = await prisma.user.findUnique({
            where: { id: sessionUser.userId },
            select: { passwordHash: true },
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        const isValid = await compare(result.data.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedError("Incorrect password");
        }

        // Cascade delete: preferences + sessions are deleted via onDelete: Cascade
        await prisma.user.delete({
            where: { id: sessionUser.userId },
        });

        return apiResponse({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
