import prisma from "@/lib/prisma";
import VoteButtons from "@/app/components/VoteButtons.jsx";
import CommentForm from "@/app/components/CommentForm.jsx";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { name: true, image: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        where: { isRemoved: false },
        include: { author: { select: { name: true, image: true } } },
      },
      votes: { select: { value: true } },
    },
  });
  if (!post) return <div>Not found</div>;
  const score = post.votes.reduce((s, v) => s + (v.value || 0), 0);
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{post.isRemoved ? '[removed]' : post.title}</h1>
          <VoteButtons postId={post.id} initialScore={score} />
        </div>
        <div className="text-xs text-gray-400 mt-1">by {post.author?.name || "Anon"}</div>
        {post.isRemoved ? (
          <p className="mt-4 text-gray-400 italic">This post has been removed by a moderator.</p>
        ) : (
          <p className="mt-4 text-gray-200 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <CommentForm postId={post.id} />
        <ul className="space-y-3">
          {post.comments.map((c) => (
            <li key={c.id} className="p-3 rounded-lg bg-neutral-900 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">{c.author?.name || "Anon"}</div>
              <div className="text-sm text-gray-200">{c.content}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
