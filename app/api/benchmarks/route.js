import fs from "fs";
import path from "path";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const game = (searchParams.get("game") || "").toLowerCase();
  const gpu = (searchParams.get("gpu") || "").toLowerCase();

  const p = path.join(process.cwd(), "data", "benchmarks", "averages.json");
  const raw = fs.readFileSync(p, "utf8");
  const all = JSON.parse(raw);

  const filtered = all.filter((r) =>
    (!game || r.game.toLowerCase().includes(game)) &&
    (!gpu || r.gpu.toLowerCase().includes(gpu))
  );

  return new Response(
    JSON.stringify({ ok: true, rows: filtered.slice(0, 200) }),
    { status: 200 }
  );
}

// POST disabled: benchmarks are curated from datasets, not user-submitted
export async function POST() {
  return new Response(JSON.stringify({ ok: false, error: "submissions disabled" }), { status: 405 });
}
