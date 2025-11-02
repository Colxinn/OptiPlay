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

// Enhanced GPU comparison using name matching
function matchGpuScore(userGpuName, reqGpuName) {
  if (!userGpuName || !reqGpuName) return 0;
  
  const user = userGpuName.toLowerCase();
  const req = reqGpuName.toLowerCase();
  
  // Extract GPU series/model numbers
  const extractNumber = (str) => {
    const match = str.match(/\d{3,4}/);
    return match ? parseInt(match[0]) : 0;
  };
  
  const userNum = extractNumber(user);
  const reqNum = extractNumber(req);
  
  // Check GPU brand
  const isNvidiaUser = user.includes('rtx') || user.includes('gtx') || user.includes('nvidia');
  const isAmdUser = user.includes('rx') || user.includes('radeon') || user.includes('amd');
  const isNvidiaReq = req.includes('rtx') || req.includes('gtx') || req.includes('nvidia');
  const isAmdReq = req.includes('rx') || req.includes('radeon') || req.includes('amd');
  
  // RTX is newer/better than GTX generally
  const userIsRtx = user.includes('rtx');
  const reqIsRtx = req.includes('rtx');
  const userIsGtx = user.includes('gtx');
  const reqIsGtx = req.includes('gtx');
  
  // Simple heuristic scoring
  if (userNum > reqNum + 500) return 3; // Much better
  if (userNum > reqNum + 200) return 2; // Better
  if (userNum >= reqNum) return 1; // Meets requirement
  if (userNum >= reqNum - 100) return 0.5; // Close
  
  // RTX generally better than GTX
  if (userIsRtx && reqIsGtx) return 2;
  if (userIsGtx && reqIsRtx && userNum > reqNum) return 1;
  
  return 0;
}

