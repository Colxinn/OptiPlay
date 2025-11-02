import Link from 'next/link';

export default function ToolCard({ title, slug, desc }){
  return (
    <div className="p-4 bg-neutral-900 rounded-xl border border-white/10 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] animate-pop">
      <div className="flex items-center justify-between">
        <div className="text-sm px-2 py-0.5 rounded bg-neutral-800 border border-white/10">Tool</div>
        <div className="text-[11px] text-gray-500">Free</div>
      </div>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{desc}</p>
      <div className="mt-3 flex gap-2">
        <Link href={slug} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm transition-colors">Open</Link>
        <Link href={slug} className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-sm transition-colors">Info</Link>
        <div className="ml-auto text-[11px] text-gray-500">Updated 2d</div>
      </div>
    </div>
  );
}
