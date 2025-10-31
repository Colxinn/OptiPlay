import fs from "fs";
import path from "path";

const REGIONS = [
  { key: "NA-East", tzOffset: -4 },
  { key: "NA-West", tzOffset: -7 },
  { key: "EU-West", tzOffset: 1 },
  { key: "EU-East", tzOffset: 2 },
  { key: "SA", tzOffset: -3 },
  { key: "Asia-NE", tzOffset: 9 },
  { key: "Asia-SE", tzOffset: 7 },
  { key: "Oceania", tzOffset: 10 },
];

function pickBestHour(samples) {
  if (samples.length === 0) return 20; // default evening
  const bins = new Array(24).fill(0).map(() => []);
  for (const s of samples) {
    const h = new Date(s.created_at).getUTCHours();
    bins[h].push(s.ping);
  }
  let best = 0, bestVal = Infinity;
  for (let h = 0; h < 24; h++) {
    const arr = bins[h];
    if (!arr.length) continue;
    const avg = arr.reduce((a,b)=>a+b,0)/arr.length;
    if (avg < bestVal) { bestVal = avg; best = h; }
  }
  return best; // UTC hour
}

function loadDatasets(root) {
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
      } catch {}
    }
  }

  const legacyPath = path.join(root, "ping_data.json");
  if (fs.existsSync(legacyPath)) {
    try {
      datasets.push(JSON.parse(fs.readFileSync(legacyPath, "utf8")));
    } catch {}
  }

  return datasets;
}

function mergeDatasets(datasets) {
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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") || "Roblox";
  const regionFilter = searchParams.get("region");

  const root = path.join(process.cwd(), "data", "ping");
  const datasets = loadDatasets(root);
  if (!datasets.length) {
    return new Response(
      JSON.stringify({
        ok: false,
        data: [],
        games: [],
        regions: REGIONS.map((r) => r.key),
        reason: "No ping datasets available",
      }),
      { status: 200 }
    );
  }

  const merged = mergeDatasets(datasets);
  const games = Object.keys(merged).sort();
  const byRegion = merged[game] || {};

  const data = REGIONS
    .filter((r) => !regionFilter || r.key === regionFilter)
    .map((r) => {
      const entry = byRegion[r.key] || null;
      const avg = entry?.avg_ping ?? null;
      const samples = entry?.samples ?? 0;
      const localHour = entry?.best_hour_local ?? 21;
      return { region: r.key, avg_ping: avg, samples, best_hour_local: localHour };
    });

  return new Response(JSON.stringify({ ok: true, data, games, regions: REGIONS.map(r=>r.key) }), { status: 200 });
}
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
