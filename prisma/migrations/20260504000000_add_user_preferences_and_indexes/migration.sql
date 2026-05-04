-- Add avatarUrl and plan to User if not exists
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'Free';

-- Add missing indexes on User
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- Create UserPreferences table if not exists
CREATE TABLE IF NOT EXISTS "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "evName" TEXT NOT NULL DEFAULT 'BYD Atto 3',
    "defaultLocation" TEXT NOT NULL DEFAULT 'Home',
    "costPerKwh" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "rememberInput" BOOLEAN NOT NULL DEFAULT true,
    "autoFillLocation" BOOLEAN NOT NULL DEFAULT true,
    "smartInsights" BOOLEAN NOT NULL DEFAULT true,
    "favoriteLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- Add unique index (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- Add foreign key if not exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'UserPreferences_userId_fkey'
    ) THEN
        ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add missing indexes on ChargingSession
CREATE INDEX IF NOT EXISTS "ChargingSession_userId_sessionDate_idx" ON "ChargingSession"("userId", "sessionDate");
CREATE INDEX IF NOT EXISTS "ChargingSession_createdAt_idx" ON "ChargingSession"("createdAt");
