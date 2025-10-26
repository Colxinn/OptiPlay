import prisma from '../../lib/prisma';
import Link from 'next/link';

export default async function ForumPage(){
  let posts = [];
  try {
    posts = await prisma.post.findMany({ include: { author:true, comments:true, votes:true }, orderBy:{ createdAt: 'desc' } });
  } catch (e) { console.warn(e.message); }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl mb-4">Forum</h1>
      <Link href="/forum/create" className="mb-4 inline-block bg-optiPurple-500 px-3 py-2 rounded">Create Post</Link>
      <div className="space-y-4">
        {posts.map(p=> (
          <article key={p.id} className="p-4 bg-[#05050a] rounded border border-white/5">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-slate-300 mt-2">{p.content.substring(0,200)}...</p>
            <div className="mt-2 text-xs text-slate-400">By {p.author?.name || 'anon'} • {p.comments.length} comments • {p.votes.length} votes</div>
            <div className="mt-2"><Link href={`/forum/${p.id}`} className="text-optiPurple-300">Open</Link></div>
          </article>
        ))}
      </div>
    </div>
  )
}
