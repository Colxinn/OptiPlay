'use client';

import { useEffect } from 'react';

/**
 * In-article ad component for blog posts and news articles
 * Usage: <InArticleAd />
 */
export default function InArticleAd() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, []);

  const adsEnabled = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true';
  const inArticleSlotId = process.env.NEXT_PUBLIC_GOOGLE_ADS_IN_ARTICLE_SLOT_ID;

  if (!adsEnabled || !inArticleSlotId) {
    return null; // Don't show anything if ads disabled
  }

  return (
    <div className="my-8 flex flex-col items-center">
      <span className="text-xs text-gray-500 uppercase tracking-wide mb-2">Advertisement</span>
      <div className="w-full max-w-2xl">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-2863890623382272"
          data-ad-slot={inArticleSlotId}
        />
      </div>
    </div>
  );
}
