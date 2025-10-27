'use client';

import { useState } from 'react';

const games = [
  { label: 'All', value: '' },
  { label: 'CS2', value: 'cs2' },
  { label: 'Valorant', value: 'valorant' },
  { label: 'Fortnite', value: 'fortnite' },
  { label: 'SiegeX', value: 'siegex' },
  { label: 'Roblox', value: 'roblox' },
  { label: 'Minecraft', value: 'minecraft' },
  { label: 'Rust', value: 'rust' },
  { label: 'Apex', value: 'apex' },
];

export default function AdminNewsRefresh(){
  const [game, setGame] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function refresh(){
    setLoading(true); setMsg('');
    try{
      const res = await fetch('/api/news/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setMsg('Cache cleared. The next request will refetch feeds.');
    }catch(e){ setMsg(e.message); }
    finally{ setLoading(false); }
  }

  return (
    <div className="text-sm space-y-2">
      <div className="flex gap-2 items-center">
        <select value={game} onChange={(e)=>setGame(e.target.value)} className="px-2 py-1 rounded bg-neutral-900 border border-white/10">
          {games.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <button onClick={refresh} disabled={loading} className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10">{loading? 'Working…':'Refresh News Feeds'}</button>
      </div>
      {msg ? <div className="text-gray-400">{msg}</div> : null}
    </div>
  );
}

