export function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

export function nearestStep(value, step){
  if(step <= 1) return Math.round(value);
  return Math.round(value / step) * step;
}

export function suggestionsFor(desired, sensor){
  const { minDpi, maxDpi, step, native = [] } = sensor;
  const base = clamp(nearestStep(desired, step), minDpi, maxDpi);

  // Generate nearby candidates around desired within a reasonable window
  const window = Math.max(step * 5, 100);
  const candidates = new Set([base,
    clamp(base - step, minDpi, maxDpi),
    clamp(base + step, minDpi, maxDpi),
    clamp(nearestStep(desired - window, step), minDpi, maxDpi),
    clamp(nearestStep(desired + window, step), minDpi, maxDpi),
    ...native.map(n=>clamp(nearestStep(n, step), minDpi, maxDpi))
  ]);

  const scored = [...candidates].map(dpi=>{
    const dist = Math.abs(dpi - desired);
    const rel = desired > 0 ? dist / desired : dist;
    const isNative = native.includes(dpi);
    const score = rel + (isNative ? -0.05 : 0.05); // prefer native
    return { dpi, isNative, score, delta: dpi - desired };
  }).sort((a,b)=>a.score - b.score);

  // unique and sorted
  const seen = new Set();
  const top = [];
  for(const s of scored){ if(!seen.has(s.dpi)){ seen.add(s.dpi); top.push(s); }
    if(top.length >= 6) break; }
  return top;
}

export function edpi(dpi, sens){
  return Number((dpi * sens).toFixed(1));
}

