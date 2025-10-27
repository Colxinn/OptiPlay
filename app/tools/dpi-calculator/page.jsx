"use client";
import { useEffect, useMemo, useState } from 'react';
import { suggestionsFor, edpi } from '../../../lib/dpi';

export default function DpiCalculator(){
  const [q,setQ]=useState("");
  const [mice,setMice]=useState([]);
  const [selected,setSelected]=useState(null);
  const [desired,setDesired]=useState(800);
  const [sens,setSens]=useState(1.0);

  useEffect(()=>{
    const ctrl=new AbortController();
    const url = q ? `/api/mice?q=${encodeURIComponent(q)}` : '/api/mice';
    fetch(url,{signal:ctrl.signal}).then(r=>r.json()).then(d=>setMice(d.mice||[])).catch(()=>{});
    return ()=>ctrl.abort();
  },[q]);

  useEffect(()=>{ if(mice.length && !selected) setSelected(mice[0]); },[mice,selected]);

  const sugg = useMemo(()=> selected ? suggestionsFor(desired, selected.sensor) : [], [selected, desired]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">DPI Calculator</h1>
      <p className="text-slate-300 mb-6">Pick your mouse to get sensor-accurate DPI suggestions that snap to supported steps and favor native resolutions.</p>

      <div className="grid gap-4">
        <label className="text-sm">Search Mouse
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Brand, model or sensor" className="w-full mt-1 bg-[#0b0b10] p-2 rounded border border-white/10" />
        </label>

        <label className="text-sm">Select Model
          <select className="w-full mt-1 bg-[#0b0b10] p-2 rounded border border-white/10" value={selected? `${selected.brand} ${selected.model}`:''} onChange={e=>{
            const v=e.target.value; const hit = mice.find(m=>`${m.brand} ${m.model}`===v); setSelected(hit||null);
          }}>
            {mice.map(m=> <option key={`${m.brand}-${m.model}`}>{`${m.brand} ${m.model}`}</option>)}
          </select>
        </label>

        {selected && (
          <div className="p-3 bg-[#06060a] rounded border border-white/10 text-sm text-slate-300">
            <div><span className="text-white">Sensor:</span> {selected.sensor.name}</div>
            <div><span className="text-white">Range:</span> {selected.sensor.minDpi} – {selected.sensor.maxDpi} DPI</div>
            <div><span className="text-white">Step:</span> {selected.sensor.step}-DPI increments</div>
            <div><span className="text-white">Native:</span> {selected.sensor.native.join(', ')}</div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Desired DPI
            <input type="number" value={desired} onChange={e=>setDesired(Number(e.target.value)||0)} className="w-full mt-1 bg-[#0b0b10] p-2 rounded border border-white/10" />
          </label>
          <label className="text-sm">In-game Sens (optional)
            <input type="number" step="0.001" value={sens} onChange={e=>setSens(Number(e.target.value)||0)} className="w-full mt-1 bg-[#0b0b10] p-2 rounded border border-white/10" />
          </label>
        </div>

        {selected && (
          <div className="p-3 bg-[#06060a] rounded border border-white/10">
            <div className="text-sm text-slate-400">Suggestions for {desired} DPI:</div>
            <div className="mt-2 grid gap-2">
              {sugg.map(s=> (
                <div key={s.dpi} className="flex items-center justify-between p-2 bg-[#0b0b10] rounded border border-white/10">
                  <div>
                    <div className="text-lg font-semibold">{s.dpi} DPI {s.isNative? <span className="ml-2 text-emerald-400 text-xs">native</span>:null}</div>
                    <div className="text-xs text-slate-400">Δ {s.delta>0?'+':''}{Math.round(s.delta)} from desired</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-300">eDPI: {edpi(s.dpi, sens)}</div>
                  </div>
                </div>
              ))}
              {sugg.length===0 && <div className="text-slate-400 text-sm">Enter a desired DPI within the sensor range.</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
