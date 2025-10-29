'use client';

import { useEffect } from 'react';

// Route-level error boundary for the App Router.
// Shows a clear error with a retry button instead of a generic 500.
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to Vercel function logs for debugging
    // The full stack is available in logs, not shown to end users.
    console.error('[AppRouteError]', error);
  }, [error]);

  const message = error?.message || 'An unexpected error occurred.';

  return (
    <div className="max-w-xl mx-auto p-6 rounded-lg border border-white/10 bg-black/30">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-300 mb-4">
        {message}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-white/10"
        >
          Try again
        </button>
        <a href="/api/health" className="text-sm underline text-gray-300">Check service health</a>
      </div>
    </div>
  );
}

