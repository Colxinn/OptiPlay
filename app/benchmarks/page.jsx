export const dynamic = "force-dynamic";
export const revalidate = 0;

import BenchmarkCenter from "@/app/components/BenchmarkCenter.jsx";

export default function Page() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Advanced Benchmark Center</h1>
        <p className="mt-1 text-sm text-gray-400">
          Explore weighted CPU/GPU performance, filter by resolution, and compare real-world OptiPlay builds.
        </p>
      </div>
      <BenchmarkCenter />
      <div className="text-[11px] text-gray-500">Build: Benchmark v2025-10-31-adv</div>
    </div>
  );
}
