'use client';
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons({ session }) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : null}
        <span className={`text-sm ${session.user.isOwner ? "owner-text font-semibold" : "text-gray-300"}`}>
          {session.user.name || "Gamer"}
          {session.user.isOwner ? " • Owner" : ""}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-lg border border-white/15 bg-neutral-800 px-3 py-1 text-sm text-gray-200 transition hover:bg-neutral-700"
        >
          Sign out
        </button>
        <Link
          href="/profile"
          className="rounded-lg border border-purple-400/30 bg-purple-600/80 px-3 py-1 text-sm font-semibold text-white transition hover:bg-purple-500"
        >
          Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/signin"
        className="rounded-lg bg-purple-600 px-3 py-1 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
      >
        Sign in with Email
      </Link>
    </div>
  );
}
