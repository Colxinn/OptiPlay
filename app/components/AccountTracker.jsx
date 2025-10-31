'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AccountTracker() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/account/track', {
        method: 'POST',
        cache: 'no-store',
      }).catch(() => {});
    }
  }, [status]);

  return null;
}
