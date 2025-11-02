export const dynamic = "force-dynamic";
export const revalidate = 0;

import PingHeatmap from "@/app/components/PingHeatmap.jsx";

export default function Page() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Ping Heatmap</h1>
        <p className="text-sm text-gray-400 mt-1">
          Live latency overview powered by Cloudflare Radar metrics and Google Public DNS sampling.
        </p>
      </div>
      <PingHeatmap />
    </div>
  );
}
