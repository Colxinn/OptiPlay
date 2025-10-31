import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function autoUnmuteExpiredMutes() {
  const now = new Date();
  const expired = await prisma.user.findMany({
    where: { isMuted: true, muteExpiresAt: { lte: now } },
    select: { id: true },
  });
  if (!expired.length) return;

  const ops = expired.flatMap((user) => [
    prisma.user.update({
      where: { id: user.id },
      data: {
        isMuted: false,
        mutedAt: null,
        mutedReason: null,
        mutedByEmail: null,
        muteExpiresAt: null,
      },
    }),
    prisma.userMuteAudit.create({
      data: {
        userId: user.id,
        action: "auto_unmute",
        reason: "Mute expired automatically.",
      },
    }),
  ]);
  await prisma.$transaction(ops);
}

function buildWhereClause({ search, status, ip }) {
  const where = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (status === "muted") {
    where.isMuted = true;
  } else if (status === "active") {
    where.isMuted = false;
  } else if (status === "owners") {
    where.isOwner = true;
  }
  if (ip) {
    where.accessLogs = {
      some: { ipAddress: { contains: ip, mode: "insensitive" } },
    };
  }
  return where;
}

function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.isOwner) {
    return json({ error: "Forbidden" }, 403);
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() || "";
  const status = url.searchParams.get("status")?.trim() || "";
  const ip = url.searchParams.get("ip")?.trim() || "";
  const format = url.searchParams.get("format")?.trim() || "";

  await autoUnmuteExpiredMutes();

  const users = await prisma.user.findMany({
    where: buildWhereClause({ search, status, ip }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      isOwner: true,
      isMuted: true,
      mutedAt: true,
      mutedReason: true,
      mutedByEmail: true,
      muteExpiresAt: true,
      createdAt: true,
      _count: { select: { posts: true, comments: true } },
      accessLogs: {
        orderBy: { lastSeen: "desc" },
        take: 10,
        select: {
          id: true,
          ipAddress: true,
          city: true,
          region: true,
          country: true,
          lastSeen: true,
        },
      },
      muteAudits: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          reason: true,
          moderatorEmail: true,
          expiresAt: true,
          createdAt: true,
        },
      },
    },
  });

  const payload = users.map((user) => {
    const lastSeen = user.accessLogs[0]?.lastSeen || null;
    const muteExpiresAt = user.muteExpiresAt || null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      isOwner: user.isOwner,
      isMuted: user.isMuted,
      mutedAt: user.mutedAt ? user.mutedAt.toISOString() : null,
      mutedReason: user.mutedReason,
      mutedByEmail: user.mutedByEmail,
      muteExpiresAt: muteExpiresAt ? muteExpiresAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      counts: {
        posts: user._count.posts,
        comments: user._count.comments,
      },
      accessLogs: user.accessLogs.map((log) => ({
        id: log.id,
        ipAddress: log.ipAddress,
        city: log.city,
        region: log.region,
        country: log.country,
        lastSeen: log.lastSeen.toISOString(),
      })),
      lastSeen: lastSeen ? lastSeen.toISOString() : null,
      muteHistory: user.muteAudits.map((entry) => ({
        id: entry.id,
        action: entry.action,
        reason: entry.reason,
        moderatorEmail: entry.moderatorEmail,
        expiresAt: entry.expiresAt ? entry.expiresAt.toISOString() : null,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  });

  if (format === "csv") {
    const header = [
      "id",
      "email",
      "name",
      "isOwner",
      "isMuted",
      "muteExpiresAt",
      "mutedReason",
      "mutedByEmail",
      "createdAt",
      "lastSeen",
    ];
    const rows = payload.map((user) =>
      [
        user.id,
        user.email,
        user.name,
        user.isOwner,
        user.isMuted,
        user.muteExpiresAt,
        user.mutedReason,
        user.mutedByEmail,
        user.createdAt,
        user.lastSeen,
      ]
        .map(toCsvValue)
        .join(",")
    );
    const csv = [header.map(toCsvValue).join(","), ...rows].join("\n");
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="optiplay-users.csv"`,
      },
    });
  }

  return json({ ok: true, users: payload });
}
