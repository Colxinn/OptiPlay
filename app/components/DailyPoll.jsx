'use client';

import { useEffect, useState } from 'react';

export default function DailyPoll() {
  const [poll, setPoll] = useState(null);
  const [tallies, setTallies] = useState({});
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/polls/today', { cache: 'no-store' });
        const j = await r.json();
        if (!cancelled) {
          setPoll(j.poll || null);
          setTallies(j.tallies || {});
          setTotal(j.total || 0);
        }
      } catch {
        if (!cancelled) setError('Failed to load poll');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function vote(optionId) {
    if (!poll) return;
    setVoting(true);
    setError('');
    try {
      const r = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll.id, optionId }),
      });
      const j = await r.json();
      if (r.ok) {
        setTallies(j.tallies || {});
        setTotal(j.total || 0);
      } else if (r.status === 401) {
        setError('Please sign in to vote.');
      } else if (r.status === 409) {
        setError('You already voted in this poll.');
      } else {
        setError(j.error || 'Vote failed');
      }
    } catch {
      setError('Vote failed');
    } finally {
      setVoting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-neutral-900 rounded-xl p-4 mt-6">
        <h2 className="text-lg font-semibold text-purple-400 mb-2">Community Poll</h2>
        <div className="text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="bg-neutral-900 rounded-xl p-4 mt-6">
        <h2 className="text-lg font-semibold text-purple-400 mb-2">Community Poll</h2>
        <div className="text-sm text-gray-400">No active poll right now.</div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-xl p-4 mt-6">
      <h2 className="text-lg font-semibold text-purple-400 mb-2">{poll.question}</h2>
      {error ? <div className="text-sm text-red-400 mb-2">{error}</div> : null}
      <ul className="space-y-2">
        {poll.options.map((o) => {
          const count = tallies[o.id] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li key={o.id} className="p-2 rounded-md bg-neutral-800">
              <button
                onClick={() => vote(o.id)}
                disabled={voting}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span>{o.text}</span>
                  <span className="text-xs text-gray-400">{count} ({pct}%)</span>
                </div>
                <div className="mt-1 h-1.5 bg-neutral-900 rounded">
                  <div className="h-1.5 bg-purple-600 rounded" style={{ width: `${pct}%` }} />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="text-xs text-gray-500 mt-2">Total votes: {total}</div>
    </div>
  );
}
