import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { normalizeResolutionParam } from "@/lib/benchmarkUtils";

/** Utility to load a local JSON file from /data/benchmarks/hardware */
function loadJson(relativePath) {
  const file = path.join(process.cwd(), "data", "benchmarks", "hardware", relativePath);
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw);
}

/** Core seeding function — inserts GPUs, CPUs, Games, and Benchmark data */
async function seedHardware() {
  const gpus = loadJson("gpus.json");
  const cpus = loadJson("cpus.json");
  const games = loadJson("games.json");
  const benchmarks = loadJson("game-benchmarks.json");

  // 1️⃣ Insert base data (atomic, all-or-nothing)
  await prisma.$transaction([
    prisma.gPU.createMany({ data: gpus, skipDuplicates: true }),
    prisma.cPU.createMany({ data: cpus, skipDuplicates: true }),
    prisma.game.createMany({ data: games, skipDuplicates: true }),
  ]);

  // 2️⃣ Fetch IDs for mapping (so we can link benchmarks properly)
  const [gpuRecords, cpuRecords, gameRecords] = await Promise.all([
    prisma.gPU.findMany({ select: { id: true, slug: true } }),
    prisma.cPU.findMany({ select: { id: true, slug: true } }),
    prisma.game.findMany({ select: { id: true, slug: true } }),
  ]);

  const gpuMap = new Map(gpuRecords.map((r) => [r.slug, r.id]));
  const cpuMap = new Map(cpuRecords.map((r) => [r.slug, r.id]));
  const gameMap = new Map(gameRecords.map((r) => [r.slug, r.id]));

  // 3️⃣ Build all benchmark rows
  const benchmarkRows = benchmarks
    .map((entry) => {
      const resolutionEnum = normalizeResolutionParam(entry.resolution);
      const gameId = gameMap.get(entry.gameSlug);
      const gpuId = gpuMap.get(entry.gpuSlug);
      const cpuId = cpuMap.get(entry.cpuSlug);

      if (!resolutionEnum || !gameId || !gpuId || !cpuId) return null;

      return {
        gameId,
        gpuId,
        cpuId,
        resolution: resolutionEnum,
        avgFps: entry.avgFps,
        source: entry.source ?? null,
        notes: entry.notes ?? null,
        estimatedPowerDraw: entry.estimatedPowerDraw ?? null,
      };
    })
    .filter(Boolean);

  // 4️⃣ Insert benchmark data in safe, chunked batches
  if (benchmarkRows.length) {
    console.log(`🧹 Clearing existing benchmarks...`);
    await prisma.gameBenchmark.deleteMany();

    const CHUNK_SIZE = 1000;
    console.log(`📊 Inserting ${benchmarkRows.length} benchmark rows...`);

    for (let i = 0; i < benchmarkRows.length; i += CHUNK_SIZE) {
      const slice = benchmarkRows.slice(i, i + CHUNK_SIZE);
      await prisma.gameBenchmark.createMany({
        data: slice,
        skipDuplicates: true,
      });
      console.log(`   → inserted ${Math.min(i + CHUNK_SIZE, benchmarkRows.length)} / ${benchmarkRows.length}`);
    }

    console.log(`✅ Benchmark seeding complete.`);
  } else {
    console.warn("⚠️ No valid benchmark rows found to insert.");
  }
}

/** 
 * Ensures the seed only runs once concurrently.
 * (used by Next.js API routes or Vercel edge envs)
 */
let seedPromise = null;

export async function seedHardwareIfEmpty() {
  if (!seedPromise) {
    seedPromise = seedHardware().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}
