import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^127\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc/i,
  /^fd/i,
];

function isLikelyPublicIp(ip) {
  if (!ip) return false;
  return !PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

async function lookupGeoData(ip) {
  if (!isLikelyPublicIp(ip)) {
    return {};
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "OptiPlay-IP-Logger/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return {};
    const data = await res.json();
    if (data.error) return {};
    const city = data.city || null;
    const region = data.region || null;
    const country = data.country_name || data.country || null;
    const latitude =
      typeof data.latitude === "number" ? data.latitude : parseFloat(data.latitude);
    const longitude =
      typeof data.longitude === "number" ? data.longitude : parseFloat(data.longitude);
    return {
      city,
      region,
      country,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
    };
  } catch {
    return {};
  }
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "";

  if (!ip) {
    return NextResponse.json({ ok: false, reason: "no-ip" });
  }

  const geo = await lookupGeoData(ip);

  await prisma.userAccessLog.upsert({
    where: {
      userId_ipAddress: {
        userId: session.user.id,
        ipAddress: ip,
      },
    },
    update: {
      city: geo.city ?? undefined,
      region: geo.region ?? undefined,
      country: geo.country ?? undefined,
      latitude: geo.latitude ?? undefined,
      longitude: geo.longitude ?? undefined,
      lastSeen: new Date(),
    },
    create: {
      userId: session.user.id,
      ipAddress: ip,
      city: geo.city ?? null,
      region: geo.region ?? null,
      country: geo.country ?? null,
      latitude: geo.latitude ?? null,
      longitude: geo.longitude ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
