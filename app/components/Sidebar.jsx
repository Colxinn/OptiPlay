export default function Sidebar(){
  return (
    <div className="sticky top-6 bg-[#070707] border border-white/5 rounded-lg p-4">
      <h3 className="text-optiPurple-300 font-semibold mb-3">Filters</h3>
      <div className="space-y-3 text-sm text-slate-300">
        <div>
          <label className="block text-xs text-slate-400">Platform</label>
          <div className="mt-2 flex flex-col gap-2">
            {['Windows','macOS','Android','iOS'].map(p => (
              <label key={p} className="flex items-center gap-2"><input type="checkbox" className="accent-optiPurple-500" />{p}</label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
