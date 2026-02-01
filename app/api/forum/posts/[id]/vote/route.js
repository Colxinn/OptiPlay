import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Auth required" }), { status: 401 });
  }
  const { id: postId } = await params;
  const { value } = await req.json();
  const v = Number(value);
  if (![1, -1, 0].includes(v)) {
    return new Response(JSON.stringify({ error: "Invalid vote" }), { status: 400 });
  }
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: { name: session.user.name || undefined, image: session.user.image || undefined },
    create: { email: session.user.email, name: session.user.name || null, image: session.user.image || null },
  });

  // One vote per user per post: replace existing
  await prisma.vote.deleteMany({ where: { userId: user.id, postId } });
  if (v !== 0) {
    await prisma.vote.create({ data: { userId: user.id, postId, value: v } });
  }
  const score = await prisma.vote.aggregate({ _sum: { value: true }, where: { postId } });
  return new Response(JSON.stringify({ ok: true, score: score._sum.value || 0 }), { status: 200 });
}

