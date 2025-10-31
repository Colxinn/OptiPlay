import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { normalizeResolutionParam } from "@/lib/benchmarkUtils";

let seedPromise = null;

function loadJson(relativePath) {
  const file = path.join(process.cwd(), "data", "benchmarks", "hardware", relativePath);
  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw);
}

async function seedHardware() {
  const gpus = loadJson("gpus.json");
  const cpus = loadJson("cpus.json");
  const games = loadJson("games.json");
  const benchmarks = loadJson("game-benchmarks.json");

  await prisma.$transaction(async (tx) => {
    await tx.gPU.createMany({
      data: gpus.map((gpu) => ({
        name: gpu.name,
        slug: gpu.slug,
        family: gpu.family ?? null,
        architecture: gpu.architecture ?? null,
        releaseYear: gpu.releaseYear ?? null,
        avgScore: gpu.avgScore ?? null,
        powerDraw: gpu.powerDraw ?? null,
        priceUsd: gpu.priceUsd ?? null,
      })),
      skipDuplicates: true,
    });

    await tx.cPU.createMany({
      data: cpus.map((cpu) => ({
        name: cpu.name,
        slug: cpu.slug,
        family: cpu.family ?? null,
        architecture: cpu.architecture ?? null,
        releaseYear: cpu.releaseYear ?? null,
        benchmarkScore: cpu.benchmarkScore,
        cores: cpu.cores ?? null,
        threads: cpu.threads ?? null,
        tdpWatts: cpu.tdpWatts ?? null,
        priceUsd: cpu.priceUsd ?? null,
      })),
      skipDuplicates: true,
    });

    await tx.game.createMany({
      data: games.map((game) => ({
        name: game.name,
        slug: game.slug,
        genre: game.genre ?? null,
        releaseYear: game.releaseYear ?? null,
      })),
      skipDuplicates: true,
    });

    const gpuRecords = await tx.gPU.findMany({ select: { id: true, slug: true } });
    const cpuRecords = await tx.cPU.findMany({ select: { id: true, slug: true } });
    const gameRecords = await tx.game.findMany({ select: { id: true, slug: true } });

    const gpuMap = new Map(gpuRecords.map((record) => [record.slug, record.id]));
    const cpuMap = new Map(cpuRecords.map((record) => [record.slug, record.id]));
    const gameMap = new Map(gameRecords.map((record) => [record.slug, record.id]));

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

    if (benchmarkRows.length) {
      await tx.gameBenchmark.createMany({
        data: benchmarkRows,
        skipDuplicates: true,
      });
    }
  });
}

export async function seedHardwareIfEmpty() {
  if (!seedPromise) {
    seedPromise = seedHardware().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  return seedPromise;
}
