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
        <li>Ensure the OAuth redirect URI is added in Google Cloud:</li>
        <li>
          <code>https://optiplay-gamma-gamma.vercel.app/api/auth/callback/google</code>
        </li>
        <li>Try again or return to the <Link href="/" className="underline">home page</Link>.</li>
      </ul>
    </div>
  );
}
