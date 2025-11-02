'use client';

import { useState, useEffect } from 'react';
import { explainOdds } from '@/lib/oddsExplainer';

export default function EsportsPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const games = [
    { slug: 'all', name: 'All Games' },
    { slug: 'cs2', name: 'CS2' },
    { slug: 'valorant', name: 'Valorant' },
    { slug: 'league-of-legends', name: 'League of Legends' },
    { slug: 'dota-2', name: 'Dota 2' },
    { slug: 'rocket-league', name: 'Rocket League' },
    { slug: 'rainbow-six', name: 'Rainbow Six' }
  ];

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [selectedGame, selectedStatus]);

  async function fetchMatches() {
    try {
      const params = new URLSearchParams();
      if (selectedGame !== 'all') params.set('game', selectedGame);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);

      const response = await fetch(`/api/esports/live?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'live':
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold uppercase">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold uppercase">
            Upcoming
          </span>
        );
      case 'finished':
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded text-xs font-bold uppercase">
            Finished
          </span>
        );
      default:
        return null;
    }
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = date - now;
    
    if (diff < 0) {
      // Match already started
      const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
      const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
      return `Started ${hours > 0 ? `${hours}h ` : ''}${minutes}m ago`;
    } else {
      // Upcoming match
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours === 0) {
        return `Starts in ${minutes}m`;
      }
      return `Starts in ${hours}h ${minutes}m`;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Live Esports Scores
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Real-time scores and odds across all major esports titles
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-white/10 rounded text-sm hover:bg-neutral-800 transition"
          >
            {games.map(game => (
              <option key={game.slug} value={game.slug}>{game.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-white/10 rounded text-sm hover:bg-neutral-800 transition"
          >
            <option value="all">All Status</option>
            <option value="live">Live Only</option>
            <option value="upcoming">Upcoming</option>
            <option value="finished">Finished</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl">
          <div className="text-2xl font-bold text-red-400">
            {matches.filter(m => m.status === 'live').length}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Live Now</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
          <div className="text-2xl font-bold text-blue-400">
            {matches.filter(m => m.status === 'upcoming').length}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Upcoming</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl">
          <div className="text-2xl font-bold text-purple-400">
            {matches.length}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Total Matches</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
          <div className="text-2xl font-bold text-green-400">
            {new Set(matches.map(m => m.gameSlug)).size}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">Games Featured</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 mt-3">Loading matches...</p>
        </div>
      )}

      {/* Matches List */}
      {!loading && matches.length === 0 && (
        <div className="text-center py-12 bg-neutral-900/50 border border-white/10 rounded-xl">
          <p className="text-gray-400">No matches found for the selected filters</p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match) => {
            const team1Odds = explainOdds(match.team1.odds);
            const team2Odds = explainOdds(match.team2.odds);

            return (
              <div
                key={match.id}
                className="bg-gradient-to-br from-neutral-900 to-neutral-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition group"
              >
                {/* Tournament Header */}
                <div className="px-4 py-3 bg-black/30 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                      {match.game}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-300">{match.tournament}</span>
                  </div>
                  {getStatusBadge(match.status)}
                </div>

                {/* Match Content */}
                <div className="p-4 md:p-6">
                  <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                    {/* Team 1 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {match.team1.logo && (
                          <img
                            src={match.team1.logo}
                            alt={match.team1.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{match.team1.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold ${team1Odds.color}`}>
                              {team1Odds.formattedOdds}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">
                              {team1Odds.impliedProbability}% win
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs ${team1Odds.color} bg-black/20 p-2 rounded border border-white/5`}>
                        <div className="flex items-center gap-1.5">
                          <span>{team1Odds.icon}</span>
                          <span className="font-semibold">{team1Odds.confidence}</span>
                        </div>
                        <div className="text-gray-400 mt-0.5">{team1Odds.explanation}</div>
                      </div>
                    </div>

                    {/* Score/Time */}
                    <div className="text-center space-y-2">
                      {match.status === 'live' || match.status === 'finished' ? (
                        <>
                          <div className="flex items-center justify-center gap-4">
                            <span className="text-4xl font-bold">{match.team1.score}</span>
                            <span className="text-2xl text-gray-500">-</span>
                            <span className="text-4xl font-bold">{match.team2.score}</span>
                          </div>
                          {match.map && (
                            <div className="text-xs text-gray-400">
                              {match.map} {match.mapNumber > 0 && `(Map ${match.mapNumber})`}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">
                          {formatTime(match.startTime)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {match.format}
                      </div>
                      {match.streamUrl && (
                        <a
                          href={match.streamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded text-xs font-semibold transition"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                          </svg>
                          Watch Live
                        </a>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 md:flex-row-reverse md:text-right">
                        {match.team2.logo && (
                          <img
                            src={match.team2.logo}
                            alt={match.team2.name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{match.team2.name}</h3>
                          <div className="flex items-center gap-2 mt-1 md:justify-end">
                            <span className={`text-xs font-semibold ${team2Odds.color}`}>
                              {team2Odds.formattedOdds}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">
                              {team2Odds.impliedProbability}% win
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs ${team2Odds.color} bg-black/20 p-2 rounded border border-white/5 md:text-right`}>
                        <div className="flex items-center gap-1.5 md:justify-end">
                          <span>{team2Odds.icon}</span>
                          <span className="font-semibold">{team2Odds.confidence}</span>
                        </div>
                        <div className="text-gray-400 mt-0.5">{team2Odds.explanation}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">Understanding Odds</h3>
        <div className="text-xs text-gray-300 space-y-1">
          <p><strong className="text-emerald-400">Negative odds (e.g., -250):</strong> The team is favored to win. Higher negative number = stronger favorite.</p>
          <p><strong className="text-orange-400">Positive odds (e.g., +200):</strong> The team is the underdog. Higher positive number = bigger underdog.</p>
          <p className="text-gray-400 mt-2">Example: If Team A is -1000, they're an extremely heavy favorite expected to dominate.</p>
        </div>
      </div>
    </div>
  );
}
