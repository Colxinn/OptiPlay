import Link from 'next/link';

export default function ToolCard({ title, slug, desc, updated }){
  // Default to "2d" if not provided
  const updatedText = updated || '2d';
  
  return (
    <div className="bg-neutral-900 rounded-xl border border-white/10 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] animate-pop flex flex-col overflow-hidden">
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-white/10">Tool</div>
          <div className="text-xs text-gray-500">Free</div>
        </div>

        <div className="flex-1 mb-3">
          <h3 className="font-semibold text-base mb-2 line-clamp-1 break-words">{title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 break-words leading-relaxed">{desc}</p>
        </div>

        <div className="flex gap-2 items-center mt-auto">
          <Link href={slug} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm transition-colors font-medium">Open</Link>
          <Link href={slug} className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-sm transition-colors">Info</Link>
        </div>
      </div>
      
      {/* Bottom info panel */}
      <div className="px-4 py-2 bg-neutral-950/50 border-t border-white/5">
        <div className="text-xs text-gray-500">Updated {updatedText}</div>
      </div>
    </div>
  );
}


