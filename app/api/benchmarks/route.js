import prisma from "@/lib/prisma";
import {
  computePerformancePerDollar,
  computePowerEnvelope,
  computeWeightedIndex,
  normalizeResolutionParam,
  resolutionLabelFromEnum,
} from "@/lib/benchmarkUtils";
import { seedHardwareIfEmpty } from "@/lib/seedHardware";

export const runtime = "nodejs";

function buildFilters({ game, gpu, cpu, resolution }) {
  const and = [];

  if (game) {
    and.push({
      OR: [
        { game: { is: { slug: game } } },
        { game: { is: { name: { contains: game, mode: "insensitive" } } } },
      ],
    });
  }

  if (gpu) {
    and.push({
      OR: [
        { gpu: { is: { slug: gpu } } },
        { gpu: { is: { name: { contains: gpu, mode: "insensitive" } } } },
        { gpu: { is: { family: { contains: gpu, mode: "insensitive" } } } },
        { gpu: { is: { architecture: { contains: gpu, mode: "insensitive" } } } },
      ],
    });
  }

  if (cpu) {
    and.push({
      OR: [
        { cpu: { is: { slug: cpu } } },
        { cpu: { is: { name: { contains: cpu, mode: "insensitive" } } } },
        { cpu: { is: { family: { contains: cpu, mode: "insensitive" } } } },
        { cpu: { is: { architecture: { contains: cpu, mode: "insensitive" } } } },
      ],
    });
  }

  if (resolution) {
    and.push({ resolution });
  }

  return and.length ? { AND: and } : {};
}

async function fetchBenchmarks(filters) {
  const where = buildFilters(filters);
  return prisma.gameBenchmark.findMany({
    where,
    include: {
      game: true,
      gpu: true,
      cpu: true,
    },
    orderBy: [
      { avgFps: "desc" },
      { createdAt: "desc" },
    ],
    take: 200,
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const gameParam = searchParams.get("game")?.trim();
    const gpuParam = searchParams.get("gpu")?.trim();
    const cpuParam = searchParams.get("cpu")?.trim();
    const resolutionParam = normalizeResolutionParam(searchParams.get("resolution"));

    await seedHardwareIfEmpty();

    const filters = {
      game: gameParam ? gameParam.toLowerCase() : null,
      gpu: gpuParam ? gpuParam.toLowerCase() : null,
      cpu: cpuParam ? cpuParam.toLowerCase() : null,
      resolution: resolutionParam,
    };

    const rows = await fetchBenchmarks(filters);

    const payload = rows.map((row) => {
      const weightedIndex = computeWeightedIndex(row.avgFps, row.cpu.benchmarkScore);
      const performancePerDollar = computePerformancePerDollar(
        row.avgFps,
        row.gpu.priceUsd,
        row.cpu.priceUsd
      );
      const fallbackPower = computePowerEnvelope(row.gpu.powerDraw, row.cpu.tdpWatts);
      const totalPower = row.estimatedPowerDraw ?? fallbackPower;

      return {
        id: row.id,
        resolution: resolutionLabelFromEnum(row.resolution),
        avgFps: row.avgFps,
        weightedIndex,
        performancePerDollar,
        totalPowerDraw: totalPower,
        metadata: {
          source: row.source,
          notes: row.notes,
        },
        game: {
          id: row.game.id,
          name: row.game.name,
          slug: row.game.slug,
          genre: row.game.genre,
          releaseYear: row.game.releaseYear,
        },
        gpu: {
          id: row.gpu.id,
          name: row.gpu.name,
          slug: row.gpu.slug,
          family: row.gpu.family,
          architecture: row.gpu.architecture,
          releaseYear: row.gpu.releaseYear,
          avgScore: row.gpu.avgScore,
          powerDraw: row.gpu.powerDraw,
          priceUsd: row.gpu.priceUsd,
        },
        cpu: {
          id: row.cpu.id,
          name: row.cpu.name,
          slug: row.cpu.slug,
          family: row.cpu.family,
          architecture: row.cpu.architecture,
          releaseYear: row.cpu.releaseYear,
          benchmarkScore: row.cpu.benchmarkScore,
          cores: row.cpu.cores,
          threads: row.cpu.threads,
          tdpWatts: row.cpu.tdpWatts,
          priceUsd: row.cpu.priceUsd,
        },
        grouping: {
          gpuFamily: row.gpu.family ?? row.gpu.architecture ?? "Other GPUs",
          cpuFamily: row.cpu.family ?? row.cpu.architecture ?? "Other CPUs",
        },
      };
    });

    return Response.json({ ok: true, results: payload });
  } catch (error) {
    console.error("GET /api/benchmarks failed", error);
    return Response.json(
      { ok: false, error: error.message ?? "Failed to load benchmarks." },
      { status: 500 }
    );
  }
}
