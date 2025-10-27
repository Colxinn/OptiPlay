"use client";

import { useEffect, useMemo, useState } from "react";

function detectGpu() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return null;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return renderer || null;
  } catch { return null; }
}

export default function PcChecker() {
  const [query, setQuery] = useState('Roblox');
  const [results, setResults] = useState([]);
  const [spec, setSpec] = useState({ gpu: '', cpu: '', ram: 8 });
  const [autoGpu, setAutoGpu] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = detectGpu();
    if (r) { setAutoGpu(r); if (!spec.gpu) setSpec((s)=>({...s, gpu: r})); }
  }, []);

  async function search() {
    setLoading(true);
    try {
      const res = await fetch(`/api/requirements?q=${encodeURIComponent(query)}`);
      const js = await res.json();
      setResults(js.results || []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { search(); }, []);

  function compare(g, s) {
    // naive heuristic scoring using RAM only and GPU name contains
    let score = 0;
    if (s.ram >= (g.rec?.ram_gb || 8)) score += 2; else if (s.ram >= (g.min?.ram_gb || 4)) score += 1;
    const gpuName = (s.gpu || '').toLowerCase();
    if (g.rec?.gpu && gpuName.includes((g.rec.gpu.split('/')[0] || '').trim().toLowerCase())) score += 2;
    else if (g.min?.gpu && gpuName.includes((g.min.gpu.split('/')[0] || '').trim().toLowerCase())) score += 1;
    return score;
  }

  const graded = useMemo(() => results.map((g) => ({ ...g, score: compare(g, spec) })), [results, spec]);

  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 p-4">
      <div className="flex items-center gap-2">
        <div className="font-semibold">Can My PC Run It?</div>
        <div className="ml-auto text-xs text-gray-400">GPU detected: {autoGpu || '—'}</div>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-[360px,1fr] gap-4">
        <div className="space-y-2">
          <input className="w-full px-3 py-2 rounded bg-neutral-950 border border-white/10 text-sm" placeholder="Search game..." value={query} onChange={(e)=>setQuery(e.target.value)} />
          <div className="text-right"><button onClick={search} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm">Search</button></div>
          <div className="rounded-lg bg-neutral-950 border border-white/10 p-3 space-y-2">
            <div className="font-semibold text-sm">Your Specs</div>
            <input className="w-full px-3 py-2 rounded bg-neutral-900 border border-white/10 text-sm" placeholder="GPU (e.g., RTX 3060)" value={spec.gpu} onChange={(e)=>setSpec(s=>({...s,gpu:e.target.value}))} />
            <input className="w-full px-3 py-2 rounded bg-neutral-900 border border-white/10 text-sm" placeholder="CPU (optional)" value={spec.cpu} onChange={(e)=>setSpec(s=>({...s,cpu:e.target.value}))} />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">RAM (GB)</label>
              <input type="number" className="px-2 py-1 rounded bg-neutral-900 border border-white/10 text-sm w-24" value={spec.ram} onChange={(e)=>setSpec(s=>({...s,ram:Number(e.target.value)}))} />
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-neutral-950 border border-white/10 p-3">
          <div className="font-semibold">Results</div>
          {loading ? <div className="text-sm text-gray-400 mt-2">Loading…</div> : (
            <div className="mt-2 grid sm:grid-cols-2 gap-3">
              {graded.map((g, i) => (
                <div key={i} className="p-3 rounded border border-white/10 bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{g.title}</div>
                    <div className={`ml-auto text-[11px] px-2 py-0.5 rounded border ${g.score>=3?'bg-emerald-900/40 text-emerald-300 border-emerald-700/40':g.score===2?'bg-amber-900/30 text-amber-300 border-amber-700/30':'bg-red-900/30 text-red-300 border-red-700/30'}`}>{g.score>=3?'Recommended':g.score===2?'Playable':'Not ideal'}</div>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">Min: {g.min?.gpu || '—'} • {g.min?.ram_gb || '—'}GB RAM</div>
                  <div className="mt-1 text-xs text-gray-400">Rec: {g.rec?.gpu || '—'} • {g.rec?.ram_gb || '—'}GB RAM</div>
                  <div className="mt-2 text-sm">
                    <div className="text-gray-400">Suggested settings</div>
                    <div>{g.presets?.[g.score>=3?'high':g.score===2?'mid':'low'] || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

