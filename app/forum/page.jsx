import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ForumComposer from "../components/ForumComposer.jsx";
import ForumList from "./ForumList.jsx";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const session = await auth();

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
          isOG: true,
        },
      },
      _count: { select: { comments: true } },
      votes: { select: { value: true } },
    },
  });

  const normalized = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt.toISOString(),
    isPinned: post.isPinned,
    commentCount: post._count.comments,
    score: post.votes.reduce((sum, v) => sum + (v.value || 0), 0),
    author: {
      id: post.author?.id ?? null,
      name: post.author?.name ?? "Anon",
      image: post.author?.image ?? null,
      isOwner: post.author?.isOwner ?? false,
      isMuted: post.author?.isMuted ?? false,
      muteExpiresAt: post.author?.muteExpiresAt
        ? post.author.muteExpiresAt.toISOString()
        : null,
      isOG: post.author?.isOG ?? false,
    },
    image: post.image || null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Forum</h1>
      </div>
      <ForumComposer />
      <ForumList posts={normalized} viewer={session?.user || null} />
    </div>
  );
}
