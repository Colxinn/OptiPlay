
'use client'
import { useMemo, useState } from 'react';
const GAMES = ["CS2","Valorant","SiegeX","Fortnite","Roblox","Minecraft","Rust","Apex"];
const MULT = {"CS2":1.0,"Valorant":0.314,"SiegeX":0.5,"Fortnite":0.571428,"Roblox":1.2,"Minecraft":0.5,"Rust":0.8,"Apex":1.0};
export default function SenseConverter(){ const [from,setFrom]=useState('CS2'),[to,setTo]=useState('Valorant'),[sens,setSens]=useState(1.0);
  const result = useMemo(()=>{ const base=(sens/MULT[from]); return Number((base*MULT[to]).toFixed(4)); },[from,to,sens]);
  return (<div className="max-w-xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold mb-4">Sensitivity Converter</h1>
    <div className="grid gap-4">
      <label className="text-sm">From<select className="w-full mt-1 bg-[#0b0b10] p-2 rounded border border-white/10" value={from} onChange={e=>setFrom(e.target.value)}>{GAMES.map(g=><option key={g}>{g}</option>)}</select></label>
      <label className="text-sm">To<select className="w-full mt-1 bg-[#0b0b10] p-2 rounded border border-white/10" value={to} onChange={e=>setTo(e.target.value)}>{GAMES.map(g=><option key={g}>{g}</option>)}</select></label>
      <label className="text-sm">Your Sens in {from}<input type="number" step="0.001" className="w-full mt-1 bg-[#0b0b10] p-2 rounded border border-white/10" value={sens} onChange={e=>setSens(Number(e.target.value)||0)}/></label>
      <div className="p-3 bg-[#06060a] rounded border border-white/10"><div className="text-sm text-slate-400">Result for {to}:</div><div className="text-2xl font-bold mt-1">{result}</div></div>
    </div></div>) }
