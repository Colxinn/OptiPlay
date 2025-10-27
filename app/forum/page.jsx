import prisma from "@/lib/prisma";
import Link from "next/link";
import ForumComposer from "../components/ForumComposer.jsx";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const posts = await prisma.post.findMany({
    where: { isRemoved: false },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, image: true } },
      _count: { select: { comments: true } },
      votes: { select: { value: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Forum</h1>
      </div>
      <ForumComposer />
      <ul className="space-y-3">
        {posts.map((p) => {
          const score = p.votes.reduce((s, v) => s + (v.value || 0), 0);
          return (
            <li key={p.id} className="p-4 rounded-xl bg-neutral-900 border border-white/10">
              <Link href={`/forum/${p.id}`} className="text-lg font-semibold hover:underline">
                {p.title}
              </Link>
              <div className="text-xs text-gray-400 mt-1">
                by {p.author?.name || "Anon"} • {p._count.comments} comments • score {score}
              </div>
              <p className="text-sm text-gray-300 mt-2 line-clamp-2">{p.content}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
