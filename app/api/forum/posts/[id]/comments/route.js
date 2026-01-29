import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureCleanContent } from "@/lib/contentModeration";
import { scanContent } from "@/lib/contentScanner";
import { refreshMuteStatus } from "@/lib/mutes";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Auth required" }), { status: 401 });
  }
  const { id: postId } = params;
  const { content } = await req.json();
  const text = (content || "").trim();
  if (!text) return new Response(JSON.stringify({ error: "Content required" }), { status: 400 });

  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: { name: session.user.name || undefined, image: session.user.image || undefined },
    create: { email: session.user.email, name: session.user.name || null, image: session.user.image || null },
  });
  const refreshedMute = await refreshMuteStatus(user.id);
  const isCurrentlyMuted = refreshedMute ? refreshedMute.isMuted : user.isMuted;
  if (isCurrentlyMuted) {
    return new Response(
      JSON.stringify({
        error: "You are muted and cannot reply right now.",
        muteExpiresAt:
          (refreshedMute?.muteExpiresAt || user.muteExpiresAt)?.toISOString?.() || null,
      }),
      { status: 403 }
    );
  }
  // Rate limit: 1 reply per 15 minutes per user (global)
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const recentReply = await prisma.comment.count({ where: { authorId: user.id, createdAt: { gte: since } } });
  if (recentReply >= 1) {
    return new Response(
      JSON.stringify({ error: "Reply limit: 1 per 15 minutes. Please wait." }),
      { status: 429 }
    );
  }
  const scanningEnabled = process.env.ENABLE_CONTENT_SCANNER === "true";
  const override = Boolean(body.override);
  const canOverride = Boolean(session.user?.isOwner);
  let scanResult = { flagged: false };
  if (scanningEnabled) {
    scanResult = await scanContent(text, { context: "forum-comment" });
    if (scanResult.flagged) {
      if (!override || !canOverride) {
        return new Response(
          JSON.stringify({
            error: "Content flagged for review.",
            flagged: true,
            score: scanResult.score,
            source: scanResult.source,
            message: scanResult.message,
            overrideAllowed: canOverride,
          }),
          { status: override && !canOverride ? 403 : 409 }
        );
      }
    }
  }

  let safeContent;
  try {
    safeContent = ensureCleanContent(text);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Reply contains blocked content." }),
      { status: 400 }
    );
  }
  const comment = await prisma.comment.create({ data: { content: safeContent, postId, authorId: user.id } });
  return new Response(
    JSON.stringify({
      comment,
      scan: scanningEnabled ? scanResult : null,
      overrideAccepted: scanningEnabled && scanResult.flagged && override && canOverride,
    }),
    { status: 201 }
  );
}
