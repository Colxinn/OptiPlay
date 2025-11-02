import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  inferRegionFromCountry,
  inferRegionFromGeo,
  isValidPingRegion,
  normalizeRegion,
} from "@/lib/pingRegions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESULTS_PER_SUBMISSION = 32;
const MAX_LATENCY_MS = 5000;
const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

function hashIp(ip) {
  if (!ip || !process.env.PING_HASH_SALT) return null;
  return crypto
    .createHash("sha256")
    .update(`${ip}-${process.env.PING_HASH_SALT}`)
    .digest("hex");
}

function sanitizeGameName(raw) {
  if (typeof raw !== "string") return "Roblox";
  const trimmed = raw.trim();
  if (!trimmed) return "Roblox";
  return trimmed.slice(0, 64);
}

function clampLatency(value) {
  if (!Number.isFinite(value)) return null;
  const clamped = Math.round(value);
  if (clamped <= 0 || clamped > MAX_LATENCY_MS) return null;
  return clamped;
}

function normalizeHour(value) {
  if (!Number.isFinite(value)) return null;
  const hour = Math.round(value) % 24;
  return hour < 0 ? hour + 24 : hour;
}

function parseFloatOrNull(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON payload" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  if (!payload || typeof payload !== "object") {
    return new Response(JSON.stringify({ ok: false, error: "Invalid payload" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const results = Array.isArray(payload.results) ? payload.results : [];
  if (!results.length) {
    return new Response(JSON.stringify({ ok: false, error: "No probe results provided" }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const headers = req.headers;
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    null;
  const ipHash = hashIp(ip);

  const country = payload.country || headers.get("x-vercel-ip-country") || null;
  const city = payload.city || headers.get("x-vercel-ip-city") || null;
  const latitude =
    parseFloatOrNull(payload.latitude) ||
    parseFloatOrNull(headers.get("x-vercel-ip-latitude"));
  const longitude =
    parseFloatOrNull(payload.longitude) ||
    parseFloatOrNull(headers.get("x-vercel-ip-longitude"));

  let derivedRegion =
    normalizeRegion(payload.playerRegion) ||
    normalizeRegion(inferRegionFromGeo({ latitude, longitude })) ||
    normalizeRegion(inferRegionFromCountry(country));

  const tzOffsetMinutes =
    Number.isFinite(payload.tzOffsetMinutes) ? Math.round(payload.tzOffsetMinutes) : null;
  const localHour = normalizeHour(payload.localHour);

  const shared = {
    game: sanitizeGameName(payload.game),
    playerRegion: derivedRegion,
    playerCountry: country || null,
    playerCity: city || null,
    playerLatitude: latitude,
    playerLongitude: longitude,
    playerTzOffset: tzOffsetMinutes,
    playerLocalHour: localHour,
    ipHash,
  };

  const records = [];
  for (const entry of results.slice(0, MAX_RESULTS_PER_SUBMISSION)) {
    if (!entry || typeof entry !== "object") continue;
    const serverRegion = normalizeRegion(entry.serverRegion);
    const latency = clampLatency(entry.latencyMs);
    if (!serverRegion || latency == null) continue;
    records.push({
      ...shared,
      serverRegion,
      latencyMs: latency,
    });
  }

  if (!records.length) {
    return new Response(JSON.stringify({ ok: false, error: "No valid samples to record" }), {
      status: 422,
      headers: JSON_HEADERS,
    });
  }

  try {
    await prisma.pingSample.createMany({ data: records });
  } catch (error) {
    console.error("Failed to store ping samples:", error);
    return new Response(JSON.stringify({ ok: false, error: "Unable to record samples" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  return new Response(JSON.stringify({ ok: true, inserted: records.length }), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    },
  });
}
