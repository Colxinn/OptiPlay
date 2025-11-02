'use client';

import { useState, useEffect } from 'react';

export default function VisitorStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [showList]);

  async function fetchStats() {
    try {
      const response = await fetch(`/api/visitors?list=${showList}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch visitor stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-neutral-900 border border-white/10 rounded-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
          <div className="h-20 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl">
          <div className="text-3xl font-bold text-purple-400">
            {stats.uniqueVisitors}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">
            Unique Visitors
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last {stats.maxCapacity}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
          <div className="text-3xl font-bold text-blue-400">
            {stats.totalVisits}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">
            Total Visits
          </div>
          <div className="text-xs text-gray-500 mt-1">
            All tracked IPs
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
          <div className="text-3xl font-bold text-green-400">
            {stats.percentFull}%
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">
            Capacity Used
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.uniqueVisitors}/{stats.maxCapacity}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl">
          <div className="text-3xl font-bold text-orange-400">
            {stats.totalVisits > 0 ? (stats.totalVisits / stats.uniqueVisitors).toFixed(1) : '0'}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">
            Avg Visits/User
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Return rate
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-neutral-900 border border-white/10 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Visitor Tracking Capacity</span>
          <span className="text-sm font-semibold text-purple-300">
            {stats.uniqueVisitors} / {stats.maxCapacity}
          </span>
        </div>
        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${stats.percentFull}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {stats.percentFull >= 100
            ? '⚠️ At capacity - oldest visitor will be removed when new one arrives'
            : `${stats.maxCapacity - stats.uniqueVisitors} slots remaining`}
        </div>
      </div>

      {/* Toggle Detailed View */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowList(!showList)}
          className="px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-sm font-semibold transition"
        >
          {showList ? 'Hide' : 'Show'} Detailed Visitor List
        </button>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-lg text-sm transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Top Countries */}
      {showList && stats.topCountries && (
        <div className="p-4 bg-neutral-900 border border-white/10 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Countries</h3>
          <div className="space-y-2">
            {stats.topCountries.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 text-center text-xs text-gray-500">#{idx + 1}</div>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{item.country}</span>
                  <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500/50 to-pink-500/50"
                      style={{ width: `${(item.count / stats.uniqueVisitors) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-400">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visitor List */}
      {showList && stats.visitors && (
        <div className="p-4 bg-neutral-900 border border-white/10 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Recent Visitors ({stats.visitors.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-xs text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="text-left py-2 px-3 text-xs text-gray-500 uppercase tracking-wide">First Seen</th>
                  <th className="text-left py-2 px-3 text-xs text-gray-500 uppercase tracking-wide">Last Seen</th>
                  <th className="text-right py-2 px-3 text-xs text-gray-500 uppercase tracking-wide">Visits</th>
                </tr>
              </thead>
              <tbody>
                {stats.visitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {visitor.country && (
                          <span className="text-lg" title={visitor.country}>
                            {getFlagEmoji(visitor.country)}
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-gray-300">
                            {visitor.city || 'Unknown City'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {visitor.country || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-gray-400">
                      {new Date(visitor.firstSeen).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-gray-400">
                      {formatTimeAgo(visitor.lastSeen)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-semibold">
                        {visitor.visitCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}
