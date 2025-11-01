async function seedHardware() {
  const gpus = loadJson("gpus.json");
  const cpus = loadJson("cpus.json");
  const games = loadJson("games.json");
  const benchmarks = loadJson("game-benchmarks.json");

  // 1️⃣ Insert base data (atomic)
  await prisma.$transaction([
    prisma.gPU.createMany({ data: gpus, skipDuplicates: true }),
    prisma.cPU.createMany({ data: cpus, skipDuplicates: true }),
    prisma.game.createMany({ data: games, skipDuplicates: true }),
  ]);

  // 2️⃣ Fetch IDs for mapping
  const [gpuRecords, cpuRecords, gameRecords] = await Promise.all([
    prisma.gPU.findMany({ select: { id: true, slug: true } }),
    prisma.cPU.findMany({ select: { id: true, slug: true } }),
    prisma.game.findMany({ select: { id: true, slug: true } }),
  ]);

  const gpuMap = new Map(gpuRecords.map((r) => [r.slug, r.id]));
  const cpuMap = new Map(cpuRecords.map((r) => [r.slug, r.id]));
  const gameMap = new Map(gameRecords.map((r) => [r.slug, r.id]));

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

  // 3️⃣ Insert benchmarks safely in chunks (outside any transaction)
  if (benchmarkRows.length) {
    await prisma.gameBenchmark.deleteMany();
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < benchmarkRows.length; i += CHUNK_SIZE) {
      const slice = benchmarkRows.slice(i, i + CHUNK_SIZE);
      await prisma.gameBenchmark.createMany({
        data: slice,
        skipDuplicates: true,
      });
    }
  }
}
