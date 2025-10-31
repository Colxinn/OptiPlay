import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureCleanContent } from "@/lib/contentModeration";
import { scanContent } from "@/lib/contentScanner";
import { refreshMuteStatus } from "@/lib/mutes";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function normalizeUsername(raw) {
  return decodeURIComponent(raw || "").trim();
}

export async function GET(_req, { params }) {
  const username = normalizeUsername(params.username);
  if (!username) {
    return json({ ok: false, error: "Missing username" }, 400);
  }
  const user = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      profileCommentsReceived: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, image: true, isOwner: true } } },
      },
    },
  });
  if (!user) {
    return json({ ok: false, error: "Profile not found" }, 404);
  }
  const comments = user.profileCommentsReceived.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.author?.id ?? "anon",
      name: comment.author?.name ?? "Anonymous",
      image: comment.author?.image ?? null,
      isOwner: comment.author?.isOwner ?? false,
    },
  }));
  return json({ ok: true, comments });
}

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const username = normalizeUsername(params.username);
  if (!username) {
    return json({ ok: false, error: "Missing username" }, 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const content = String(body.content || "").trim();
  if (!content) {
    return json({ ok: false, error: "Comment cannot be empty." }, 400);
  }
  if (content.length > 500) {
    return json({ ok: false, error: "Comment must be 500 characters or fewer." }, 400);
  }
  const refreshedMute = await refreshMuteStatus(session.user.id);
  if (refreshedMute?.isMuted) {
    return json(
      {
        ok: false,
        error: "You are muted and cannot leave profile comments.",
        muteExpiresAt: refreshedMute.muteExpiresAt
          ? refreshedMute.muteExpiresAt.toISOString()
          : null,
      },
      403
    );
  }

  const scanningEnabled = process.env.ENABLE_CONTENT_SCANNER === "true";
  const override = Boolean(body.override);
  const canOverride = Boolean(session.user?.isOwner);
  let scanResult = { flagged: false };
  if (scanningEnabled) {
    scanResult = await scanContent(content, { context: "profile-comment" });
    if (scanResult.flagged) {
      if (!override || !canOverride) {
        return json(
          {
            ok: false,
            error: "Comment flagged for review.",
            flagged: true,
            score: scanResult.score,
            source: scanResult.source,
            message: scanResult.message,
            overrideAllowed: canOverride,
          },
          override && !canOverride ? 403 : 409
        );
      }
    }
  }

  let safeContent;
  try {
    safeContent = ensureCleanContent(content);
  } catch (err) {
    return json({ ok: false, error: err.message || "Comment contains blocked content." }, 400);
  }

  const targetUser = await prisma.user.findUnique({
    where: { name: username },
    select: { id: true },
  });
  if (!targetUser) {
    return json({ ok: false, error: "Profile not found." }, 404);
  }

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const recent = await prisma.profileComment.findFirst({
    where: {
      authorId: session.user.id,
      targetId: targetUser.id,
      createdAt: { gte: thirtyMinutesAgo },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    return json({ ok: false, error: "You can only comment once every 30 minutes." }, 429);
  }

  const created = await prisma.profileComment.create({
    data: {
      authorId: session.user.id,
      targetId: targetUser.id,
      content: safeContent,
    },
    include: {
      author: { select: { id: true, name: true, image: true, isOwner: true } },
    },
  });

  return json({
    ok: true,
    comment: {
      id: created.id,
      content: created.content,
      createdAt: created.createdAt.toISOString(),
      author: {
        id: created.author?.id ?? "anon",
        name: created.author?.name ?? "Anonymous",
        image: created.author?.image ?? null,
        isOwner: created.author?.isOwner ?? false,
      },
    },
    scan: scanningEnabled ? scanResult : null,
    overrideAccepted: scanningEnabled && scanResult.flagged && override && canOverride,
  });
}
