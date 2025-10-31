"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function relativeTime(dateString) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const units = [
    { limit: 60 * 1000, divisor: 1000, unit: "second" },
    { limit: 60 * 60 * 1000, divisor: 60 * 1000, unit: "minute" },
    { limit: 24 * 60 * 60 * 1000, divisor: 60 * 60 * 1000, unit: "hour" },
    { limit: 30 * 24 * 60 * 60 * 1000, divisor: 24 * 60 * 60 * 1000, unit: "day" },
    { limit: 365 * 24 * 60 * 60 * 1000, divisor: 30 * 24 * 60 * 60 * 1000, unit: "month" },
    { limit: Infinity, divisor: 365 * 24 * 60 * 60 * 1000, unit: "year" },
  ];
  for (const { limit, divisor, unit } of units) {
    if (Math.abs(diff) < limit) {
      const value = Math.round(diff / divisor);
      const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return formatter.format(-value, unit);
    }
  }
  return "just now";
}

export default function ProfilePublicClient({ profile, comments: initialComments, viewer, accessLogs }) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [submitting, setSubmitting] = useState(false);

  const viewerId = viewer?.id ?? null;

  const recentComment = useMemo(() => {
    if (!viewerId) return null;
    return comments.find((c) => c.author.id === viewerId) || null;
  }, [comments, viewerId]);

  async function submitComment(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    if (!viewerId) {
      setError("You must be signed in to comment.");
      return;
    }
    const content = comment.trim();
    if (!content) {
      setError("Comment cannot be empty.");
      return;
    }
    if (content.length > 500) {
      setError("Comment must be 500 characters or fewer.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(profile.name)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || "Unable to post comment.");
      }
      setComments((prev) => [payload.comment, ...prev]);
      setComment("");
      setStatus("Comment posted.");
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6 shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-black/40">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.image} alt={`${profile.name} avatar`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-purple-200/40">No image</div>
            )}
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${profile.isOwner ? "owner-text" : "text-white"}`}>
              {profile.name}
            </h1>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-200">{profile.bio || "No bio yet."}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Wall</h2>
          {viewer?.name ? (
            <Link className="text-xs text-purple-200/70 underline hover:text-purple-100" href={`/profile/${encodeURIComponent(viewer.name)}`}>
              View my profile
            </Link>
          ) : null}
        </div>
        <form onSubmit={submitComment} className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={viewerId ? "Tell them something helpful (500 characters max)..." : "Sign in to leave a comment."}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white shadow-inner focus:border-purple-400 focus:outline-none disabled:opacity-60"
            disabled={!viewerId || submitting}
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{comment.length}/500 characters</span>
            {recentComment ? (
              <span>
                Last comment {relativeTime(recentComment.createdAt)} - rate limited to once every 30 minutes.
              </span>
            ) : (
              <span>Rate limited: one comment every 30 minutes.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={!viewerId || submitting}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </form>
        {status ? <p className="text-sm text-green-400">{status}</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-white/5 bg-black/40 p-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Link
                    href={comment.author.name ? `/profile/${encodeURIComponent(comment.author.name)}` : "#"}
                    className={`font-semibold ${comment.author.isOwner ? "owner-text" : "text-purple-100"} ${
                      comment.author.name ? "hover:underline" : ""
                    }`}
                  >
                    {comment.author.name || "Anon"}
                  </Link>
                  <span>- {relativeTime(comment.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-200">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {viewer?.isOwner ? (
        <section className="space-y-3 rounded-2xl border border-purple-400/30 bg-neutral-900/70 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-purple-100">Access Activity</h2>
            <p className="text-xs text-gray-400">Latest sign-ins</p>
          </div>
          {accessLogs.length === 0 ? (
            <p className="text-sm text-gray-400">No access logs captured yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
                <thead className="text-xs uppercase tracking-wide text-purple-200/70">
                  <tr>
                    <th className="py-2 pr-4">Last seen</th>
                    <th className="py-2 pr-4">IP address</th>
                    <th className="py-2 pr-4">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accessLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2 pr-4 text-xs text-gray-300">{relativeTime(log.lastSeen)}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-purple-100">{log.ipAddress}</td>
                      <td className="py-2 pr-4 text-xs text-gray-300">
                        {[log.city, log.region, log.country].filter(Boolean).join(", ") || "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      <button
        onClick={() => router.refresh()}
        className="text-xs text-purple-200/60 underline hover:text-purple-100"
      >
        Refresh
      </button>
    </div>
  );
}
