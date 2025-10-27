"use client";

import { useEffect, useMemo, useState } from "react";

const REGION_COORDS = [
  { key: "NA-West", lon: -120, lat: 40 },
  { key: "NA-East", lon: -75, lat: 40 },
  { key: "SA", lon: -60, lat: -15 },
  { key: "EU-West", lon: -5, lat: 50 },
  { key: "EU-East", lon: 25, lat: 50 },
  { key: "Asia-NE", lon: 135, lat: 35 },
  { key: "Asia-SE", lon: 105, lat: 1 },
  { key: "Oceania", lon: 150, lat: -25 },
];

function project(lon, lat, w, h) {
  const x = ((lon + 180) * (w / 360));
  const y = ((90 - lat) * (h / 180));
  return { x, y };
}

function colorFor(ms) {
  if (ms == null) return "#666";
  if (ms <= 25) return "#22c55e"; // green
  if (ms <= 40) return "#a3e635"; // lime
  if (ms <= 60) return "#facc15"; // yellow
  if (ms <= 80) return "#f59e0b"; // orange
  return "#ef4444"; // red
}

export default function PingHeatmap({ height = 300 }) {
  const [game, setGame] = useState("Roblox");
  const [games, setGames] = useState(["Roblox"]);
  const [data, setData] = useState([]);
  const [active, setActive] = useState(null);
  const view = { w: 960, h: 480 };

  async function load(g) {
    try {
      const res = await fetch(`/api/ping?game=${encodeURIComponent(g || game)}`);
      const json = await res.json();
      setData(json.data || []);
      if (json.games) setGames(json.games);
    } catch {}
  }

  useEffect(() => { load(game); }, [game]);

  const byKey = useMemo(() => Object.fromEntries(data.map(d => [d.region, d])), [data]);

  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 p-4">
      <div className="flex items-center gap-2">
        <div className="font-semibold">Ping Heatmap</div>
        <select value={game} onChange={(e)=>setGame(e.target.value)} className="ml-auto bg-neutral-950 border border-white/10 rounded px-2 py-1 text-sm">
          {games.map((g)=>(<option key={g}>{g}</option>))}
        </select>
      </div>
      <div className="mt-3 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-4">
        <div className="rounded-lg bg-neutral-950 border border-white/10 overflow-hidden">
          <svg viewBox={`0 0 ${view.w} ${view.h}`} className="w-full" style={{ height }}>
            <rect width={view.w} height={view.h} className="fill-[#0a0a0f]" />
            {/* Minimal world silhouette (hand-tuned rough paths for continents) */}
            <g className="fill-neutral-800">
              <path d="M45,210 L120,180 L210,190 L260,210 L320,210 L360,195 L415,210 L455,200 L505,210 L525,240 L505,270 L450,290 L360,300 L280,280 L220,290 L150,280 L70,250 L45,230 Z" />
              <path d="M520,170 L560,155 L600,170 L630,185 L660,210 L645,230 L610,235 L580,220 L555,205 Z" />
              <path d="M350,150 L380,140 L410,150 L430,160 L410,170 L380,170 Z" />
              <path d="M700,240 L740,255 L760,275 L740,295 L700,300 L670,285 L675,260 Z" />
            </g>

            {/* Region dots */}
            {REGION_COORDS.map((r) => {
              const p = project(r.lon, r.lat, view.w, view.h);
              const d = byKey[r.key];
              const fill = colorFor(d?.avg_ping);
              return (
                <g
                  key={r.key}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onMouseEnter={()=>setActive(r.key)}
                  onMouseLeave={()=>setActive(null)}
                  onClick={()=>setActive(r.key)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Region ${r.key}`}
                  onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ setActive(r.key); } }}
                >
                  {/* Larger invisible hit area for easier hover/click */}
                  <circle cx={p.x} cy={p.y} r={22} fill="transparent" />
                  {/* Visible marker */}
                  <circle cx={p.x} cy={p.y} r={16} fill={fill} stroke="#111827" strokeWidth="2" />
                  <text x={p.x + 18} y={p.y + 6} className="fill-gray-300 text-[13px]">{r.key}</text>
                </g>
              );
            })}
          </svg>
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Legend:</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#22c55e'}}></span><span>≤25ms</span></span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#a3e635'}}></span><span>≤40ms</span></span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#facc15'}}></span><span>≤60ms</span></span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#f59e0b'}}></span><span>≤80ms</span></span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full" style={{background:'#ef4444'}}></span><span>80ms+</span></span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-neutral-950 border border-white/10 p-3">
          <div className="font-semibold">Region Details</div>
          {!active ? (
            <div className="text-sm text-gray-400 mt-2">Hover or click a region to see average ping and best time to play.</div>
          ) : (
            <div className="mt-2 text-sm">
              <div className="text-gray-400">Region</div>
              <div className="font-semibold">{active}</div>
              <div className="mt-2 text-gray-400">Average ping</div>
              <div className="font-semibold">{byKey[active]?.avg_ping != null ? `${byKey[active].avg_ping} ms` : 'No data'}</div>
              <div className="mt-2 text-gray-400">Best time to play</div>
              <div className="font-semibold">{byKey[active]?.best_hour_local != null ? `${byKey[active].best_hour_local}:00 – ${(byKey[active].best_hour_local+2)%24}:00` : '—'}</div>
              <div className="mt-2 text-gray-500 text-xs">Samples: {byKey[active]?.samples ?? 0}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
