'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function OGWelcomeBanner() {
  const { data: session } = useSession();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user just got OG status and hasn't seen the banner yet
    const hasSeenBanner = sessionStorage.getItem('og_banner_seen');
    if (session?.user?.isOG && !hasSeenBanner && !dismissed) {
      setShow(true);
    }
  }, [session, dismissed]);

  const handleDismiss = () => {
    sessionStorage.setItem('og_banner_seen', 'true');
    setShow(false);
    setDismissed(true);
  };

  if (!show || !session?.user?.isOG) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-2xl w-full rounded-2xl bg-gradient-to-br from-[#0f0b1c] via-[#1a0f2e] to-[#0f0b1c] border border-amber-500/30 shadow-2xl shadow-amber-500/20 overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 animate-pulse" />
        
        {/* Content */}
        <div className="relative p-8 md:p-12">
          {/* Icon/Badge */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 flex items-center justify-center text-4xl font-black text-white shadow-lg">
                OG
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Welcome, Original Gangster! 🔥
          </h2>

          {/* Message */}
          <div className="space-y-4 text-center text-gray-200">
            <p className="text-lg md:text-xl font-medium">
              You've joined OptiPlay during our exclusive early adopter period!
            </p>
            
            <div className="bg-white/5 border border-amber-500/20 rounded-xl p-6 space-y-3">
              <p className="text-amber-300 font-semibold text-lg">
                ✨ Your OG Benefits (Forever)
              </p>
              <ul className="text-left space-y-2 text-sm md:text-base">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl">•</span>
                  <span><strong className="text-amber-200">Exclusive OG Badge</strong> - Your shimmering badge shows you were here from the start</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 text-xl">•</span>
                  <span><strong className="text-orange-200">Lifetime Premium Features</strong> - All future paid features unlocked for free, forever</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">•</span>
                  <span><strong className="text-yellow-200">Priority Support</strong> - Your feedback shapes the future of OptiPlay</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 text-xl">•</span>
                  <span><strong className="text-amber-200">Early Access</strong> - Be the first to test new features before anyone else</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-400 pt-2">
              This offer ends <strong className="text-amber-300">November 26, 2025</strong>. You're locked in forever! 🎉
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="mt-8 w-full bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 hover:from-amber-500 hover:via-orange-500 hover:to-yellow-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
          >
            Let's Go! 🚀
          </button>

          {/* Small print */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Your OG status is permanent and will never expire
          </p>
        </div>
      </div>
    </div>
  );
}
