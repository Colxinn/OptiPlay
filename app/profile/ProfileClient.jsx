"use client";

import { useMemo, useState } from 'react';

function strengthInfo(pw) {
  const len = pw.length;
  const lower = /[a-z]/.test(pw);
  const upper = /[A-Z]/.test(pw);
  const num = /\d/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);
  let score = 0;
  if (len >= 8) score++;
  if (len >= 12) score++;
  if (lower && upper) score++;
  if (num || special) score++;
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const clamped = Math.max(0, Math.min(4, score));
  return { score: clamped, label: labels[clamped] };
}

export default function ProfileClient({ userEmail }) {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const { score, label } = useMemo(() => strengthInfo(pw), [pw]);
  const valid = pw.length >= 8 && (/[\d]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) && pw === pw2;

  async function save(e) {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await fetch('/api/account/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || 'Failed');
      setMsg('Password updated.');
      setPw(''); setPw2('');
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  const barColors = ['bg-red-600','bg-orange-500','bg-yellow-500','bg-lime-500','bg-green-600'];

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-gray-300">Signed in as <span className="font-mono">{userEmail}</span></p>
      </div>

      <form onSubmit={save} className="space-y-3">
        <label className="block text-sm text-gray-300">New password</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/10" />
        <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
          <div className={`h-2 ${barColors[score]} transition-all`} style={{ width: `${(score+1)*20}%` }} />
        </div>
        <p className="text-xs text-gray-400">Strength: {label}. Minimum 8 characters and include a number or special character.</p>

        <label className="block text-sm text-gray-300">Confirm password</label>
        <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 rounded-md bg-neutral-900 border border-white/10" />

        <button type="submit" disabled={!valid} className="w-full px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 border border-white/10">Save password</button>
        {msg ? <p className="text-sm text-green-500">{msg}</p> : null}
        {err ? <p className="text-sm text-red-500">{err}</p> : null}
      </form>
    </div>
  );
}

