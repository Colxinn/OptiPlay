<<<<<<< HEAD
import HomeClient from './HomeClient';

export default function Page() {
  return <HomeClient />;
=======
import Link from 'next/link';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import prisma from '../lib/prisma';

export default async function Page() {
  let posts = [];
  try {
    posts = await prisma.post.findMany({
      include: { author: true, comments: true, votes: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    });
  } catch (e) {
    console.warn('prisma not ready in dev', e.message);
  }

  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <Sidebar />
        </aside>

        <section className="col-span-12 md:col-span-6 lg:col-span-7">
          <div className="mb-6">
            <div className="bg-white/3 border border-white/5 rounded-lg p-6">
              <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-optiPurple-300 to-optiPurple-500">Play smarter, run faster, stay updated.</h2>
              <p className="mt-2 text-slate-300">OptiPlay community — forum, polls, and tools to tune your rig.</p>
              <div className="mt-4 flex gap-3">
                <Link href="/forum/create" className="bg-optiPurple-500 px-4 py-2 rounded-md font-semibold">Create Post</Link>
                <Link href="/forum" className="border border-white/10 px-4 py-2 rounded-md">View Forum</Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map(p => (
              <article key={p.id} className="bg-[#06060a] border border-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{p.content.substring(0,120)}...</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-slate-400">By {p.author?.name || 'Unknown'}</div>
                  <Link href={`/forum/${p.id}`} className="text-sm text-optiPurple-300">Open</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="col-span-12 md:col-span-3 lg:col-span-3">
          <div className="sticky top-6 space-y-4">
            <div className="bg-[#07070b] border border-white/5 rounded-lg p-4">
              <h4 className="text-sm text-slate-300 font-semibold">Latest News</h4>
              <ul className="mt-3 space-y-3 text-sm text-slate-300">
                <li className="border-b border-white/5 pb-2">Patch notes summary.</li>
                <li className="border-b border-white/5 pb-2">Guide: Windows tweaks for latency.</li>
                <li>Community: Benchmark tool released.</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
>>>>>>> origin/main
}
