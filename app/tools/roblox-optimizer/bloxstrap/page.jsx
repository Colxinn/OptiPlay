import BloxstrapGuide from "@/app/components/BloxstrapGuide.jsx";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function BloxstrapPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      <BloxstrapGuide />
      <a
        href="/tools/roblox-optimizer"
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-purple-200 hover:bg-neutral-800 transition-colors"
      >
        Back to Roblox Optimizer
      </a>
    </div>
  );
}
