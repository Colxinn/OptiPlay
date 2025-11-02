import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_req, { params }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
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
      comments: {
        orderBy: { createdAt: "asc" },
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
        },
      },
      votes: true,
    },
  });
  if (!post) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  const score = post.votes.reduce((sum, v) => sum + (v.value || 0), 0);
  return new Response(JSON.stringify({ post: { ...post, score } }), { status: 200 });
}

export async function DELETE(_req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!post) {
    return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
  }

  const isOwner = session.user.isOwner;
  const isAuthor = session.user.id === post.authorId;
  if (!isOwner && !isAuthor) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  await prisma.post.update({
    where: { id },
    data: { isRemoved: true, isPinned: false },
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
