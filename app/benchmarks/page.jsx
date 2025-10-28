export const dynamic = "force-dynamic";
export const revalidate = 0;

import BenchmarkCenter from "@/app/components/BenchmarkCenter.jsx";

export default function Page() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Benchmark Center</h1>
        <p className="text-sm text-gray-400 mt-1">Submit your FPS/ping and explore live averages by game and GPU.</p>
      </div>
      <BenchmarkCenter />
      <div className="text-[11px] text-gray-500">Build: Benchmark v2025-10-27-1</div>
    </div>
  );
}
