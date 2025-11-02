"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { sanitizePublicImage } from "@/lib/imageValidation";
import OGBadge from "@/app/components/OGBadge.jsx";

function relativeTime(iso) {
  const date = new Date(iso);
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

function AuthorAvatar({ name, image }) {
  const safeSrc = useMemo(() => sanitizePublicImage(image), [image]);
  const initials = (name || "?").slice(0, 1).toUpperCase();
  if (safeSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeSrc}
        alt={name || "Forum author"}
        className="h-10 w-10 rounded-md border border-white/10 object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-sm font-semibold text-purple-200/80">
      {initials}
    </div>
  );
}

export default function ForumList({ posts: initialPosts, viewer }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const isOwner = viewer?.isOwner ?? false;

  async function deletePost(id) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/forum/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  async function togglePin(id, current) {
    await fetch(`/api/forum/posts/${id}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: !current }),
    });
    setPosts((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, isPinned: !current } : p))
        .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt.localeCompare(a.createdAt))
    );
    router.refresh();
  }

  async function toggleMute(userId, current) {
    if (!userId) return;
    const shouldMute = !current;
    let reason = "";
    let durationMinutes = null;
    if (shouldMute) {
      reason = window.prompt("Provide a short reason for the mute (optional):", "") || "";
      const durationInput = window.prompt(
        "Mute duration in minutes (leave blank for indefinite).",
        "1440"
      );
      if (durationInput === null) {
        return;
      }
      const parsed = Number(durationInput);
      if (durationInput.trim() !== "" && (!Number.isFinite(parsed) || parsed <= 0)) {
        alert("Please provide a positive number of minutes or leave blank for indefinite mute.");
        return;
      }
      durationMinutes = durationInput.trim() === "" ? null : parsed;
    }
    const res = await fetch(`/api/admin/users/${userId}/mute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mute: shouldMute, reason, durationMinutes }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(payload.error || "Unable to update mute status.");
      return;
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.author?.id === userId
          ? {
              ...post,
              author: {
                ...post.author,
                isMuted: shouldMute,
                muteExpiresAt: payload.muteExpiresAt || null,
              },
            }
          : post
      )
    );
    router.refresh();
  }

  if (!posts.length) {
    return <p className="text-sm text-gray-400">No threads yet. Be the first to post!</p>;
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => {
        const canDelete = isOwner || viewer?.id === post.author?.id;
        const attachmentImage = sanitizePublicImage(post.image);
        return (
          <li
            key={post.id}
            className={`rounded-xl border border-white/10 bg-neutral-900 p-4 ${
              post.isPinned ? "ring-2 ring-purple-500/60" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex w-full items-start gap-3">
                <AuthorAvatar name={post.author?.name} image={post.author?.image} />
                <div className="flex-1">
                  <Link href={`/forum/${post.id}`} className="text-lg font-semibold text-purple-100 hover:underline">
                    {post.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <Link
                      href={post.author?.name ? `/profile/${encodeURIComponent(post.author.name)}` : "#"}
                      className={`font-semibold ${post.author?.isOwner ? "owner-text" : "text-purple-200"} ${
                        post.author?.name ? "hover:underline" : ""
                      }`}
                    >
                      {post.author?.name || "Anon"}
                    </Link>
                    {post.author?.isOG && <OGBadge />}
                    <span>- {relativeTime(post.createdAt)}</span>
                    <span>- {post.commentCount} comments</span>
                    <span>- score {post.score}</span>
                    {post.isPinned ? (
                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-purple-200">
                        Pinned
                      </span>
                    ) : null}
                    {post.author?.isMuted ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                        <span>Muted</span>
                        <span className="normal-case text-[9px] text-amber-100/80">
                          {post.author.muteExpiresAt ? `ends ${relativeTime(post.author.muteExpiresAt)}` : "indefinite"}
                        </span>
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-gray-200">{post.content}</p>
                  {attachmentImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attachmentImage}
                      alt={`Attachment for ${post.title}`}
                      className="mt-3 max-h-56 w-full rounded-lg border border-white/10 object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                {isOwner ? (
                  <button
                    onClick={() => togglePin(post.id, post.isPinned)}
                    className="rounded-md border border-purple-400/40 px-2 py-1 text-purple-200 hover:bg-purple-500/10"
                  >
                    {post.isPinned ? "Unpin" : "Pin"}
                  </button>
                ) : null}
                {isOwner && post.author?.id ? (
                  <button
                    onClick={() => toggleMute(post.author.id, post.author.isMuted)}
                    className="rounded-md border border-amber-400/40 px-2 py-1 text-amber-200 hover:bg-amber-500/10"
                  >
                    {post.author.isMuted ? "Unmute" : "Mute"}
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    onClick={() => deletePost(post.id)}
                    className="rounded-md border border-red-400/40 px-2 py-1 text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
