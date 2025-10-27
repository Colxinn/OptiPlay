'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get('error') || 'Unknown';
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sign-in Error</h1>
      <p className="text-sm text-gray-300">Reason: <span className="font-mono">{error}</span></p>
      <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
        <li>Ensure OAuth callback URLs are added in the provider console:</li>
        <li>
          Google: <code>https://optiplay-gamma.vercel.app/api/auth/callback/google</code>
        </li>
        <li>
          Discord: <code>https://optiplay-gamma.vercel.app/api/auth/callback/discord</code>
        </li>
        <li>Try again or return to the <Link href="/" className="underline">home page</Link>.</li>
      </ul>
    </div>
  );
}

