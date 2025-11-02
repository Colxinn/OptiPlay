'use client';

import { useState, useEffect } from 'react';

export default function OptiScore() {
  const [scores, setScores] = useState({
    reaction: null,
    aim: null,
    perception: null,
    // Future: ping, frameTime, etc.
  });

  const [uploadedFile, setUploadedFile] = useState(null);

  // Calculate composite OptiScore (0-1000)
  const calculateOptiScore = () => {
    let total = 0;
    let count = 0;

    // Reaction score (0-300 points)
    if (scores.reaction) {
      const reactionScore = Math.max(0, 300 - scores.reaction.avgMs);
      total += Math.min(300, reactionScore);
      count++;
    }

    // Aim score (0-300 points)
    if (scores.aim) {
      const aimScore = Math.max(0, 300 - scores.aim.avgMs);
      total += Math.min(300, aimScore);
      count++;
    }

    // Perception score (0-400 points) - uses perception index directly
    if (scores.perception) {
      total += Math.min(400, scores.perception.perceptionIndex * 0.4);
      count++;
    }

    // Average and scale to 1000
    if (count === 0) return 0;
    return Math.round((total / count) * (1000 / 300));
  };

  const optiScore = calculateOptiScore();

  const getRank = (score) => {
    if (score >= 900) return { name: 'Diamond', color: 'from-cyan-400 to-blue-600', emoji: '💎' };
    if (score >= 750) return { name: 'Platinum', color: 'from-gray-300 to-gray-500', emoji: '⚪' };
    if (score >= 600) return { name: 'Gold', color: 'from-yellow-400 to-yellow-600', emoji: '🥇' };
    if (score >= 450) return { name: 'Silver', color: 'from-gray-400 to-gray-600', emoji: '🥈' };
    if (score >= 300) return { name: 'Bronze', color: 'from-orange-600 to-orange-800', emoji: '🥉' };
    return { name: 'Unranked', color: 'from-gray-600 to-gray-800', emoji: '⚫' };
  };

  const rank = getRank(optiScore);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Detect test type and add to scores
        if (data.testMode !== undefined) {
          // Reaction test
          if (data.testMode === 'simple') {
            setScores(prev => ({ ...prev, reaction: data }));
          } else if (data.testMode === 'aim') {
            setScores(prev => ({ ...prev, aim: data }));
          }
        } else if (data.perceptionIndex !== undefined) {
          // Perception test
          setScores(prev => ({ ...prev, perception: data }));
        }

        setUploadedFile(file.name);
      } catch (err) {
        alert('Invalid file format. Please upload a valid OptiPlay test result.');
      }
    };
    reader.readAsText(file);
  };

  const exportScore = () => {
    const data = {
      optiScore,
      rank: rank.name,
      scores,
      date: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optiplay-score-${optiScore}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareToDiscord = () => {
    const message = `My OptiPlay Score: ${optiScore} (${rank.emoji} ${rank.name})\n\nReaction: ${scores.reaction?.avgMs || 'N/A'}ms | Aim: ${scores.aim?.avgMs || 'N/A'}ms | Perception: ${scores.perception?.perceptionIndex || 'N/A'}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message);
    alert('Score copied to clipboard! Paste it in Discord.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 OptiPlay Score Builder</h1>
          <p className="text-gray-400">Combine all test data into one composite OptiScore.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* OptiScore Card */}
            <div className={`rounded-xl bg-gradient-to-br ${rank.color} p-8 text-center`}>
              <div className="text-6xl mb-4">{rank.emoji}</div>
              <div className="text-2xl font-semibold mb-2">{rank.name}</div>
              <div className="text-7xl font-bold mb-4">{optiScore}</div>
              <div className="text-xl">OptiPlay Score</div>
            </div>

            {/* Upload Test Results */}
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Test Results</h2>
              <p className="text-sm text-gray-400 mb-4">
                Upload your exported test results from Reaction Tester, Aim Mode, and Perception Test to build your OptiScore.
              </p>

              <label className="block w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-500/50 cursor-pointer transition-all text-center">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-sm text-gray-400">Click to upload test results (.json)</div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFile && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-sm text-green-400">
                  ✓ Uploaded: {uploadedFile}
                </div>
              )}
            </div>

            {/* Share Options */}
            {optiScore > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={shareToDiscord}
                  className="px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">💬</span>
                  Share to Discord
                </button>
                <button
                  onClick={exportScore}
                  className="px-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">💾</span>
                  Export Score
                </button>
              </div>
            )}
          </div>

          {/* Score Breakdown */}
          <div className="space-y-6">
            {/* Test Scores */}
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Test Scores</h2>

              <div className="space-y-4">
                {/* Reaction */}
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Reaction Time</span>
                    {scores.reaction && <span className="text-green-400">✓</span>}
                  </div>
                  {scores.reaction ? (
                    <div className="text-2xl font-bold text-purple-400">{scores.reaction.avgMs}ms</div>
                  ) : (
                    <div className="text-sm text-gray-500">Not uploaded</div>
                  )}
                </div>

                {/* Aim */}
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Aim Accuracy</span>
                    {scores.aim && <span className="text-green-400">✓</span>}
                  </div>
                  {scores.aim ? (
                    <div className="text-2xl font-bold text-purple-400">{scores.aim.avgMs}ms</div>
                  ) : (
                    <div className="text-sm text-gray-500">Not uploaded</div>
                  )}
                </div>

                {/* Perception */}
                <div className="p-3 rounded-lg bg-neutral-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Perception Index</span>
                    {scores.perception && <span className="text-green-400">✓</span>}
                  </div>
                  {scores.perception ? (
                    <div className="text-2xl font-bold text-purple-400">{scores.perception.perceptionIndex}</div>
                  ) : (
                    <div className="text-sm text-gray-500">Not uploaded</div>
                  )}
                </div>
              </div>
            </div>

            {/* Rank Ladder */}
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6">
              <h3 className="font-semibold mb-3">Rank Ladder</h3>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center justify-between p-2 rounded ${optiScore >= 900 ? 'bg-cyan-900/30 border border-cyan-500/30' : ''}`}>
                  <span>💎 Diamond</span>
                  <span className="text-gray-400">900+</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded ${optiScore >= 750 && optiScore < 900 ? 'bg-gray-700/30 border border-gray-500/30' : ''}`}>
                  <span>⚪ Platinum</span>
                  <span className="text-gray-400">750-899</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded ${optiScore >= 600 && optiScore < 750 ? 'bg-yellow-900/30 border border-yellow-500/30' : ''}`}>
                  <span>🥇 Gold</span>
                  <span className="text-gray-400">600-749</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded ${optiScore >= 450 && optiScore < 600 ? 'bg-gray-600/30 border border-gray-400/30' : ''}`}>
                  <span>🥈 Silver</span>
                  <span className="text-gray-400">450-599</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded ${optiScore >= 300 && optiScore < 450 ? 'bg-orange-900/30 border border-orange-500/30' : ''}`}>
                  <span>🥉 Bronze</span>
                  <span className="text-gray-400">300-449</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl bg-blue-900/20 border border-blue-500/30 p-4">
              <h3 className="font-semibold mb-2 text-blue-400">How it works</h3>
              <p className="text-sm text-gray-300">
                Upload test results from our tools to build your composite OptiScore. Each test contributes to your overall rating. No online leaderboard to prevent cheating - share your score manually!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
