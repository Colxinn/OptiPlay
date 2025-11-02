import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session?.user?.isOwner) {
    return new Response(JSON.stringify({ error: "Owner privileges required." }), { status: 403 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}
  const desired = typeof body.pin === "boolean" ? body.pin : null;

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { id: true, isPinned: true },
  });
  if (!post) {
    return new Response(JSON.stringify({ error: "Post not found." }), { status: 404 });
  }

  const nextPinned = desired ?? !post.isPinned;
  await prisma.post.update({
    where: { id: params.id },
    data: { isPinned: nextPinned },
  });

  return new Response(JSON.stringify({ ok: true, isPinned: nextPinned }), { status: 200 });
}
