import { prisma } from './src/lib/prisma';

async function main() {
    try {
        const userId = "test-user-id"; // We don't actually need it to exist if we expect a specific foreign key error, but let's check
        
        // First create a dummy user
        const user = await prisma.user.create({
            data: {
                id: userId,
                email: "test@example.com",
                name: "Test",
                passwordHash: "hash"
            }
        });
        
        console.log("Created user", user.id);

        const result = await prisma.userPreferences.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                currency: "IDR",
                favoriteLocations: []
            },
            update: {
                currency: "IDR",
                favoriteLocations: []
            }
        });
        console.log("Upserted preferences", result);
        
    } catch (e) {
        console.error("ERROR", e);
    } finally {
        await prisma.user.deleteMany({ where: { email: "test@example.com" } });
        await prisma.$disconnect();
    }
}

main();
