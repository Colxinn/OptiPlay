import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
  // Rate limit: 1 reply per 15 minutes per user (global)
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const recentReply = await prisma.comment.count({ where: { authorId: user.id, createdAt: { gte: since } } });
  if (recentReply >= 1) {
    return new Response(
      JSON.stringify({ error: "Reply limit: 1 per 15 minutes. Please wait." }),
      { status: 429 }
    );
  }
  const comment = await prisma.comment.create({ data: { content: text, postId, authorId: user.id } });
  return new Response(JSON.stringify({ comment }), { status: 201 });
}
