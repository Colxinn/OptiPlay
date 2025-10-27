import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminPollCreator from "./poll-creator.jsx";
import AdminModeration from "./moderation.jsx";
import AdminNewsRefresh from "./news-refresh.jsx";

export default async function AdminPage() {
  const session = await auth();
  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { _count: { select: { comments: true } } },
  });
  const recentComments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { post: { select: { id: true, title: true } } },
  });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Owner Panel</h1>
        <p className="text-sm text-gray-400">Welcome, {session?.user?.name || 'Owner'}.</p>
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
          <h2 className="font-semibold mb-3">Create Daily Poll</h2>
          <AdminPollCreator />
        </div>
        <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
          <h2 className="font-semibold mb-3">Forum Moderation</h2>
          <AdminModeration posts={recentPosts} comments={recentComments} />
        </div>
      </section>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
          <h2 className="font-semibold mb-3">News Feeds</h2>
          <AdminNewsRefresh />
        </div>
      </section>
    </div>
  );
}
