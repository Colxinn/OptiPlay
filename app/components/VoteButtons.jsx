'use client';

import { useState, useTransition } from 'react';

export default function VoteButtons({ postId, initialScore = 0 }) {
  const [score, setScore] = useState(initialScore);
  const [optimistic, start] = useTransition();

  async function vote(value) {
    start(async () => {
      try {
        const res = await fetch(`/api/forum/posts/${postId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        });
        const j = await res.json();
        if (res.ok) setScore(j.score ?? score);
      } catch {}
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button onClick={() => vote(1)} className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700">▲</button>
      <span className="w-8 text-center">{optimistic ? '…' : score}</span>
      <button onClick={() => vote(-1)} className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700">▼</button>
      <button onClick={() => vote(0)} className="px-2 py-1 rounded bg-neutral-900 border border-white/10">Clear</button>
    </div>
  );
}

