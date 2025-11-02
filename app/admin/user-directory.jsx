'use client';

import { useEffect, useMemo, useState } from 'react';
import OGBadge from '@/app/components/OGBadge.jsx';

const ET_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
});

function formatDate(iso) {
  if (!iso) return 'Never';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Never';
  return `${ET_FORMATTER.format(date)} ET`;
}

function summarizeLocation(logs = []) {
  if (!logs.length) return 'Unknown';
  const [latest] = logs;
  const parts = [latest.city, latest.region, latest.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Unknown';
}

function uniqueIps(logs = []) {
  const memo = new Map();
  logs.forEach((log) => {
    if (!memo.has(log.ipAddress)) memo.set(log.ipAddress, log);
  });
  return Array.from(memo.values());
}

function relativeMinutesFromNow(iso) {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const diff = target.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units = [
    { limit: 60 * 1000, divisor: 1000, unit: 'second' },
    { limit: 60 * 60 * 1000, divisor: 60 * 1000, unit: 'minute' },
    { limit: 24 * 60 * 60 * 1000, divisor: 60 * 60 * 1000, unit: 'hour' },
    { limit: 30 * 24 * 60 * 60 * 1000, divisor: 24 * 60 * 60 * 1000, unit: 'day' },
    { limit: 365 * 24 * 60 * 60 * 1000, divisor: 30 * 24 * 60 * 60 * 1000, unit: 'month' },
    { limit: Infinity, divisor: 365 * 24 * 60 * 60 * 1000, unit: 'year' },
  ];
  for (const { limit, divisor, unit } of units) {
    if (abs < limit) {
      const value = Math.round(diff / divisor);
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(value, unit);
    }
  }
  return null;
}

export default function AdminUserDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: 'all', ip: '' });
  const [expanded, setExpanded] = useState(null);

  function buildQuery(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.ip) query.set('ip', params.ip);
    return query.toString();
  }

  async function load(params = filters) {
    setLoading(true);
    setError('');
    try {
      const query = buildQuery(params);
      const res = await fetch(`/api/admin/users${query ? `?${query}` : ''}`, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to fetch users.');
      }
      setUsers(payload.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleMute(userId, user) {
    const next = !user.isMuted;
    let reason = '';
    let durationMinutes = null;
    if (next) {
      reason = window.prompt('Provide an optional mute reason:', '') || '';
      const durationInput = window.prompt(
        'Mute duration in minutes (leave blank for indefinite).',
        user.muteExpiresAt ? '60' : '1440'
      );
      if (durationInput === null) {
        return;
      }
      const parsed = Number(durationInput);
      if (durationInput.trim() !== '' && (!Number.isFinite(parsed) || parsed <= 0)) {
        alert('Provide a positive number of minutes or leave blank for indefinite mute.');
        return;
      }
      durationMinutes = durationInput.trim() === '' ? null : parsed;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mute: next, reason, durationMinutes }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Unable to update mute state.');
      }
      setUsers((prev) =>
        prev.map((record) =>
          record.id === userId
            ? {
                ...record,
                isMuted: next,
                mutedReason: payload.mutedReason ?? null,
                mutedAt: payload.mutedAt ?? null,
                mutedByEmail: payload.mutedByEmail ?? null,
                muteExpiresAt: payload.muteExpiresAt ?? null,
              }
            : record
        )
      );
    } catch (err) {
      alert(err.message || 'Unable to update mute state.');
    }
  }

  async function deleteUser(userId, user) {
    const confirmText = `DELETE ${user.name}`;
    const input = window.prompt(
      `⚠️ PERMANENT DELETE WARNING\n\nThis will permanently delete user "${user.name}" (${user.email}) and ALL their data:\n• Posts\n• Comments\n• Votes\n• Profile comments\n• Access logs\n\nType "${confirmText}" to confirm deletion:`,
      ''
    );

    if (input !== confirmText) {
      if (input) alert('Deletion cancelled. Text did not match.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, {
        method: 'DELETE',
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to delete user.');
      }
      
      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      alert(`✅ ${payload.message}`);
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  }

  async function exportCsv() {
    try {
      const query = buildQuery(filters);
      const res = await fetch(`/api/admin/users?format=csv${query ? `&${query}` : ''}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to export CSV.');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'optiplay-users.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to export CSV.');
    }
  }

  const totalMuted = useMemo(() => users.filter((user) => user.isMuted).length, [users]);

  return (
    <section className="rounded-xl border border-white/10 bg-neutral-900/70 p-4 shadow-lg">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">User Directory</h2>
          <p className="text-xs text-gray-400">
            {users.length} total users • {totalMuted} muted
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => load()}
            className="rounded-md border border-purple-400/40 px-3 py-1 text-purple-200 hover:bg-purple-500/10"
          >
            Refresh
          </button>
          <button
            onClick={exportCsv}
            className="rounded-md border border-sky-400/40 px-3 py-1 text-sky-200 hover:bg-sky-500/10"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 text-xs sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-gray-400">Search name/email</span>
          <input
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            onBlur={(e) => load({ ...filters, search: e.target.value })}
            placeholder="Search..."
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-gray-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-400">Status</span>
          <select
            value={filters.status}
            onChange={(e) => {
              const next = e.target.value;
              setFilters((prev) => {
                const updated = { ...prev, status: next };
                load(updated);
                return updated;
              });
            }}
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-gray-100"
          >
            <option value="all">All users</option>
            <option value="muted">Muted</option>
            <option value="active">Active</option>
            <option value="owners">Owners</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-gray-400">Filter by IP fragment</span>
          <input
            value={filters.ip}
            onChange={(e) => setFilters((prev) => ({ ...prev, ip: e.target.value }))}
            onBlur={(e) => load({ ...filters, ip: e.target.value })}
            placeholder="e.g. 192.168."
            className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-gray-100"
          />
        </label>
      </div>

      {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-gray-400">Loading users…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-xs text-gray-200">
            <thead className="uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Last Seen</th>
                <th className="px-3 py-2">IPs</th>
                <th className="px-3 py-2">Posts</th>
                <th className="px-3 py-2">Comments</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => {
                const ips = uniqueIps(user.accessLogs);
                return (
                  <tr key={user.id} className="bg-black/30 align-top">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="h-8 w-8 rounded-full border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-neutral-800 text-[10px] text-gray-400">
                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-purple-100">{user.name || '-'}</div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {user.isOwner ? <div className="text-[10px] uppercase text-purple-300">Owner</div> : null}
                            {user.isOG ? <OGBadge className="text-[9px] px-1 py-0.5" /> : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-gray-300">{user.email || '-'}</td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                            user.isMuted ? 'bg-amber-500/20 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'
                          }`}
                        >
                          {user.isMuted ? 'Muted' : 'Active'}
                        </span>
                        {user.mutedReason ? (
                          <div className="text-[10px] text-amber-200/80">Reason: {user.mutedReason}</div>
                        ) : null}
                        {user.mutedByEmail ? (
                          <div className="text-[10px] text-amber-200/60">By: {user.mutedByEmail}</div>
                        ) : null}
                        {user.muteExpiresAt ? (
                          <div className="text-[10px] text-amber-100/80">
                            Ends {relativeMinutesFromNow(user.muteExpiresAt)}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-300">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-2 text-[11px] text-gray-300">
                      <div>{formatDate(user.lastSeen)}</div>
                      <div className="text-[10px] text-gray-500">{summarizeLocation(user.accessLogs)}</div>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-gray-200">
                      {ips.length === 0 ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <ul className="space-y-1">
                          {ips.map((log) => (
                            <li key={log.id}>
                              <span className="font-mono text-[11px] text-purple-100">{log.ipAddress}</span>
                              <span className="ml-1 text-[10px] text-gray-500">
                                {[log.city, log.region, log.country].filter(Boolean).join(', ')}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-[11px] text-gray-200">{user.counts.posts}</td>
                    <td className="px-3 py-2 text-center text-[11px] text-gray-200">{user.counts.comments}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleMute(user.id, user)}
                        className={`w-full rounded-md border px-2 py-1 text-[11px] ${
                          user.isMuted
                            ? 'border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10'
                            : 'border-amber-400/40 text-amber-200 hover:bg-amber-500/10'
                        }`}
                      >
                        {user.isMuted ? 'Unmute' : 'Mute'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id, user)}
                        className="mt-2 w-full rounded-md border border-red-400/40 px-2 py-1 text-[11px] text-red-200 hover:bg-red-500/10"
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => setExpanded((prev) => (prev === user.id ? null : user.id))}
                        className="mt-2 w-full rounded-md border border-white/10 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
                      >
                        {expanded === user.id ? 'Hide audit trail' : 'View audit trail'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {users.map((user) =>
        expanded === user.id ? (
          <div key={`${user.id}-audit`} className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-gray-200">
            <h4 className="mb-2 font-semibold text-white">Mute audit trail</h4>
            {user.muteHistory?.length ? (
              <ul className="space-y-2">
                {user.muteHistory.map((entry) => (
                  <li key={entry.id} className="rounded-md border border-white/10 bg-black/30 p-2">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-300">
                      <span className="font-semibold text-purple-200">{entry.action}</span>
                      <span>{formatDate(entry.createdAt)}</span>
                      {entry.moderatorEmail ? <span>by {entry.moderatorEmail}</span> : null}
                      {entry.expiresAt ? <span>expires {formatDate(entry.expiresAt)}</span> : null}
                    </div>
                    {entry.reason ? <p className="mt-1 text-[11px] text-gray-300">Reason: {entry.reason}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-gray-400">No mute history recorded for this user.</p>
            )}
          </div>
        ) : null
      )}
    </section>
  );
}
