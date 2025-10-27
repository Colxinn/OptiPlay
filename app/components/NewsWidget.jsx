'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const gameSlugs = [
  { name: 'CS2', slug: 'cs2' },
  { name: 'Valorant', slug: 'valorant' },
  { name: 'Fortnite', slug: 'fortnite' },
  { name: 'SiegeX', slug: 'siegex' },
  { name: 'Roblox', slug: 'roblox' },
  { name: 'Minecraft', slug: 'minecraft' },
  { name: 'Rust', slug: 'rust' },
  { name: 'Apex', slug: 'apex' },
];

export default function NewsWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await Promise.all(
          gameSlugs.map(async (g) => {
            const r = await fetch(`/api/news/${g.slug}`);
            const j = await r.json();
            return (j.items || []).slice(0, 1).map((it) => ({ ...it, game: g.name }));
          })
        );
        if (!cancelled) setItems(all.flat());
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-neutral-900 p-4 rounded-xl mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-purple-400">Latest News</h2>
        <Link href="/news" className="text-xs text-purple-300 hover:underline">See all</Link>
      </div>
      {loading ? (
        <div className="text-sm text-gray-400 mt-2">Loading…</div>
      ) : (
        <ul className="text-sm mt-2 space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-3">
              {it.image ? <img src={it.image} alt="" className="w-10 h-10 rounded" /> : null}
              <div className="min-w-0">
                <div className="text-gray-300 truncate">
                  <a href={it.url} target="_blank" rel="noreferrer" className="hover:underline">
                    [{it.game}] {it.title}
                  </a>
                </div>
                {it.publishedAt ? (
                  <div className="text-[11px] text-gray-500">{new Date(it.publishedAt).toLocaleString()}</div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

