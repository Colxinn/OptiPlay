import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureCleanContent } from "@/lib/contentModeration";

export const runtime = "nodejs";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.isOwner) {
    return json({ error: "Forbidden" }, 403);
  }

  const { id } = await params;
  if (!id) {
    return json({ error: "Missing user id" }, 400);
  }
  if (session.user.id === id) {
    return json({ error: "You cannot change your own mute state." }, 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON payload." }, 400);
  }

  const shouldMute = Boolean(body.mute);
  const reasonInput = typeof body.reason === "string" ? body.reason.trim() : "";
  const durationMinutesRaw = body.durationMinutes;
  const expiresAtRaw = body.expiresAt;
  let safeReason = "";
  if (reasonInput) {
    try {
      safeReason = ensureCleanContent(reasonInput, { allowLinks: true }).slice(0, 280);
    } catch (err) {
      return json({ error: err.message || "Reason contains blocked language." }, 400);
    }
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isOwner: true, isMuted: true },
  });
  if (!target) {
    return json({ error: "User not found." }, 404);
  }
  if (target.isOwner) {
    return json({ error: "Owners cannot be muted." }, 400);
  }

  const now = new Date();
  let muteExpiresAt = null;
  if (shouldMute) {
    if (typeof durationMinutesRaw === "number" && Number.isFinite(durationMinutesRaw) && durationMinutesRaw > 0) {
      muteExpiresAt = new Date(now.getTime() + durationMinutesRaw * 60 * 1000);
    } else if (typeof expiresAtRaw === "string" && expiresAtRaw.trim()) {
      const parsed = new Date(expiresAtRaw);
      if (!Number.isNaN(parsed.getTime()) && parsed > now) {
        muteExpiresAt = parsed;
      }
    }
  }

  const updateData = shouldMute
    ? {
        isMuted: true,
        mutedAt: now,
        mutedReason: safeReason || null,
        mutedByEmail: session.user.email || null,
        muteExpiresAt,
      }
    : {
        isMuted: false,
        mutedAt: null,
        mutedReason: null,
        mutedByEmail: null,
        muteExpiresAt: null,
      };

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: updateData,
    }),
    prisma.userMuteAudit.create({
      data: {
        userId: id,
        action: shouldMute ? "mute" : "unmute",
        reason: safeReason || null,
        moderatorEmail: session.user.email || null,
        expiresAt: updateData.muteExpiresAt ?? null,
      },
    }),
  ]);

  return json({
    ok: true,
    muted: shouldMute,
    mutedReason: shouldMute ? safeReason || null : null,
    mutedAt: shouldMute ? now.toISOString() : null,
    mutedByEmail: shouldMute ? session.user.email || null : null,
    muteExpiresAt: updateData.muteExpiresAt ? updateData.muteExpiresAt.toISOString() : null,
  });
}
