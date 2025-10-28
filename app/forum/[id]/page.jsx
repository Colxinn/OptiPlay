<<<<<<< HEAD
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
=======
'use client'
import { useState, useEffect } from 'react';

export default function PostPage({ params }){
  const id = params.id;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=>{ fetchPost(); }, []);

  async function fetchPost(){
    const res = await fetch(`/api/posts/${id}`);
    const data = await res.json();
    setPost(data.post);
    setComments(data.comments);
  }

  async function submitComment(e){
    e.preventDefault();
    if (process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true') {
      const dev = localStorage.getItem('dev_user');
      if (!dev) return alert('Dev auth required.');
    }
    const dev = localStorage.getItem('dev_user');
    const headers = dev ? { 'x-dev-user': dev } : {};
    const res = await fetch('/api/comments', { method:'POST', headers:{'Content-Type':'application/json', ...headers}, body: JSON.stringify({ postId:id, content:text })});
    if (res.ok) {
      setText('');
      fetchPost();
    } else alert('Failed');
  }

  async function vote(v){
    const dev = localStorage.getItem('dev_user');
    const headers = dev ? { 'x-dev-user': dev } : {};
    await fetch('/api/posts/vote', { method:'POST', headers:{'Content-Type':'application/json', ...headers}, body: JSON.stringify({ postId:id, value:v })});
    fetchPost();
  }

  if (!post) return <div className="p-4">Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <article className="bg-[#05050a] p-6 rounded border border-white/5">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="mt-2 text-slate-300">{post.content}</p>
        <div className="mt-4 text-sm text-slate-400">By {post.author?.name || 'anon'}</div>
        <div className="mt-4 flex gap-2">
          <button onClick={()=>vote(1)} className="px-3 py-1 bg-optiPurple-500 rounded">Upvote</button>
          <button onClick={()=>vote(-1)} className="px-3 py-1 border rounded">Downvote</button>
          <div className="text-sm text-slate-400 ml-2">Votes: {post._count?.votes || 0}</div>
        </div>
      </article>

      <section className="mt-6">
        <h2 className="text-xl">Comments</h2>
        <form onSubmit={submitComment} className="mt-3">
          <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full p-3 bg-[#0b0b10] rounded" rows={4} required></textarea>
          <button className="mt-2 bg-optiPurple-500 px-3 py-2 rounded">Comment</button>
        </form>
        <div className="mt-4 space-y-3">
          {comments.map(c=> (
            <div key={c.id} className="p-3 bg-[#06060a] rounded"> 
              <div className="text-sm text-slate-300">{c.content}</div>
              <div className="text-xs text-slate-400 mt-2">By {c.author?.name || 'anon'}</div>
            </div>
          ))}
        </div>
>>>>>>> origin/main
      </section>
    </div>
  );
}
