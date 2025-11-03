'use client';

import { useState, useEffect } from 'react';

export default function ProConfigBrowser({ game = 'cs2' }) {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(game);
  const [search, setSearch] = useState('');
  const [votingStates, setVotingStates] = useState({}); // Track voting/error states

  useEffect(() => {
    fetchConfigs();
  }, [filter]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        game: filter,
        limit: '50',
        sort: 'popularity',
        checkVotes: 'true', // Request user vote status
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const res = await fetch(`/api/pro-configs?${params}`);
      const data = await res.json();
      setConfigs(data.data || []);
    } catch (err) {
      console.error('Failed to fetch configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchConfigs();
  };

  const handleVote = async (id, vote) => {
    // Prevent multiple simultaneous votes
    if (votingStates[id]?.voting) return;
    
    setVotingStates(prev => ({
      ...prev,
      [id]: { voting: true, error: null }
    }));
    
    try {
      const res = await fetch('/api/pro-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, vote }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Vote failed');
      }
      
      if (data.success) {
        // Update config with new vote count and user's vote
        setConfigs(configs.map(c => 
          c.id === id 
            ? { ...c, votes: data.votes, userVote: data.newVote || vote } 
            : c
        ));
        
        setVotingStates(prev => ({
          ...prev,
          [id]: { voting: false, error: null }
        }));
      } else if (data.alreadyVoted) {
        // User already voted
        setVotingStates(prev => ({
          ...prev,
          [id]: { voting: false, error: 'Already voted' }
        }));
        
        // Clear error after 2 seconds
        setTimeout(() => {
          setVotingStates(prev => ({
            ...prev,
            [id]: { voting: false, error: null }
          }));
        }, 2000);
      }
    } catch (err) {
      console.error('Vote failed:', err);
      setVotingStates(prev => ({
        ...prev,
        [id]: { voting: false, error: err.message }
      }));
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setVotingStates(prev => ({
          ...prev,
          [id]: { voting: false, error: null }
        }));
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('cs2')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'cs2'
                  ? 'bg-purple-700 text-white'
                  : 'bg-neutral-800 border border-white/10 text-gray-300 hover:bg-neutral-700'
              }`}
            >
              CS2
            </button>
            <button
              onClick={() => setFilter('valorant')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'valorant'
                  ? 'bg-purple-700 text-white'
                  : 'bg-neutral-800 border border-white/10 text-gray-300 hover:bg-neutral-700'
              }`}
            >
              Valorant
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 flex-1 md:max-w-md">
            <input
              type="text"
              placeholder="Search player..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg font-medium transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Configs Grid */}
      {configs.length === 0 ? (
        <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-12 text-center">
          <p className="text-gray-400 mb-4">
            No configs found. Run the seeder to populate the database:
          </p>
          <code className="bg-neutral-900 border border-white/10 px-4 py-2 rounded text-purple-300 text-sm">
            npm run fetch:proconfigs
          </code>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map((config) => (
            <ProConfigCard 
              key={config.id} 
              config={config} 
              onVote={handleVote}
              votingState={votingStates[config.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProConfigCard({ config, onVote, votingState = {} }) {
  const [copied, setCopied] = useState(false);
  const { voting, error } = votingState;

  const copySettings = () => {
    const text = formatConfigForCopy(config.normalized);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatConfigForCopy = (normalized) => {
    const lines = [];
    
    if (normalized.sensitivity) {
      lines.push(`DPI: ${normalized.sensitivity.dpi}`);
      lines.push(`Sensitivity: ${normalized.sensitivity.ingame}`);
      if (normalized.sensitivity.cmPer360) {
        lines.push(`cm/360: ${normalized.sensitivity.cmPer360}`);
      }
    }
    
    if (normalized.crosshair) {
      lines.push('');
      lines.push('Crosshair:');
      Object.entries(normalized.crosshair).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          lines.push(`  ${key}: ${value}`);
        }
      });
    }
    
    return lines.join('\n');
  };

  const normalized = config.normalized || {};
  const crosshair = normalized.crosshair || {};
  const sensitivity = normalized.sensitivity || {};

  return (
    <div className="bg-neutral-900 rounded-xl border border-white/10 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden">
      {/* Main Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Header with voting */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-white/10">
                {config.game.toUpperCase()}
              </div>
              {config.team && (
                <div className="text-xs text-gray-500">{config.team}</div>
              )}
            </div>
            <h3 className="font-semibold text-lg text-white">{config.name}</h3>
          </div>
          
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1 ml-2">
            <button
              onClick={() => onVote(config.id, 1)}
              disabled={voting}
              className={`transition text-sm ${
                config.userVote === 1 
                  ? 'text-green-400' 
                  : 'text-gray-400 hover:text-green-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={config.userVote === 1 ? 'You upvoted this' : 'Upvote'}
            >
              ▲
            </button>
            <span className="text-sm font-medium text-purple-300">
              {config.votes}
            </span>
            <button
              onClick={() => onVote(config.id, -1)}
              disabled={voting}
              className={`transition text-sm ${
                config.userVote === -1 
                  ? 'text-red-400' 
                  : 'text-gray-400 hover:text-red-400'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={config.userVote === -1 ? 'You downvoted this' : 'Downvote'}
            >
              ▼
            </button>
            {error && (
              <div className="text-xs text-red-400 mt-1 text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Sensitivity */}
        {sensitivity.dpi && (
          <div className="mb-3 p-3 bg-neutral-950/50 rounded-lg border border-white/5">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Sensitivity</div>
            <div className="text-sm text-white font-mono">
              <span className="text-purple-300">{sensitivity.dpi}</span>
              <span className="text-gray-500"> DPI × </span>
              <span className="text-purple-300">{sensitivity.ingame}</span>
              {sensitivity.cmPer360 && (
                <>
                  <span className="text-gray-500"> = </span>
                  <span className="text-purple-400 font-semibold">{sensitivity.cmPer360} cm/360°</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Crosshair Preview */}
        {crosshair.color && (
          <div className="mb-3 p-3 bg-neutral-950/50 rounded-lg border border-white/5">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Crosshair</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {crosshair.color && (
                <div className="text-gray-400">
                  Color: <span className="font-mono text-white">{crosshair.color}</span>
                </div>
              )}
              {crosshair.size !== undefined && (
                <div className="text-gray-400">
                  Size: <span className="font-mono text-white">{crosshair.size}</span>
                </div>
              )}
              {crosshair.gap !== undefined && (
                <div className="text-gray-400">
                  Gap: <span className="font-mono text-white">{crosshair.gap}</span>
                </div>
              )}
              {crosshair.thickness && (
                <div className="text-gray-400">
                  Thickness: <span className="font-mono text-white">{crosshair.thickness}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={copySettings}
            className="flex-1 px-3 py-2 bg-purple-700 hover:bg-purple-600 rounded-lg text-sm font-medium transition"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <a
            href={config.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10 rounded-lg text-sm font-medium transition"
          >
            🔗
          </a>
        </div>
      </div>

      {/* Bottom info panel */}
      <div className="px-4 py-2 bg-neutral-950/50 border-t border-white/5">
        <div className="text-xs text-gray-500">via {config.sourceName}</div>
      </div>
    </div>
  );
}
