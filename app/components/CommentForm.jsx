'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CommentForm({ postId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flaggedReview, setFlaggedReview] = useState(null);
  const router = useRouter();
  const { data: session } = useSession();
  const isMuted = session?.user?.isMuted;
  const muteExpiresAt = session?.user?.muteExpiresAt;
  const isOwner = session?.user?.isOwner;

  async function submit(override = false) {
    setError('');
    setFlaggedReview(null);
    if (isMuted) {
      setError('You are muted and cannot reply right now.');
      return;
    }
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, override }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setFlaggedReview(j);
        setError(j.message || 'Comment flagged for review. Owners may override.');
        return;
      }
      if (!res.ok) {
        throw new Error(j.error || 'Failed to comment');
      }
      setContent('');
      setFlaggedReview(null);
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
        placeholder={isMuted ? 'Muted users cannot post replies.' : 'Share your thoughts...'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isMuted}
      />
      <button
        onClick={() => submit(false)}
        disabled={loading || isMuted}
        className="px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Comment'}
      </button>
      <span className="ml-2 text-xs text-gray-400">Sign in required</span>
      {isMuted ? (
        <p className="mt-2 text-xs text-amber-300">
          Muted users can continue browsing but cannot add comments.
          {muteExpiresAt
            ? ` Mute ends ${new Date(muteExpiresAt).toLocaleString()}.`
            : ' Mute is currently indefinite.'}{' '}
          Contact an owner if this is unexpected.
        </p>
      ) : null}
      {flaggedReview?.flagged ? (
        <div className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
          <p className="font-semibold text-amber-200">Comment flagged for review.</p>
          {flaggedReview.message ? <p className="mt-1">{flaggedReview.message}</p> : null}
          {typeof flaggedReview.score === 'number' ? (
            <p className="mt-1 text-amber-200/80">Toxicity score: {flaggedReview.score.toFixed(2)}</p>
          ) : null}
          {isOwner ? (
            <button
              onClick={() => submit(true)}
              disabled={loading}
              className="mt-2 inline-flex items-center rounded-md border border-amber-300/40 bg-amber-500/20 px-3 py-1 text-amber-50 hover:bg-amber-500/30 disabled:opacity-60"
            >
              {loading ? 'Posting...' : 'Override & Post'}
            </button>
          ) : (
            <p className="mt-2 text-amber-200/70">
              Reach out to an owner if this was flagged incorrectly.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
