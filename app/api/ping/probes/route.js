import fs from "fs";
import path from "path";
import { PING_REGION_KEYS, isValidPingRegion } from "@/lib/pingRegions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loadProbes() {
  const file = path.join(process.cwd(), "data", "ping", "probes.json");
  if (!fs.existsSync(file)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (entry) =>
        entry &&
        typeof entry.url === "string" &&
        isValidPingRegion(entry.region)
    );
  } catch (error) {
    console.warn("Failed to load ping probes:", error);
    return [];
  }
}

export async function GET() {
  const probes = loadProbes();
  // Ensure we always return at least placeholder entries for configured regions.
  const ensured = probes.length
    ? probes
    : PING_REGION_KEYS.map((region) => ({
        region,
        url: `/api/ping/probe?region=${encodeURIComponent(region)}`,
      }));

  return new Response(JSON.stringify({ ok: true, probes: ensured }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
