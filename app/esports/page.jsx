export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getGameNews } from "@/lib/news";

export default async function Page() {
  const games = ["cs2", "valorant", "fortnite", "apex", "roblox", "minecraft", "rust", "siegex"];
  const lists = await Promise.all(games.map((g) => getGameNews(g, 8)));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Live Esports</h1>
        <p className="text-sm text-gray-400 mt-1">Fresh headlines and updates from top esports titles.</p>
      </div>
      {lists.map((items, idx) => (
        <section key={games[idx]} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="font-semibold uppercase text-xs tracking-wide text-gray-300">{games[idx]}</div>
            <a href={`/news?game=${games[idx]}`} className="ml-auto text-xs text-purple-300">More</a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {items.map((it, i) => (
              <a key={i} href={it.url} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-neutral-900 border border-white/10 hover:bg-neutral-800">
                {it.image ? <img src={it.image} alt="" className="w-full h-28 object-cover rounded" /> : null}
                <div className="mt-2 text-sm font-medium line-clamp-3">{it.title}</div>
                <div className="text-[11px] text-gray-500 mt-1">{it.publishedAt ? new Date(it.publishedAt).toLocaleString() : ''}</div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

