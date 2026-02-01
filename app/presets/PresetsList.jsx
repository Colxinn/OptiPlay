'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PresetsList() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/presets')
      .then(res => res.json())
      .then(data => {
        setPresets(data.presets || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load presets:', err);
        setLoading(false);
      });
  }, []);

  const filteredPresets = filter === 'all' 
    ? presets 
    : presets.filter(p => p.target.includes(filter));

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading presets...</div>;
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          All Presets
        </button>
        <button
          onClick={() => setFilter('CS2')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'CS2'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          CS2
        </button>
        <button
          onClick={() => setFilter('Valorant')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'Valorant'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          Valorant
        </button>
        <button
          onClick={() => setFilter('Roblox')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'Roblox'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          Roblox
        </button>
        <button
          onClick={() => setFilter('Universal')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'Universal'
              ? 'bg-purple-600 text-white'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          Universal
        </button>
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPresets.map((preset, index) => (
          <Link
            key={preset.id}
            href={`/presets/${preset.id}`}
            className="group block p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/3 border border-white/10 hover:from-white/10 hover:to-white/5 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{preset.name}</h3>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRiskColor(preset.risk_level)} group-hover:scale-110 transition-transform`}>
                {preset.risk_level} Risk
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Target:</span>
                <div className="flex gap-2">
                  {preset.target.map(t => (
                    <span key={t} className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Hardware:</span>
                <div className="flex gap-2">
                  {preset.hardware_tier.map(h => (
                    <span key={h} className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div>
                  <div className="text-xs text-gray-400 mb-1">FPS Gain</div>
                  <div className="text-green-400 font-semibold">{preset.estimated_gain.fps}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Latency</div>
                  <div className="text-blue-400 font-semibold">{preset.estimated_gain.latency}</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 line-clamp-2">{preset.notes}</p>

            <div className="mt-4 flex items-center text-purple-400 group-hover:text-purple-300 text-sm font-semibold">
              View Details
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No presets found for this filter.
        </div>
      )}
    </>
  );
}
