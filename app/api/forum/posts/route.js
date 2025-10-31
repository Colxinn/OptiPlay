import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureCleanContent } from "@/lib/contentModeration";
import { sanitizeImageData } from "@/lib/imageValidation";
import { scanContent } from "@/lib/contentScanner";
import { refreshMuteStatus } from "@/lib/mutes";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { isRemoved: false },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          isOwner: true,
          isMuted: true,
          muteExpiresAt: true,
        },
      },
      _count: { select: { comments: true } },
      votes: { select: { value: true } },
    },
  });
  return new Response(JSON.stringify({ posts }), { status: 200 });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Auth required" }), { status: 401 });
  }
  const body = await req.json();
  const title = (body.title || "").trim();
  const content = (body.content || "").trim();
  const safeImage = sanitizeImageData(body.imageData || "");
  const hasImagePayload = typeof body.imageData === "string" && body.imageData.trim();
  if (hasImagePayload && !safeImage) {
    return new Response(
      JSON.stringify({ error: "Attached image is too large or not supported." }),
      { status: 400 }
    );
  }
  if (!title || !content) {
    return new Response(JSON.stringify({ error: "Title and content required" }), { status: 400 });
  }
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
        error: "You are muted and cannot create new threads.",
        muteExpiresAt:
          (refreshedMute?.muteExpiresAt || user.muteExpiresAt)?.toISOString?.() || null,
      }),
      { status: 403 }
    );
  }
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.post.count({ where: { authorId: user.id, createdAt: { gte: since } } });
  if (recentCount >= 1 && !session.user.isOwner) {
    return new Response(
      JSON.stringify({ error: "Daily post limit reached. Try again in 24h." }),
      { status: 429 }
    );
  }
  const scanningEnabled = process.env.ENABLE_CONTENT_SCANNER === "true";
  const override = Boolean(body.override);
  const canOverride = Boolean(session.user?.isOwner);
  let scanResult = { flagged: false };
  if (scanningEnabled) {
    scanResult = await scanContent(`${title}\n\n${content}`, { context: "forum-post" });
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
  let safeTitle;
  let safeContent;
  try {
    safeTitle = ensureCleanContent(title);
    safeContent = ensureCleanContent(content);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Post contains blocked content." }),
      { status: 400 }
    );
  }
  const post = await prisma.post.create({
    data: { title: safeTitle, content: safeContent, authorId: user.id, image: safeImage },
  });
  return new Response(
    JSON.stringify({
      post,
      scan: scanningEnabled ? scanResult : null,
      overrideAccepted: scanningEnabled && scanResult.flagged && override,
    }),
    { status: 201 }
  );
}
