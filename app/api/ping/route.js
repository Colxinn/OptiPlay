import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { PING_REGIONS, PING_REGION_KEYS, isValidPingRegion } from "@/lib/pingRegions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loadLegacyDatasets(root) {
  const datasets = [];
  const sourcesDir = path.join(root, "sources");
  if (fs.existsSync(sourcesDir)) {
    const files = fs
      .readdirSync(sourcesDir)
      .filter((f) => f.endsWith(".json"))
      .sort();
    for (const file of files) {
      try {
        const json = JSON.parse(
          fs.readFileSync(path.join(sourcesDir, file), "utf8")
        );
        datasets.push(json);
      } catch {
        // ignore invalid JSON
      }
    }
  }

  const legacyPath = path.join(root, "ping_data.json");
  if (fs.existsSync(legacyPath)) {
    try {
      datasets.push(JSON.parse(fs.readFileSync(legacyPath, "utf8")));
    } catch {
      // ignore invalid JSON
    }
  }

  return datasets;
}

function mergeLegacyDatasets(datasets) {
  const merged = {};
  for (const dataset of datasets) {
    for (const [game, regions] of Object.entries(dataset)) {
      merged[game] ??= {};
      for (const [region, entry] of Object.entries(regions)) {
        if (!entry) continue;
        const weight = Math.max(entry.samples ?? 0, 1);
        const bucket = (merged[game][region] ??= {
          pingWeighted: 0,
          hourWeighted: 0,
          samples: 0,
        });
        bucket.pingWeighted += (entry.avg_ping ?? 0) * weight;
        bucket.hourWeighted += (entry.best_hour_local ?? 21) * weight;
        bucket.samples += entry.samples ?? 0;
        bucket.weights = (bucket.weights ?? 0) + weight;
      }
    }
  }

  const byGame = {};
  for (const [game, regions] of Object.entries(merged)) {
    byGame[game] = {};
    for (const [region, bucket] of Object.entries(regions)) {
      const divisor = bucket.weights || 1;
      const avgPing =
        bucket.pingWeighted === 0 && divisor === 0
          ? null
          : Math.round(bucket.pingWeighted / divisor);
      const bestHour =
        bucket.hourWeighted === 0 && divisor === 0
          ? 21
          : Math.round(bucket.hourWeighted / divisor) % 24;
      byGame[game][region] = {
        avg_ping: avgPing,
        best_hour_local: bestHour,
        samples: bucket.samples,
      };
    }
  }
  return byGame;
}

async function summarizeFromDatabase(game) {
  const groupAll = await prisma.pingSample.groupBy({
    by: ["game"],
    _count: { _all: true },
  });

  const games = groupAll
    .map((entry) => entry.game)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (!games.length) {
    return { games: [], data: [], game: null };
  }

  const selectedGame = game && games.includes(game) ? game : games[0];

  const [baseStats, hourStats] = await Promise.all([
    prisma.pingSample.groupBy({
      by: ["serverRegion"],
      where: { game: selectedGame },
      _avg: { latencyMs: true },
      _count: { latencyMs: true },
    }),
    prisma.pingSample.groupBy({
      by: ["serverRegion", "playerLocalHour"],
      where: {
        game: selectedGame,
        playerLocalHour: { not: null },
      },
      _avg: { latencyMs: true },
    }),
  ]);

  const baseMap = new Map(
    baseStats
      .filter((entry) => entry.serverRegion && isValidPingRegion(entry.serverRegion))
      .map((entry) => [entry.serverRegion, entry])
  );

  const bestHourMap = new Map();
  for (const entry of hourStats) {
    if (!entry.serverRegion || !isValidPingRegion(entry.serverRegion)) continue;
    const avg = entry._avg.latencyMs;
    if (avg == null) continue;
    const current = bestHourMap.get(entry.serverRegion);
    if (!current || avg < current.avg) {
      bestHourMap.set(entry.serverRegion, {
        hour: entry.playerLocalHour ?? 0,
        avg,
      });
    }
  }

  const data = PING_REGIONS.map((region) => {
    const stat = baseMap.get(region.key);
    const avg = stat?._avg.latencyMs ?? null;
    const samples = stat?._count.latencyMs ?? 0;
    const bestHourEntry = bestHourMap.get(region.key);
    return {
      region: region.key,
      avg_ping: avg == null ? null : Math.round(avg),
      samples,
      best_hour_local: bestHourEntry ? bestHourEntry.hour : null,
    };
  });

  return { games, data, game: selectedGame };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const requestedGame = searchParams.get("game") || null;
  const regionFilter = searchParams.get("region");

  let jsonGames = [];
  let jsonData = [];
  let selectedGame = requestedGame;
  let usedDatabase = false;

  try {
    const summary = await summarizeFromDatabase(requestedGame);
    if (summary.games.length && summary.data.some((entry) => entry.samples > 0)) {
      jsonGames = summary.games;
      jsonData = summary.data;
      selectedGame = summary.game;
      usedDatabase = true;
    }
  } catch (error) {
    console.error("Failed to build ping summary from database:", error);
  }

  if (!usedDatabase) {
    const datasets = loadLegacyDatasets(path.join(process.cwd(), "data", "ping"));
    if (datasets.length) {
      const merged = mergeLegacyDatasets(datasets);
      jsonGames = Object.keys(merged).sort();
      const fallbackGame =
        selectedGame && merged[selectedGame] ? selectedGame : jsonGames[0] || "Roblox";
      const byRegion = merged[fallbackGame] || {};
      jsonData = PING_REGIONS.map((region) => {
        const entry = byRegion[region.key] || null;
        return {
          region: region.key,
          avg_ping: entry?.avg_ping ?? null,
          samples: entry?.samples ?? 0,
          best_hour_local: entry?.best_hour_local ?? null,
        };
      });
      selectedGame = fallbackGame;
    }
  }

  if (!jsonGames.length) {
    return new Response(
      JSON.stringify({
        ok: false,
        data: [],
        games: [],
        regions: PING_REGION_KEYS,
        reason: "No ping datasets available",
      }),
      { status: 200 }
    );
  }

  const filtered = regionFilter
    ? jsonData.filter((entry) => entry.region === regionFilter)
    : jsonData;

  return new Response(
    JSON.stringify({
      ok: true,
      games: jsonGames,
      regions: PING_REGION_KEYS,
      data: filtered,
      game: selectedGame,
      source: usedDatabase ? "live" : "legacy",
    }),
    { status: 200 }
  );
}
