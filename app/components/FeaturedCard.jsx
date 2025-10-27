export default function FeaturedCard(){
  return (
    <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
      <h3 className="font-semibold mb-3">Featured</h3>
      <div className="rounded-lg bg-black/40 border border-white/5 h-40 flex items-center justify-center text-xs text-gray-400">
        Ad / Spotlight
      </div>
      <p className="mt-3 text-xs text-gray-500">Sponsor or highlight a tool, guide, or partner here.</p>
    </div>
  );
}

