import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ForumPostClient from "./ForumPostClient.jsx";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }) {
  const session = await auth();
  const post = await prisma.post.findUnique({
    where: { id: params.id },
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
        where: { isRemoved: false },
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
      votes: { select: { value: true } },
    },
  });

  if (!post) {
    return <div>Not found</div>;
  }

  const score = post.votes.reduce((sum, vote) => sum + (vote.value || 0), 0);

  const normalized = {
    id: post.id,
    title: post.title,
    content: post.content,
    image: post.image || null,
    createdAt: post.createdAt.toISOString(),
    isRemoved: post.isRemoved,
    score,
    author: post.author
      ? {
          id: post.author.id,
          name: post.author.name || "Anon",
          image: post.author.image,
          isOwner: post.author.isOwner,
          isMuted: post.author.isMuted,
          muteExpiresAt: post.author.muteExpiresAt
            ? post.author.muteExpiresAt.toISOString()
            : null,
        }
      : null,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author
        ? {
            id: comment.author.id,
            name: comment.author.name || "Anon",
            image: comment.author.image,
            isOwner: comment.author.isOwner,
            isMuted: comment.author.isMuted,
            muteExpiresAt: comment.author.muteExpiresAt
              ? comment.author.muteExpiresAt.toISOString()
              : null,
          }
        : null,
    })),
  };

  return <ForumPostClient post={normalized} viewer={session?.user || null} />;
}
