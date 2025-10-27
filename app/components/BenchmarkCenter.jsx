"use client";

import { useEffect, useMemo, useState } from "react";
import CpsTester from "./CpsTester.jsx";

function Bar({ label, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="py-1">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="truncate pr-2">{label}</span>
        <span className="tabular-nums">{value} FPS</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded overflow-hidden mt-1">
        <div className="h-full bg-purple-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BenchmarkCenter() {
  const [game, setGame] = useState("");
  const [gpu, setGpu] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (game) qs.set("game", game);
      if (gpu) qs.set("gpu", gpu);
      const res = await fetch(`/api/benchmarks?${qs.toString()}`);
      const data = await res.json();
      if (data?.rows) setRows(data.rows);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [game, gpu]);

  const maxFps = useMemo(() => rows.reduce((m, r) => Math.max(m, r.avg_fps || 0), 0), [rows]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6">
      <section className="space-y-3">
        <div className="rounded-xl bg-neutral-900 border border-white/10 p-4">
          <div className="font-semibold">Filter</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input className="px-3 py-2 rounded bg-neutral-950 border border-white/10 text-sm" placeholder="Game filter" value={game} onChange={(e)=>setGame(e.target.value)} />
            <input className="px-3 py-2 rounded bg-neutral-950 border border-white/10 text-sm" placeholder="GPU filter" value={gpu} onChange={(e)=>setGpu(e.target.value)} />
          </div>
          <div className="text-[11px] text-gray-500 mt-2">Leave blank to see all.</div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl bg-neutral-900 border border-white/10 p-4">
          <div className="font-semibold">Average FPS by GPU {game ? `- ${game}` : ""}</div>
          {loading ? (
            <div className="text-sm text-gray-400 mt-2">Loading.</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-400 mt-2">No data yet.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {rows.map((r, i) => (
                <Bar key={i} label={`${r.gpu}`} value={r.avg_fps || 0} max={maxFps} />
              ))}
            </div>
          )}
        </div>

        {/* CPS Tester */}
        <CpsTester />
      </section>
    </div>
  );
}

