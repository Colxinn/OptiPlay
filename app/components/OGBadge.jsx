'use client';

/**
 * OG Badge - Shimmering yellow-orange badge for early adopters
 * Shows next to username for users who signed up Nov 2-26, 2025
 */
export default function OGBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded border border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-yellow-500/20 shimmer-og ${className}`}
      title="Original Gangster - Early Adopter (Nov 2-26, 2025)"
    >
      <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-shimmer-text">
        OG
      </span>
      
      <style jsx>{`
        .shimmer-og {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-og::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 200, 100, 0.3) 50%,
            transparent 70%
          );
          animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        
        @keyframes shimmer-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-shimmer-text {
          background-size: 200% auto;
          animation: shimmer-text 2s ease-in-out infinite;
        }
      `}</style>
    </span>
  );
}
