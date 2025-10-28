'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div className="max-w-sm mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <button onClick={() => signIn('google')} className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600">Continue with Google</button>
    </div>
  );
}
