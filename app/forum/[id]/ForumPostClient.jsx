"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import VoteButtons from "@/app/components/VoteButtons.jsx";
import CommentForm from "@/app/components/CommentForm.jsx";
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

const AVATAR_SIZES = {
  lg: "h-14 w-14",
  md: "h-10 w-10",
  sm: "h-8 w-8",
};

function AuthorAvatar({ name, image, size = "md" }) {
  const safeSrc = useMemo(() => sanitizePublicImage(image), [image]);
  const sizeClass = AVATAR_SIZES[size] || AVATAR_SIZES.md;
  const initials = (name || "?").slice(0, 2).toUpperCase();

  if (safeSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={safeSrc}
        alt={name || "Forum author"}
        className={`${sizeClass} rounded-md border border-white/10 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-xs font-semibold text-purple-200/90`}
    >
      {initials}
    </div>
  );
}

export default function ForumPostClient({ post, viewer }) {
  const [postState, setPostState] = useState(post);
  const isOwner = viewer?.isOwner ?? false;
  const attachmentImage = useMemo(() => sanitizePublicImage(postState.image), [postState.image]);

  useEffect(() => {
    setPostState(post);
  }, [post]);

  async function toggleMute(userId, current) {
    if (!isOwner || !userId) return;
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
    setPostState((prev) => ({
      ...prev,
      author:
        prev.author && prev.author.id === userId
          ? { ...prev.author, isMuted: shouldMute, muteExpiresAt: payload.muteExpiresAt || null }
          : prev.author,
      comments: prev.comments.map((comment) =>
        comment.author && comment.author.id === userId
          ? {
              ...comment,
              author: {
                ...comment.author,
                isMuted: shouldMute,
                muteExpiresAt: payload.muteExpiresAt || null,
              },
            }
          : comment
      ),
    }));
  }

  const headerBadges = useMemo(() => {
    const badges = [];
    if (postState.author?.isOwner) {
      badges.push(
        <span
          key="owner"
          className="rounded-full border border-purple-400/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-purple-200"
        >
          Owner
        </span>
      );
    }
    if (postState.author?.isMuted) {
      badges.push(
        <span
          key="muted"
          className="rounded-full border border-amber-400/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200"
        >
          Muted
          {postState.author.muteExpiresAt ? (
            <span className="ml-1 text-[9px] normal-case text-amber-100/70">
              ends {relativeTime(postState.author.muteExpiresAt)}
            </span>
          ) : (
            <span className="ml-1 text-[9px] normal-case text-amber-100/70">indefinite</span>
          )}
        </span>
      );
    }
    return badges;
  }, [postState.author]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-1 items-start gap-3">
            <AuthorAvatar
              name={postState.author?.name}
              image={postState.author?.image}
              size="lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {postState.isRemoved ? "[removed]" : postState.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span>Posted {relativeTime(postState.createdAt)}</span>
                {postState.author?.name ? (
                  <>
                    <Link
                      href={`/profile/${encodeURIComponent(postState.author.name)}`}
                      className={`font-semibold ${
                        postState.author?.isOwner ? "owner-text" : "text-purple-200"
                      } hover:underline`}
                    >
                      {postState.author.name}
                    </Link>
                    {postState.author?.isOG && <OGBadge />}
                  </>
                ) : (
                  <span className="font-semibold text-purple-200">Anon</span>
                )}
                {headerBadges}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <VoteButtons
              key={`vote-${postState.score}`}
              postId={postState.id}
              initialScore={postState.score}
            />
            {isOwner && postState.author?.id ? (
              <button
                onClick={() => toggleMute(postState.author.id, postState.author.isMuted)}
                className="rounded-md border border-amber-400/40 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/10"
              >
                {postState.author.isMuted ? "Unmute" : "Mute"}
              </button>
            ) : null}
          </div>
        </div>
        {postState.isRemoved ? (
          <p className="mt-4 text-sm text-gray-400 italic">
            This post has been removed by a moderator.
          </p>
        ) : (
          <>
            <p className="mt-4 whitespace-pre-wrap text-sm text-gray-200">
              {postState.content}
            </p>
            {attachmentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attachmentImage}
                alt={`Attachment for ${postState.title}`}
                className="mt-4 max-h-96 w-full rounded-lg border border-white/10 object-contain"
              />
            ) : null}
          </>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <CommentForm postId={postState.id} />
        <ul className="space-y-3">
          {postState.comments.length === 0 ? (
            <li className="rounded-lg border border-white/10 bg-neutral-900 p-4 text-sm text-gray-400">
              No comments yet.
            </li>
          ) : (
            postState.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border border-white/10 bg-neutral-900 p-4">
                <div className="flex gap-3">
                  <AuthorAvatar
                    name={comment.author?.name}
                    image={comment.author?.image}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {comment.author?.name ? (
                        <>
                          <Link
                            href={`/profile/${encodeURIComponent(comment.author.name)}`}
                            className={`font-semibold ${
                              comment.author?.isOwner ? "owner-text" : "text-purple-200"
                            } hover:underline`}
                          >
                            {comment.author.name}
                          </Link>
                          {comment.author?.isOG && <OGBadge />}
                        </>
                      ) : (
                        <span className="font-semibold text-purple-200">Anon</span>
                      )}
                      <span>- {relativeTime(comment.createdAt)}</span>
                      {comment.author?.isMuted ? (
                        <span className="rounded-full border border-amber-400/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-200">
                          Muted{" "}
                          <span className="ml-1 text-[9px] normal-case text-amber-100/70">
                            {comment.author.muteExpiresAt
                              ? `ends ${relativeTime(comment.author.muteExpiresAt)}`
                              : "indefinite"}
                          </span>
                        </span>
                      ) : null}
                      {isOwner && comment.author?.id ? (
                        <button
                          onClick={() => toggleMute(comment.author.id, comment.author.isMuted)}
                          className="rounded border border-amber-400/40 px-2 py-0.5 text-[10px] text-amber-200 hover:bg-amber-500/10"
                        >
                          {comment.author.isMuted ? "Unmute" : "Mute"}
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-200">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
