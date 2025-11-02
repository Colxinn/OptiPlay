import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { seedHardwareIfEmpty } from "@/lib/seedHardware";

export const runtime = "nodejs";

const fetchMeta = unstable_cache(
  async () => {
    const [games, gpus, cpus] = await Promise.all([
      prisma.game.findMany({ 
        orderBy: { name: "asc" },
        select: { slug: true, name: true, genre: true, releaseYear: true }
      }),
      prisma.gPU.findMany({ 
        orderBy: { name: "asc" },
        select: { slug: true, name: true, family: true, architecture: true, releaseYear: true }
      }),
      prisma.cPU.findMany({ 
        orderBy: { name: "asc" },
        select: { slug: true, name: true, family: true, architecture: true, releaseYear: true }
      }),
    ]);

    return {
      games,
      gpus,
      cpus,
    };
  },
  ["advanced-benchmark-meta-v3"],
  { revalidate: 60 * 60 * 24 }
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase().trim();
  const type = searchParams.get("type"); // 'gpu', 'cpu', 'game'
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  await seedHardwareIfEmpty();
  const { games, gpus, cpus } = await fetchMeta();

  // If searching, return filtered results only
  if (query && type) {
    let results = [];
    if (type === "gpu") {
      results = gpus.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        (item.family && item.family.toLowerCase().includes(query)) ||
        (item.architecture && item.architecture.toLowerCase().includes(query))
      ).slice(0, limit);
    } else if (type === "cpu") {
      results = cpus.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        (item.family && item.family.toLowerCase().includes(query)) ||
        (item.architecture && item.architecture.toLowerCase().includes(query))
      ).slice(0, limit);
    } else if (type === "game") {
      results = games.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        (item.genre && item.genre.toLowerCase().includes(query))
      ).slice(0, limit);
    }
    return Response.json({ results });
  }

  // Return full metadata for initial load
  const gpuFamilies = Array.from(
    new Set(gpus.map((gpu) => gpu.family ?? gpu.architecture).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const cpuFamilies = Array.from(
    new Set(cpus.map((cpu) => cpu.family ?? cpu.architecture).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  return Response.json({
    games,
    gpus,
    cpus,
    gpuFamilies,
    cpuFamilies,
    resolutions: ["1080p", "1440p", "4K"],
  });
}
