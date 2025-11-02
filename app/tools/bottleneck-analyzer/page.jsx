'use client';

import { useState, useEffect } from 'react';

export default function BottleneckAnalyzer() {
  const [cpus, setCpus] = useState([]);
  const [gpus, setGpus] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCpu, setSelectedCpu] = useState('');
  const [selectedGpu, setSelectedGpu] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [ramAmount, setRamAmount] = useState('16');
  const [resolution, setResolution] = useState('R1080P');
  const [targetFps, setTargetFps] = useState('144');
  
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [cpuRes, gpuRes, gameRes] = await Promise.all([
          fetch('/api/benchmarks/cpus'),
          fetch('/api/benchmarks/gpus'),
          fetch('/api/benchmarks/games'),
        ]);
        
        const [cpuData, gpuData, gameData] = await Promise.all([
          cpuRes.json(),
          gpuRes.json(),
          gameRes.json(),
        ]);
        
        setCpus(cpuData.cpus || []);
        setGpus(gpuData.gpus || []);
        setGames(gameData.games || []);
      } catch (error) {
        console.error('Failed to load benchmark data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function analyze() {
    if (!selectedCpu || !selectedGpu || !selectedGame) {
      alert('Please select CPU, GPU, and Game');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/benchmarks/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpuSlug: selectedCpu,
          gpuSlug: selectedGpu,
          gameSlug: selectedGame,
          resolution,
          ramGb: parseInt(ramAmount),
          targetFps: parseInt(targetFps),
        }),
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  function getBottleneckColor(severity) {
    if (severity >= 80) return 'text-red-400';
    if (severity >= 50) return 'text-amber-400';
    return 'text-green-400';
  }

  function getBottleneckBg(severity) {
    if (severity >= 80) return 'bg-red-500/20 border-red-500/40';
    if (severity >= 50) return 'bg-amber-500/20 border-amber-500/40';
    return 'bg-green-500/20 border-green-500/40';
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">⚡ System Bottleneck Analyzer</h1>
        <div className="animate-pulse">
          <div className="h-32 bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">⚡ System Bottleneck Analyzer</h1>
        <p className="text-gray-300">
          Upload your specs → instantly see which component is limiting your FPS (CPU, GPU, or RAM).
        </p>
      </div>

      <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* CPU Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Processor (CPU)
            </label>
            <select
              value={selectedCpu}
              onChange={(e) => setSelectedCpu(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="">Select your CPU...</option>
              {cpus.map((cpu) => (
                <option key={cpu.slug} value={cpu.slug}>
                  {cpu.name}
                </option>
              ))}
            </select>
          </div>

          {/* GPU Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Graphics Card (GPU)
            </label>
            <select
              value={selectedGpu}
              onChange={(e) => setSelectedGpu(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="">Select your GPU...</option>
              {gpus.map((gpu) => (
                <option key={gpu.slug} value={gpu.slug}>
                  {gpu.name}
                </option>
              ))}
            </select>
          </div>

          {/* Game Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Game
            </label>
            <select
              value={selectedGame}
              onChange={(e) => setSelectedGame(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="">Select a game...</option>
              {games.map((game) => (
                <option key={game.slug} value={game.slug}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {/* RAM Amount */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              RAM Amount
            </label>
            <select
              value={ramAmount}
              onChange={(e) => setRamAmount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="8">8 GB</option>
              <option value="16">16 GB</option>
              <option value="32">32 GB</option>
              <option value="64">64 GB</option>
            </select>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Resolution
            </label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="R1080P">1080p (1920×1080)</option>
              <option value="R1440P">1440p (2560×1440)</option>
              <option value="R4K">4K (3840×2160)</option>
            </select>
          </div>

          {/* Target FPS */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300">
              Target FPS
            </label>
            <select
              value={targetFps}
              onChange={(e) => setTargetFps(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="60">60 FPS</option>
              <option value="144">144 FPS</option>
              <option value="240">240 FPS</option>
              <option value="360">360 FPS</option>
            </select>
          </div>
        </div>

        <button
          onClick={analyze}
          disabled={analyzing || !selectedCpu || !selectedGpu || !selectedGame}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-bold text-white shadow-lg transition hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? 'Analyzing...' : '⚡ Analyze System'}
        </button>
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Expected FPS */}
          <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-6">
            <div className="text-center">
              <div className="text-5xl font-black text-purple-300 mb-2">
                {analysis.expectedFps} FPS
              </div>
              <div className="text-sm text-gray-300">
                Expected performance in {analysis.gameName} at {analysis.resolutionName}
              </div>
              {analysis.expectedFps >= parseInt(targetFps) ? (
                <div className="mt-3 text-green-400 font-semibold">
                  ✓ Meets your {targetFps} FPS target!
                </div>
              ) : (
                <div className="mt-3 text-amber-400 font-semibold">
                  ⚠ Falls short of {targetFps} FPS target
                </div>
              )}
            </div>
          </div>

          {/* Bottleneck Analysis */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Component Analysis</h2>
            
            {/* GPU */}
            <div className={`rounded-xl border p-4 ${getBottleneckBg(analysis.bottlenecks.gpu)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg">🎮 Graphics Card (GPU)</div>
                <div className={`text-2xl font-black ${getBottleneckColor(analysis.bottlenecks.gpu)}`}>
                  {analysis.bottlenecks.gpu}%
                </div>
              </div>
              <div className="text-sm text-gray-300">{analysis.gpuName}</div>
              <div className="mt-2 text-sm">
                {analysis.bottlenecks.gpu >= 80 ? (
                  <span className="text-red-300">🔴 Major bottleneck - Consider upgrading your GPU</span>
                ) : analysis.bottlenecks.gpu >= 50 ? (
                  <span className="text-amber-300">🟡 Moderate limitation - GPU upgrade would help</span>
                ) : (
                  <span className="text-green-300">🟢 Performing well</span>
                )}
              </div>
            </div>

            {/* CPU */}
            <div className={`rounded-xl border p-4 ${getBottleneckBg(analysis.bottlenecks.cpu)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg">⚙️ Processor (CPU)</div>
                <div className={`text-2xl font-black ${getBottleneckColor(analysis.bottlenecks.cpu)}`}>
                  {analysis.bottlenecks.cpu}%
                </div>
              </div>
              <div className="text-sm text-gray-300">{analysis.cpuName}</div>
              <div className="mt-2 text-sm">
                {analysis.bottlenecks.cpu >= 80 ? (
                  <span className="text-red-300">🔴 Major bottleneck - Consider upgrading your CPU</span>
                ) : analysis.bottlenecks.cpu >= 50 ? (
                  <span className="text-amber-300">🟡 Moderate limitation - CPU upgrade would help</span>
                ) : (
                  <span className="text-green-300">🟢 Performing well</span>
                )}
              </div>
            </div>

            {/* RAM */}
            <div className={`rounded-xl border p-4 ${getBottleneckBg(analysis.bottlenecks.ram)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg">💾 Memory (RAM)</div>
                <div className={`text-2xl font-black ${getBottleneckColor(analysis.bottlenecks.ram)}`}>
                  {analysis.bottlenecks.ram}%
                </div>
              </div>
              <div className="text-sm text-gray-300">{ramAmount} GB RAM</div>
              <div className="mt-2 text-sm">
                {analysis.bottlenecks.ram >= 80 ? (
                  <span className="text-red-300">🔴 Insufficient RAM - Upgrade recommended</span>
                ) : analysis.bottlenecks.ram >= 50 ? (
                  <span className="text-amber-300">🟡 Adequate but could be better</span>
                ) : (
                  <span className="text-green-300">🟢 Sufficient for this game</span>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-6">
              <h3 className="text-lg font-bold mb-3">💡 Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-blue-400 mt-0.5">▸</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
