import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { seedHardwareIfEmpty } from "@/lib/seedHardware";

export const runtime = "nodejs";

const fetchMeta = unstable_cache(
  async () => {
    const [games, gpus, cpus] = await Promise.all([
      prisma.game.findMany({ orderBy: { name: "asc" } }),
      prisma.gPU.findMany({ orderBy: { name: "asc" } }),
      prisma.cPU.findMany({ orderBy: { name: "asc" } }),
    ]);

    return {
      games,
      gpus,
      cpus,
    };
  },
  ["advanced-benchmark-meta-v2"],
  { revalidate: 60 * 60 * 24 }
);

export async function GET() {
  await seedHardwareIfEmpty();
  const { games, gpus, cpus } = await fetchMeta();

  const gpuFamilies = Array.from(
    new Set(gpus.map((gpu) => gpu.family ?? gpu.architecture).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const cpuFamilies = Array.from(
    new Set(cpus.map((cpu) => cpu.family ?? cpu.architecture).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return Response.json({
    games: games.map((game) => ({
      slug: game.slug,
      name: game.name,
      genre: game.genre,
      releaseYear: game.releaseYear,
    })),
    gpus: gpus.map((gpu) => ({
      slug: gpu.slug,
      name: gpu.name,
      family: gpu.family,
      architecture: gpu.architecture,
      releaseYear: gpu.releaseYear,
    })),
    cpus: cpus.map((cpu) => ({
      slug: cpu.slug,
      name: cpu.name,
      family: cpu.family,
      architecture: cpu.architecture,
      releaseYear: cpu.releaseYear,
    })),
    gpuFamilies,
    cpuFamilies,
    resolutions: ["1080p", "1440p", "4K"],
  });
}
