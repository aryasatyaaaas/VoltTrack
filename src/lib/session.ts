import { getAuthUser, type TokenPayload } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

/**
 * Get authenticated user from JWT payload.
 *
 * Trusts the JWT claims (userId, email) without an extra DB roundtrip.
 * The JWT signature was already verified by `getAuthUser()`.
 * Only query the database when you need additional profile data (name, avatar).
 */
export async function getSessionUser(): Promise<TokenPayload> {
    const payload = await getAuthUser();

    if (!payload) {
        throw new UnauthorizedError("Not authenticated");
    }

    return payload;
}
