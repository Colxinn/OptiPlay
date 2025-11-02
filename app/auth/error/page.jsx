'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get('error') || 'Unknown';
  const friendly = {
    EmailDomainNotAllowed: 'That email domain is not accepted. Please use a common provider (Gmail, Outlook, Yahoo, iCloud, Proton).',
    AccessDenied: 'Sign-in was denied. Please try a different email.',
  };
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Sign-in Error</h1>
      <p className="text-sm text-gray-300">Reason: <span className="font-mono">{friendly[error] || error}</span></p>
      <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
        <li>Use your primary email from a common provider.</li>
        <li>Return to the <Link href="/auth/signin" className="underline">sign-in page</Link> or go <Link href="/" className="underline">home</Link>.</li>
      </ul>
    </div>
  );
}
