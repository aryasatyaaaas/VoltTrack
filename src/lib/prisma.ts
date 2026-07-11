import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma_fresh: PrismaClient | undefined;
};

function createPrismaClient() {
    const url = new URL(process.env.DATABASE_URL || "");
    const pool = new Pool({
        host: url.hostname,
        port: parseInt(url.port, 10),
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma_fresh ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma_fresh = prisma;
}
