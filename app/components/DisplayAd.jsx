'use client';

import { useEffect } from 'react';

/**
 * Display ad component for sidebars and between content
 * Usage: <DisplayAd slot="SLOT_ID" format="rectangle|horizontal|vertical" />
 */
export default function DisplayAd({ 
  slot, 
  format = 'auto',
  className = ''
}) {
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

  if (!adsEnabled || !slot) {
    return null;
  }

  const formatStyles = {
    auto: 'block',
    rectangle: 'inline-block',
    horizontal: 'block',
    vertical: 'block'
  };

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: formatStyles[format] || 'block' }}
        data-ad-client="ca-pub-2863890623382272"
        data-ad-slot={slot}
        data-ad-format={format === 'auto' ? 'auto' : format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
