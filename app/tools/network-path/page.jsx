'use client';

import { useState } from 'react';

export default function NetworkPath() {
  const [isTracing, setIsTracing] = useState(false);
  const [pathData, setPathData] = useState(null);

  // Simulated relay locations (in production, this would come from actual traceroute)
  const relayLocations = [
    { name: 'Your Location', lat: 0, lng: 0, ms: 0 },
    { name: 'Local ISP', lat: 10, lng: 15, ms: 5 },
    { name: 'Regional Hub', lat: 25, lng: 35, ms: 18 },
    { name: 'Internet Exchange', lat: 45, lng: 60, ms: 45 },
    { name: 'OptiPlay Relay', lat: 70, lng: 85, ms: 67 },
  ];

  const startTrace = async () => {
    setIsTracing(true);
    setPathData(null);

    // Simulate progressive trace
    for (let i = 1; i <= relayLocations.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setPathData({
        hops: relayLocations.slice(0, i),
        totalMs: relayLocations[i - 1].ms,
        hopCount: i,
      });
    }

    setIsTracing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🌍 Network Path Visualizer</h1>
          <p className="text-gray-400">Trace how your packets actually travel to OptiPlay servers.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visualization */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-8 relative" style={{ minHeight: '500px' }}>
              {/* World Map Background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 60" className="w-full h-full">
                  {/* Simplified continents */}
                  <path d="M10,20 L30,15 L35,25 L25,30 Z" fill="currentColor" opacity="0.3" />
                  <path d="M40,10 L60,8 L65,30 L50,35 Z" fill="currentColor" opacity="0.3" />
                  <path d="M70,15 L90,20 L85,40 L75,35 Z" fill="currentColor" opacity="0.3" />
                </svg>
              </div>

              {/* Path Visualization */}
              {pathData && (
                <svg viewBox="0 0 100 60" className="w-full h-full relative z-10">
                  {/* Draw paths between hops */}
                  {pathData.hops.map((hop, i) => {
                    if (i === 0) return null;
                    const prev = pathData.hops[i - 1];
                    return (
                      <line
                        key={i}
                        x1={prev.lng}
                        y1={prev.lat}
                        x2={hop.lng}
                        y2={hop.lat}
                        stroke="#a855f7"
                        strokeWidth="0.5"
                        strokeDasharray="1,1"
                        className="animate-pulse"
                      />
                    );
                  })}

                  {/* Draw hop points */}
                  {pathData.hops.map((hop, i) => (
                    <g key={i}>
                      <circle
                        cx={hop.lng}
                        cy={hop.lat}
                        r="2"
                        fill={i === pathData.hops.length - 1 ? '#22c55e' : '#a855f7'}
                        className="animate-pulse"
                      />
                      <circle
                        cx={hop.lng}
                        cy={hop.lat}
                        r="1.5"
                        fill="white"
                      />
                    </g>
                  ))}
                </svg>
              )}

              {/* Start State */}
              {!pathData && !isTracing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌐</div>
                    <p className="text-gray-400">Click "Start Trace" to visualize your network path</p>
                  </div>
                </div>
              )}

              {/* Tracing State */}
              {isTracing && !pathData && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4 animate-spin">🔄</div>
                    <p className="text-gray-400">Tracing route...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Control Button */}
            <button
              onClick={startTrace}
              disabled={isTracing}
              className="w-full mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-semibold"
            >
              {isTracing ? 'Tracing...' : 'Start Trace'}
            </button>
          </div>

          {/* Hop Details */}
          <div className="space-y-6">
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Path Details</h2>

              {pathData ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400">Total Hops</div>
                    <div className="text-2xl font-bold text-purple-400">{pathData.hopCount}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Total Latency</div>
                    <div className="text-2xl font-bold text-green-400">{pathData.totalMs}ms</div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-sm font-semibold mb-3">Hop List</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {pathData.hops.map((hop, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">
                            {i + 1}. {hop.name}
                          </span>
                          <span className="text-purple-400 font-mono">{hop.ms}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No trace data yet
                </div>
              )}
            </div>

            {/* Info */}
            <div className="rounded-xl bg-blue-900/20 border border-blue-500/30 p-4">
              <h3 className="font-semibold mb-2 text-blue-400">What is this?</h3>
              <p className="text-sm text-gray-300">
                This tool performs a simplified traceroute showing how your data packets travel from your device to OptiPlay servers. Each hop represents a router or network node along the path.
              </p>
            </div>

            {/* OptiPlay Link Marketing */}
            <div className="rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-4">
              <h3 className="font-semibold mb-2 text-purple-400">🔥 Coming Soon: OptiPlay Link</h3>
              <p className="text-sm text-gray-300">
                Get optimized routing that bypasses congested hops for lower latency in competitive games.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
