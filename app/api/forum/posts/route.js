import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { isRemoved: false },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { comments: true, votes: true } },
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
  if (!title || !content) {
    return new Response(JSON.stringify({ error: "Title and content required" }), { status: 400 });
  }
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: { name: session.user.name || undefined, image: session.user.image || undefined },
    create: { email: session.user.email, name: session.user.name || null, image: session.user.image || null },
  });
  // Rate limit: 1 post per 24 hours per user
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.post.count({ where: { authorId: user.id, createdAt: { gte: since } } });
  if (recentCount >= 1) {
    return new Response(
      JSON.stringify({ error: "Daily post limit reached. Try again in 24h." }),
      { status: 429 }
    );
  }
  const post = await prisma.post.create({
    data: { title, content, authorId: user.id },
  });
  return new Response(JSON.stringify({ post }), { status: 201 });
}
