'use client';
import { signIn, signOut } from "next-auth/react";

export default function AuthButtons({ session }) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" /> : null}
        <span className="text-sm text-gray-300">
          {session.user.name || 'Gamer'}{session.user.isOwner ? ' · Owner' : ''}
        </span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-white/10"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => signIn('google')}
        className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90"
      >
        Google
      </button>
    </div>
  );
}
