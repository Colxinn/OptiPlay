import Link from "next/link";

const games = [
  { name: 'CS2', slug: 'cs2' },
  { name: 'Valorant', slug: 'valorant' },
  { name: 'Fortnite', slug: 'fortnite' },
  { name: 'SiegeX', slug: 'siegex' },
  { name: 'Roblox', slug: 'roblox' },
  { name: 'Minecraft', slug: 'minecraft' },
  { name: 'Rust', slug: 'rust' },
  { name: 'Apex', slug: 'apex' },
];

async function fetchFeed(slug) {
  const r = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/news/${slug}`, { cache: 'no-store' });
  const j = await r.json();
  return j.items || [];
}

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const feeds = await Promise.all(games.map(async (g) => ({
    game: g.name,
    items: await fetchFeed(g.slug),
  })));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">News</h1>
      {feeds.map(({ game, items }) => (
        <section key={game}>
          <h2 className="text-lg font-semibold text-purple-300 mb-3">{game}</h2>
          {items.length === 0 ? (
            <div className="text-sm text-gray-400">No items.</div>
          ) : (
            <ul className="grid md:grid-cols-2 gap-3">
              {items.slice(0, 8).map((it, i) => (
                <li key={i} className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex gap-3">
                  {it.image ? <img src={it.image} alt="" className="w-16 h-16 rounded" /> : null}
                  <div className="min-w-0">
                    <a href={it.url} target="_blank" rel="noreferrer" className="text-sm text-gray-200 hover:underline line-clamp-2">
                      {it.title}
                    </a>
                    {it.publishedAt ? (
                      <div className="text-[11px] text-gray-500 mt-1">{new Date(it.publishedAt).toLocaleString()}</div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

