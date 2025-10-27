'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

async function patch(url, body){
  const res = await fetch(url,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error || 'Failed');
  return res.json();
}

export default function AdminModeration({ posts, comments }){
  const [pList, setPList] = useState(posts);
  const [cList, setCList] = useState(comments);
  const [pending, start] = useTransition();

  function togglePost(id, isRemoved){
    start(async()=>{
      const action = isRemoved ? 'restore' : 'remove';
      try{ await patch(`/api/admin/forum/posts/${id}`, { action });
        setPList(pList.map(p=> p.id===id ? { ...p, isRemoved: !isRemoved } : p));
      }catch{}
    });
  }
  function toggleComment(id, isRemoved){
    start(async()=>{
      const action = isRemoved ? 'restore' : 'remove';
      try{ await patch(`/api/admin/forum/comments/${id}`, { action });
        setCList(cList.map(c=> c.id===id ? { ...c, isRemoved: !isRemoved } : c));
      }catch{}
    });
  }

  return (
    <div className="space-y-6 text-sm">
      <div>
        <h3 className="font-semibold mb-2">Recent Posts</h3>
        <ul className="space-y-2">
          {pList.map(p=> (
            <li key={p.id} className="p-2 rounded bg-neutral-900 border border-white/10 flex items-center gap-2">
              <Link href={`/forum/${p.id}`} className="flex-1 hover:underline">
                {p.isRemoved ? '[removed]' : p.title}
              </Link>
              <span className="text-xs text-gray-500">{p._count?.comments ?? 0} comments</span>
              <button onClick={()=>togglePost(p.id, p.isRemoved)} className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10">
                {p.isRemoved ? 'Restore' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Recent Comments</h3>
        <ul className="space-y-2">
          {cList.map(c=> (
            <li key={c.id} className="p-2 rounded bg-neutral-900 border border-white/10 flex items-center gap-2">
              <Link href={`/forum/${c.postId}`} className="flex-1 hover:underline truncate">
                {(c.isRemoved ? '[removed]' : c.content)}
              </Link>
              <button onClick={()=>toggleComment(c.id, c.isRemoved)} className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10">
                {c.isRemoved ? 'Restore' : 'Remove'}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-xs text-gray-500">{pending ? 'Updating…' : null}</div>
    </div>
  );
}

