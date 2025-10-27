'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit() {
    setError('');
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to comment');
      }
      setContent('');
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 rounded-lg bg-neutral-900 border border-white/10">
      <h3 className="text-sm font-semibold mb-2">Add a comment</h3>
      {error ? <div className="text-xs text-red-400 mb-2">{error}</div> : null}
      <textarea
        className="w-full mb-2 p-2 bg-neutral-800 rounded-md border border-white/10 min-h-[80px]"
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={loading}
        className="px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Comment'}
      </button>
      <span className="ml-2 text-xs text-gray-400">Sign in required</span>
    </div>
  );
}

