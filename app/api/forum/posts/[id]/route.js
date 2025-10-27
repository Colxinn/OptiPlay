import prisma from "@/lib/prisma";

export async function GET(_req, { params }) {
  const { id } = params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, image: true } } },
      },
      votes: true,
    },
  });
  if (!post) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  const score = post.votes.reduce((sum, v) => sum + (v.value || 0), 0);
  return new Response(JSON.stringify({ post: { ...post, score } }), { status: 200 });
}

