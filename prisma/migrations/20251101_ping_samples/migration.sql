CREATE TABLE IF NOT EXISTS "PingSample" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "game" TEXT NOT NULL,
  "serverRegion" TEXT NOT NULL,
  "latencyMs" INTEGER NOT NULL,
  "playerRegion" TEXT,
  "playerCountry" TEXT,
  "playerCity" TEXT,
  "playerLatitude" DOUBLE PRECISION,
  "playerLongitude" DOUBLE PRECISION,
  "playerTzOffset" INTEGER,
  "playerLocalHour" INTEGER,
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "PingSample_game_serverRegion_idx"
  ON "PingSample"("game", "serverRegion");

CREATE INDEX IF NOT EXISTS "PingSample_createdAt_idx"
  ON "PingSample"("createdAt");