export default function PcChecker() {
  const [query, setQuery] = useState('Roblox');
  const [results, setResults] = useState([]);
  const [spec, setSpec] = useState({ gpu: '', cpu: '', ram: 8 });
  const [autoGpu, setAutoGpu] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const r = detectGpu();
    if (r) { 
      setAutoGpu(r); 
      if (!spec.gpu) setSpec((s)=>({...s, gpu: r})); 
    }
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
    let score = 0;
    let recommendations = [];
    
    // RAM scoring (max 2 points)
    const recRam = g.rec?.ram_gb || 16;
    const minRam = g.min?.ram_gb || 8;
    
    if (s.ram >= recRam) score += 2;
    else if (s.ram >= minRam) {
      score += 1;
      recommendations.push(`Upgrade to ${recRam}GB RAM for better performance`);
    } else if (s.ram >= minRam * 0.75) {
      score += 0.5;
      recommendations.push(`Upgrade to ${minRam}GB RAM (minimum required)`);
    } else {
      recommendations.push(`Critical: Need ${minRam}GB RAM to run this game`);
    }
    
    // GPU scoring (max 3 points for recommended, 1.5 for min)
    const recGpuScore = matchGpuScore(s.gpu, g.rec?.gpu);
    const minGpuScore = matchGpuScore(s.gpu, g.min?.gpu);
    
    if (recGpuScore >= 2) {
      score += 3; // Exceeds recommended
    } else if (recGpuScore >= 1) {
      score += 2.5; // Meets recommended
    } else if (minGpuScore >= 2) {
      score += 2; // Exceeds minimum
      recommendations.push(`Consider ${g.rec?.gpu || 'a better GPU'} for recommended settings`);
    } else if (minGpuScore >= 1) {
      score += 1.5; // Meets minimum
      recommendations.push(`Upgrade to ${g.rec?.gpu || 'a better GPU'} for smoother gameplay`);
    } else if (minGpuScore >= 0.5) {
      score += 1; // Close to minimum
      recommendations.push(`GPU slightly below minimum - consider ${g.min?.gpu || 'upgrading'}`);
    } else {
      recommendations.push(`Critical: Need ${g.min?.gpu || 'a better GPU'} to run this game`);
    }
    
    return { score: Math.min(score, 5), recommendations }; // Cap at 5
  }

  const graded = useMemo(() => results.map((g) => {
    const result = compare(g, spec);
    return { ...g, score: result.score, recommendations: result.recommendations };
  }), [results, spec]);

  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 p-4">
      <div className="flex items-center gap-2">
        <div className="font-semibold">Can My PC Run It?</div>
        <div className="ml-auto text-xs text-gray-400">GPU detected: {autoGpu || '—'}</div>
      </div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-[360px,1fr] gap-4">
        <div className="space-y-2">
          <input 
            className="w-full px-3 py-2 rounded bg-neutral-950 border border-white/10 text-sm" 
            placeholder="Search game... (e.g., Valorant, CS2, Fortnite)" 
            value={query} 
            onChange={(e)=>setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <div className="text-right">
            <button onClick={search} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm">
              Search
            </button>
          </div>
          <div className="rounded-lg bg-neutral-950 border border-white/10 p-3 space-y-2">
            <div className="font-semibold text-sm">Your Specs</div>
            <input 
              className="w-full px-3 py-2 rounded bg-neutral-900 border border-white/10 text-sm" 
              placeholder="GPU (e.g., RTX 3060, RX 6700 XT)" 
              value={spec.gpu} 
              onChange={(e)=>setSpec(s=>({...s,gpu:e.target.value}))} 
            />
            <input 
              className="w-full px-3 py-2 rounded bg-neutral-900 border border-white/10 text-sm" 
              placeholder="CPU (e.g., i5-12600K, Ryzen 5 5600X)" 
              value={spec.cpu} 
              onChange={(e)=>setSpec(s=>({...s,cpu:e.target.value}))} 
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">RAM (GB)</label>
              <input 
                type="number" 
                className="px-2 py-1 rounded bg-neutral-900 border border-white/10 text-sm w-24" 
                value={spec.ram} 
                onChange={(e)=>setSpec(s=>({...s,ram:Number(e.target.value)}))} 
              />
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-neutral-950 border border-white/10 p-3">
          <div className="font-semibold mb-2">
            Results {results.length > 0 && `(${results.length} ${results.length === 1 ? 'game' : 'games'})`}
          </div>
          {loading ? (
            <div className="text-sm text-gray-400 mt-2">Loading…</div>
          ) : results.length === 0 ? (
            <div className="text-sm text-gray-400 mt-2">
              No games found. Try searching for popular titles like Valorant, CS2, Fortnite, or Roblox.
            </div>
          ) : (
            <div className="mt-2 grid sm:grid-cols-2 gap-3">
              {graded.map((g, i) => (
                <div key={i} className="p-3 rounded border border-white/10 bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-sm">{g.title}</div>
                    <div className={`ml-auto text-[11px] px-2 py-0.5 rounded border whitespace-nowrap ${
                      g.score >= 4 ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40' :
                      g.score >= 2.5 ? 'bg-blue-900/40 text-blue-300 border-blue-700/40' :
                      g.score >= 1.5 ? 'bg-amber-900/30 text-amber-300 border-amber-700/30' :
                      'bg-red-900/30 text-red-300 border-red-700/30'
                    }`}>
                      {g.score >= 4 ? 'Excellent' :
                       g.score >= 2.5 ? 'Recommended' :
                       g.score >= 1.5 ? 'Playable' :
                       'Below Min'}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-gray-400">
                      <span className="font-medium">Min:</span> {g.min?.gpu || '—'} • {g.min?.ram_gb || '—'}GB RAM
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="font-medium">Rec:</span> {g.rec?.gpu || '—'} • {g.rec?.ram_gb || '—'}GB RAM
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-1">Suggested settings:</div>
                    <div className="text-xs text-gray-200">
                      {g.presets?.[g.score >= 4 ? 'high' : g.score >= 2.5 ? 'high' : g.score >= 1.5 ? 'mid' : 'low'] || 
                       g.presets?.mid || '—'}
                    </div>
                  </div>
                  
                  {/* Hardware Recommendations */}
                  {g.recommendations && g.recommendations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="text-xs font-medium text-purple-300 mb-1.5">💡 Recommendations:</div>
                      <ul className="space-y-1">
                        {g.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

