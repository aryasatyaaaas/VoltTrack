import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const locations = [
  "Home Garage",
  "Office Parking",
  "Mall Charging Hub",
  "Supercharger Station",
  "Public Lot A",
  "Highway Rest Stop",
  "Downtown Station",
];

const chargerTypes = ["Level 1", "Level 2", "DC Fast"];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.chargingSession.deleteMany();
  await prisma.user.deleteMany();

  // Create default user
  const user = await prisma.user.create({
    data: {
      email: "demo@volttrack.dev",
      name: "Arya Demo",
      passwordHash: "$2b$12$placeholder.hash.for.dev.only", // not real auth yet
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Generate 40 charging sessions over the past 60 days
  const sessions = [];
  const now = new Date();

  for (let i = 0; i < 40; i++) {
    const daysAgo = randomInt(0, 59);
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() - daysAgo);
    sessionDate.setHours(randomInt(6, 22), randomInt(0, 59), 0, 0);

    const chargerType = randomItem(chargerTypes);

    // Energy varies by charger type
    let energyKwh: number;
    let costPerKwh: number;
    let duration: number;

    switch (chargerType) {
      case "Level 1":
        energyKwh = randomBetween(3, 10);
        costPerKwh = randomBetween(0.08, 0.12);
        duration = randomInt(120, 480);
        break;
      case "DC Fast":
        energyKwh = randomBetween(20, 60);
        costPerKwh = randomBetween(0.25, 0.4);
        duration = randomInt(15, 45);
        break;
      default: // Level 2
        energyKwh = randomBetween(10, 35);
        costPerKwh = randomBetween(0.12, 0.2);
        duration = randomInt(60, 240);
    }

    const batteryStart = randomBetween(10, 50);
    const batteryEnd = Math.min(batteryStart + randomBetween(20, 50), 100);

    sessions.push({
      userId: user.id,
      energyKwh,
      costUsd: Math.round(energyKwh * costPerKwh * 100) / 100,
      location: randomItem(locations),
      chargerType,
      durationMinutes: duration,
      batteryStartPct: batteryStart,
      batteryEndPct: Math.round(batteryEnd * 100) / 100,
      sessionDate,
    });
  }

  // await prisma.chargingSession.createMany({ data: sessions });
  // console.log(`⚡ Created ${sessions.length} charging sessions`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
