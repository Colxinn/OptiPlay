'use client';

import { useState } from 'react';

export default function AdminPollCreator() {
  const [question, setQuestion] = useState('What game are you playing today?');
  const [game, setGame] = useState('General');
  const [options, setOptions] = useState(['CS2', 'Valorant', 'Fortnite', 'Roblox']);
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0,16));
  const [endsAt, setEndsAt] = useState(() => new Date(Date.now()+24*60*60*1000).toISOString().slice(0,16));
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function updateOption(i, val){
    const copy = options.slice();
    copy[i] = val;
    setOptions(copy);
  }
  function addOption(){ setOptions([...options, '']); }
  function removeOption(i){ setOptions(options.filter((_,idx)=>idx!==i)); }

  async function submit(){
    setMsg('');
    const clean = options.map(o=>o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) { setMsg('Need a question and at least 2 options.'); return; }
    setLoading(true);
    try{
      const res = await fetch('/api/polls',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question, game, options: clean, startsAt, endsAt })
      });
      const j = await res.json();
      if(!res.ok) throw new Error(j.error||'Failed creating poll');
      setMsg('Poll created ✔');
    }catch(e){ setMsg(e.message); }
    finally{ setLoading(false); }
  }

  return (
    <div className="space-y-2 text-sm">
      {msg ? <div className="text-gray-300">{msg}</div> : null}
      <input className="w-full p-2 rounded bg-neutral-800 border border-white/10" value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Question" />
      <input className="w-full p-2 rounded bg-neutral-800 border border-white/10" value={game} onChange={e=>setGame(e.target.value)} placeholder="Game (optional)" />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-400">Starts
          <input type="datetime-local" className="w-full p-2 rounded bg-neutral-800 border border-white/10" value={startsAt} onChange={e=>setStartsAt(e.target.value)} />
        </label>
        <label className="text-xs text-gray-400">Ends
          <input type="datetime-local" className="w-full p-2 rounded bg-neutral-800 border border-white/10" value={endsAt} onChange={e=>setEndsAt(e.target.value)} />
        </label>
      </div>
      <div className="space-y-1">
        {options.map((opt,i)=> (
          <div key={i} className="flex gap-2 items-center">
            <input className="flex-1 p-2 rounded bg-neutral-800 border border-white/10" value={opt} onChange={e=>updateOption(i,e.target.value)} placeholder={`Option ${i+1}`} />
            <button onClick={()=>removeOption(i)} className="px-2 py-1 rounded bg-neutral-900 border border-white/10">X</button>
          </div>
        ))}
        <button onClick={addOption} className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10">+ Add option</button>
      </div>
      <button onClick={submit} disabled={loading} className="px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50">{loading? 'Creating…':'Create Poll'}</button>
    </div>
  );
}

