export const dynamic = "force-dynamic";
export const revalidate = 0;

import PcChecker from "@/app/components/PcChecker.jsx";

export default function Page() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Can My PC Run It?</h1>
        <p className="text-sm text-gray-400 mt-1">Pick a game, compare your specs, and get suggested settings. Uses curated data with optional external providers.</p>
      </div>
      <PcChecker />
      <div className="text-[11px] text-gray-500">Build: PC Checker v2025-10-27-1</div>
    </div>
  );
}

