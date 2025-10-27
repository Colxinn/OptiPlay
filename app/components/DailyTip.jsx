'use client';

import { useMemo } from 'react';

const tips = [
  'Try playing with friends for more fun!',
  'Lower your resolution scale slightly for smoother frames.',
  'Close background apps before launching your game.',
  'Use borderless windowed mode to alt-tab faster.',
  'Update GPU drivers regularly to avoid stutters.',
];

export default function DailyTip(){
  const tip = useMemo(() => {
    const day = Math.floor(Date.now() / (24*60*60*1000));
    return tips[day % tips.length];
  }, []);

  return (
    <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
      <h3 className="font-semibold mb-2">Daily Tip</h3>
      <p className="text-sm text-gray-300">{tip}</p>
    </div>
  );
}

