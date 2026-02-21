/*
  Warnings:

  - You are about to drop the column `costUsd` on the `ChargingSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChargingSession" DROP COLUMN "costUsd",
ADD COLUMN     "cost" DOUBLE PRECISION,
ALTER COLUMN "chargerType" DROP NOT NULL,
ALTER COLUMN "durationMinutes" DROP NOT NULL,
ALTER COLUMN "batteryStartPct" DROP NOT NULL,
ALTER COLUMN "batteryEndPct" DROP NOT NULL;
