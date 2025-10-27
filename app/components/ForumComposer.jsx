'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForumComposer() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit() {
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Please provide a title and content.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to create');
      }
      setTitle('');
      setContent('');
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
      <h2 className="text-lg font-semibold mb-2">Start a thread</h2>
      {error ? <div className="text-sm text-red-400 mb-2">{error}</div> : null}
      <input
        className="w-full mb-2 p-2 bg-neutral-800 rounded-md border border-white/10"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full mb-3 p-2 bg-neutral-800 rounded-md border border-white/10 min-h-[120px]"
        placeholder="Write your post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
      <span className="ml-2 text-xs text-gray-400">Sign in required</span>
    </div>
  );
}

