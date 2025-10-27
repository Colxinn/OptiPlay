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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const game = searchParams.get("game") || "Roblox";
  const regionFilter = searchParams.get("region");

  const p = path.join(process.cwd(), "data", "ping", "ping_data.json");
  const json = JSON.parse(fs.readFileSync(p, "utf8"));
  const games = Object.keys(json);
  const byRegion = json[game] || {};

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
