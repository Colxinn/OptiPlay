DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BenchmarkResolution') THEN
    CREATE TYPE "BenchmarkResolution" AS ENUM ('R1080P', 'R1440P', 'R4K');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "GPU" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "family" TEXT,
  "architecture" TEXT,
  "releaseYear" INTEGER,
  "avgScore" DOUBLE PRECISION,
  "powerDraw" INTEGER,
  "priceUsd" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "CPU" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "family" TEXT,
  "architecture" TEXT,
  "releaseYear" INTEGER,
  "benchmarkScore" DOUBLE PRECISION NOT NULL,
  "cores" INTEGER,
  "threads" INTEGER,
  "tdpWatts" INTEGER,
  "priceUsd" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Game" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "genre" TEXT,
  "releaseYear" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "GameBenchmark" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "gameId" TEXT NOT NULL,
  "gpuId" TEXT NOT NULL,
  "cpuId" TEXT NOT NULL,
  "resolution" "BenchmarkResolution" NOT NULL,
  "avgFps" DOUBLE PRECISION NOT NULL,
  "source" TEXT,
  "notes" TEXT,
  "estimatedPowerDraw" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GameBenchmark_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GameBenchmark_gpuId_fkey" FOREIGN KEY ("gpuId") REFERENCES "GPU"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GameBenchmark_cpuId_fkey" FOREIGN KEY ("cpuId") REFERENCES "CPU"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "GameBenchmark_gameId_resolution_idx" ON "GameBenchmark"("gameId", "resolution");
CREATE INDEX IF NOT EXISTS "GameBenchmark_gpuId_idx" ON "GameBenchmark"("gpuId");
CREATE INDEX IF NOT EXISTS "GameBenchmark_cpuId_idx" ON "GameBenchmark"("cpuId");
