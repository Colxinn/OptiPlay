import RobloxOptimizerGuide from "@/app/components/RobloxOptimizerGuide";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <div className="px-4 py-6">
      <RobloxOptimizerGuide />
      <div className="mt-6 text-[11px] text-gray-500">Build: RobloxOptimizerGuide v2025-10-30-1</div>
    </div>
  );
}
