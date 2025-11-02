import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import AdminPollCreator from "./poll-creator.jsx";
import AdminModeration from "./moderation.jsx";
import AdminNewsRefresh from "./news-refresh.jsx";
import AdminUserDirectory from "./user-directory.jsx";
import AdminSponsorApplications from "./sponsors.jsx";
import AdminPollLog from "./poll-log.jsx";
import VisitorStats from "../components/VisitorStats.jsx";

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
  const sponsorApplications = await prisma.sponsorApplication.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  const pollHistory = await prisma.poll.findMany({
    orderBy: { startsAt: 'desc' },
    take: 10,
    include: {
      options: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Owner Panel</h1>
        <p className="text-sm text-gray-400">Welcome, {session?.user?.name || 'Owner'}.</p>
      </div>

      <AdminUserDirectory />

      <section className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
        <h2 className="font-semibold mb-3">Unique Visitor Tracking (Last 100 IPs)</h2>
        <VisitorStats />
      </section>

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
      <AdminPollLog polls={pollHistory} />
      <AdminSponsorApplications applications={sponsorApplications} />
    </div>
  );
}
