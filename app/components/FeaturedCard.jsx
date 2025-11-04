'use client';

import { useEffect } from 'react';

export default function FeaturedCard() {
  const adsEnabled = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENABLED === 'true';
  const adSlotId = process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID;

  useEffect(() => {
    // Initialize AdSense ad after component mounts (only if ads enabled)
    if (adsEnabled && adSlotId && typeof window !== 'undefined') {
      try {
        // Push ad to adsbygoogle array to initialize it
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [adsEnabled, adSlotId]);

  return (
    <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
      <h3 className="font-semibold mb-3">Featured</h3>
      
      {adsEnabled && adSlotId ? (
        // Google AdSense Ad Unit
        <div className="rounded-lg overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-2863890623382272"
            data-ad-slot={adSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        // Placeholder when ads are disabled
        <div className="rounded-lg bg-black/40 border border-white/5 h-40 flex items-center justify-center text-xs text-gray-400">
          Ad / Spotlight
        </div>
      )}
      
      <p className="mt-3 text-xs text-gray-500">
        {adsEnabled 
          ? 'Sponsored content - Support OptiPlay' 
          : 'Sponsor or highlight a tool, guide, or partner here.'}
      </p>
    </div>
  );
}
