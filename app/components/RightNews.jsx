'use client';

import { useEffect, useState } from 'react';

const games = [
  { label: 'CS2', slug: 'cs2' },
  { label: 'Valorant', slug: 'valorant' },
  { label: 'Fortnite', slug: 'fortnite' },
  { label: 'SiegeX', slug: 'siegex' },
  { label: 'Roblox', slug: 'roblox' },
  { label: 'Minecraft', slug: 'minecraft' },
  { label: 'Rust', slug: 'rust' },
  { label: 'Apex', slug: 'apex' },
];

export default function RightNews(){
  const [slug, setSlug] = useState('cs2');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try{
        const r = await fetch(`/api/news/${slug}`);
        const j = await r.json();
        if(!cancelled) setItems(j.items || []);
      }catch{
        if(!cancelled) setItems([]);
      }finally{
        if(!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Latest News</h3>
        <div className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-200">Zoom</div>
      </div>
      <select value={slug} onChange={(e)=>setSlug(e.target.value)} className="mb-3 w-28 text-sm px-2 py-1 rounded bg-neutral-900 border border-white/10">
        {games.map(g => <option key={g.slug} value={g.slug}>{g.label}</option>)}
      </select>
      {loading ? <div className="text-sm text-gray-400">Loading…</div> : (
        <ul className="space-y-3">
          {items.slice(0,8).map((it,i) => (
            <li key={i} className="flex gap-3 items-start">
              {it.image ? <img src={it.image} alt="" className="w-12 h-12 rounded object-cover"/> : <div className="w-12 h-12 rounded bg-black/40"/>}
              <a href={it.url} target="_blank" rel="noreferrer" className="text-sm text-gray-200 hover:underline leading-snug">
                {it.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

