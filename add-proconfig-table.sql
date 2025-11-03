-- Add ProConfig table for professional player configurations
CREATE TABLE IF NOT EXISTS "ProConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "team" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "normalized" JSONB NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProConfig_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint for name + game combination
CREATE UNIQUE INDEX IF NOT EXISTS "ProConfig_name_game_key" ON "ProConfig"("name", "game");

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "ProConfig_game_idx" ON "ProConfig"("game");
CREATE INDEX IF NOT EXISTS "ProConfig_popularity_idx" ON "ProConfig"("popularity");
CREATE INDEX IF NOT EXISTS "ProConfig_votes_idx" ON "ProConfig"("votes");
