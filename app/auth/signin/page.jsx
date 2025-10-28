'use client';

import { useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const allowed = useMemo(() => new Set([
    'gmail.com','googlemail.com','outlook.com','hotmail.com','live.com','msn.com','yahoo.com','ymail.com','icloud.com','me.com','proton.me','protonmail.com','aol.com','comcast.net'
  ]), []);
  function domainOf(e){ const i = e.lastIndexOf('@'); return i===-1?'':e.slice(i+1).toLowerCase(); }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setErr('');
          if (!email) return;
          const dom = domainOf(email);
          if (!allowed.has(dom)) {
            setErr('Please use a primary email provider (Gmail, Outlook, Yahoo, iCloud, Proton).');
            return;
          }
          await signIn('email', { email, callbackUrl: '/' });
        }}
        className="space-y-2"
      >
        <label className="block text-sm text-gray-300">Email for magic link</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/10"
        />
        <button
          type="submit"
          className="w-full px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-white/10"
        >
          Send magic link
        </button>
        {err ? <p className="text-xs text-red-400">{err}</p> : null}
      </form>
    </div>
  );
}
