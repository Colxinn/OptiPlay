'use client';

import { useState, useEffect, useRef } from 'react';

export default function ReactionTester() {
  const [state, setState] = useState('idle'); // idle, waiting, click, results
  const [attempts, setAttempts] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Test mode and settings
  const [testMode, setTestMode] = useState('simple'); // simple or aim
  const [targetSize, setTargetSize] = useState(100); // pixels
  const [targetColor, setTargetColor] = useState('#22c55e'); // green
  const [targetShape, setTargetShape] = useState('circle'); // circle or square
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 }); // percentage

  const avgTime = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, t) => sum + t, 0) / attempts.length) 
    : 0;
  const bestTime = attempts.length > 0 ? Math.min(...attempts) : 0;
  const consistency = attempts.length > 1
    ? Math.round(Math.sqrt(attempts.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / attempts.length))
    : 0;

  const proComparison = avgTime > 0 ? (
    avgTime < 180 ? 'Pro-tier' :
    avgTime < 220 ? 'Competitive' :
    avgTime < 280 ? 'Above Average' :
    avgTime < 350 ? 'Average' : 'Needs Practice'
  ) : '';

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startTest = () => {
    setState('waiting');
    
    // For aim mode, randomize target position
    if (testMode === 'aim') {
      setTargetPosition({
        x: Math.random() * 70 + 15, // 15-85% to keep target visible
        y: Math.random() * 70 + 15,
      });
    }
    
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    
    timeoutRef.current = setTimeout(() => {
      setState('click');
      startTimeRef.current = performance.now();
    }, delay);
  };

  const handleClick = (e) => {
    if (state === 'idle') {
      startTest();
    } else if (state === 'waiting') {
      // Too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState('idle');
      alert('Too early! Wait for the target to turn green.');
    } else if (state === 'click') {
      // For aim mode, check if click was on target
      if (testMode === 'aim') {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = ((e.clientX - rect.left) / rect.width) * 100;
        const clickY = ((e.clientY - rect.top) / rect.height) * 100;
        
        let isHit = false;
        
        if (targetShape === 'circle') {
          // Circle hit detection
          const targetRadius = (targetSize / rect.width) * 100 / 2;
          const distance = Math.sqrt(
            Math.pow(clickX - targetPosition.x, 2) + 
            Math.pow(clickY - targetPosition.y, 2)
          );
          isHit = distance <= targetRadius;
        } else {
          // Square hit detection
          const targetHalfSize = (targetSize / rect.width) * 100 / 2;
          const withinX = Math.abs(clickX - targetPosition.x) <= targetHalfSize;
          const withinY = Math.abs(clickY - targetPosition.y) <= targetHalfSize * (rect.width / rect.height);
          isHit = withinX && withinY;
        }
        
        if (!isHit) {
          // Missed the target
          setState('idle');
          alert('Missed! Click on the green target.');
          return;
        }
      }
      
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      setAttempts([...attempts, reactionTime]);
      setCurrentTime(reactionTime);
      setState('results');
    }
  };

  const resetTest = () => {
    setAttempts([]);
    setCurrentTime(null);
    setState('idle');
  };

  const tryAgain = () => {
    setCurrentTime(null);
    startTest();
  };

  const changeMode = (mode) => {
    setTestMode(mode);
    setAttempts([]);
    setCurrentTime(null);
    setState('idle');
  };

  const exportResults = () => {
    const data = {
      testMode,
      avgMs: avgTime,
      bestMs: bestTime,
      consistencyScore: consistency,
      attempts: attempts,
      rating: proComparison,
      date: new Date().toISOString(),
      ...(testMode === 'aim' && {
        aimSettings: {
          targetSize,
          targetColor,
          targetShape,
        }
      })
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optiplay-reaction-${testMode}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBackgroundColor = () => {
    if (testMode === 'aim') return 'bg-[#0b0b10]'; // Always dark for aim mode
    if (state === 'waiting') return 'bg-red-600';
    if (state === 'click') return 'bg-green-500';
    return 'bg-[#0b0b10]';
  };

  const getInstructions = () => {
    if (state === 'idle') return testMode === 'aim' ? 'Click to start aim test' : 'Click anywhere to start';
    if (state === 'waiting') return testMode === 'aim' ? 'Get ready...' : 'Wait for GREEN...';
    if (state === 'click') return testMode === 'aim' ? 'CLICK THE TARGET!' : 'CLICK NOW!';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🧩 Reaction Time Tester</h1>
          <p className="text-gray-400">Test your reflexes and compare your delay to esports pros.</p>
        </div>

        {/* Main Test Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Box */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mode Selector */}
            <div className="flex gap-3">
              <button
                onClick={() => changeMode('simple')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  testMode === 'simple'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-900/50 border border-white/10 hover:border-white/20'
                }`}
              >
                Simple Mode
              </button>
              <button
                onClick={() => changeMode('aim')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  testMode === 'aim'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-900/50 border border-white/10 hover:border-white/20'
                }`}
              >
                Aim Mode
              </button>
            </div>

            {/* Settings Panel (only for aim mode) */}
            {testMode === 'aim' && state === 'idle' && (
              <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6 space-y-4">
                <h3 className="font-semibold mb-3">Aim Settings</h3>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Target Size: {targetSize}px
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    value={targetSize}
                    onChange={(e) => setTargetSize(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Target Shape</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTargetShape('circle')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                        targetShape === 'circle'
                          ? 'bg-purple-600'
                          : 'bg-neutral-800 border border-white/10'
                      }`}
                    >
                      Circle
                    </button>
                    <button
                      onClick={() => setTargetShape('square')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                        targetShape === 'square'
                          ? 'bg-purple-600'
                          : 'bg-neutral-800 border border-white/10'
                      }`}
                    >
                      Square
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Target Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={targetColor}
                      onChange={(e) => setTargetColor(e.target.value)}
                      className="h-10 w-20 rounded cursor-pointer bg-transparent"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTargetColor('#22c55e')}
                        className="w-8 h-8 rounded bg-green-500 border-2 border-white/20 hover:border-white/40"
                      />
                      <button
                        onClick={() => setTargetColor('#ef4444')}
                        className="w-8 h-8 rounded bg-red-500 border-2 border-white/20 hover:border-white/40"
                      />
                      <button
                        onClick={() => setTargetColor('#3b82f6')}
                        className="w-8 h-8 rounded bg-blue-500 border-2 border-white/20 hover:border-white/40"
                      />
                      <button
                        onClick={() => setTargetColor('#f59e0b')}
                        className="w-8 h-8 rounded bg-amber-500 border-2 border-white/20 hover:border-white/40"
                      />
                      <button
                        onClick={() => setTargetColor('#a855f7')}
                        className="w-8 h-8 rounded bg-purple-500 border-2 border-white/20 hover:border-white/40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Area */}
            <div
              onClick={handleClick}
              className={`${getBackgroundColor()} rounded-xl border border-white/10 transition-all duration-200 cursor-pointer hover:border-white/20 flex items-center justify-center relative overflow-hidden`}
              style={{ minHeight: '500px' }}
            >
              {/* Aim Mode Target - Only show when green (state === 'click') */}
              {testMode === 'aim' && state === 'click' && (
                <div
                  className="absolute transition-all duration-200"
                  style={{
                    left: `${targetPosition.x}%`,
                    top: `${targetPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${targetSize}px`,
                    height: `${targetSize}px`,
                    backgroundColor: targetColor,
                    borderRadius: targetShape === 'circle' ? '50%' : '8px',
                    border: `3px solid rgba(255,255,255,0.3)`,
                  }}
                />
              )}

              <div className="text-center z-10">
                {state === 'results' ? (
                  <div className="space-y-4 px-4">
                    <div className="text-7xl font-bold text-purple-400">{currentTime}ms</div>
                    <div className="text-2xl text-gray-300">
                      {currentTime < 200 ? '🔥 Lightning Fast!' :
                       currentTime < 250 ? '⚡ Excellent!' :
                       currentTime < 300 ? '✨ Good!' :
                       currentTime < 400 ? '👍 Not Bad' : '🐌 Keep Practicing'}
                    </div>
                    {testMode === 'aim' && <div className="text-sm text-green-400">✓ Target Hit!</div>}
                    <div className="flex gap-3 justify-center pt-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); tryAgain(); }}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setState('idle'); }}
                        className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-white/10"
                      >
                        View Stats
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-semibold">{getInstructions()}</div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 rounded-lg bg-neutral-900/50 border border-white/5">
              <h3 className="font-semibold mb-2">How it works:</h3>
              {testMode === 'simple' ? (
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Click to start the test</li>
                  <li>• Wait for the screen to turn <span className="text-green-400">GREEN</span></li>
                  <li>• Click as fast as you can when it turns green</li>
                  <li>• Complete 5+ attempts for accurate stats</li>
                  <li>• Pro gamers average 150-200ms reaction time</li>
                </ul>
              ) : (
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Customize target size, shape, and color above</li>
                  <li>• Click to start - screen goes dark</li>
                  <li>• Target will <span className="text-green-400">flash</span> at random position (flashbang simulation)</li>
                  <li>• Click the target as fast as possible</li>
                  <li>• Missing the target doesn't count - precision matters!</li>
                  <li>• Smaller targets = harder, more realistic aim training</li>
                </ul>
              )}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            {/* Current Stats */}
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Stats</h2>
                <div className="text-xs px-2 py-1 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  {testMode === 'simple' ? 'Simple' : 'Aim'} Mode
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Average Time</div>
                  <div className="text-3xl font-bold text-purple-400">{avgTime || '-'}ms</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Best Time</div>
                  <div className="text-2xl font-semibold text-green-400">{bestTime || '-'}ms</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Consistency</div>
                  <div className="text-xl font-semibold text-blue-400">
                    {consistency > 0 ? `±${consistency}ms` : '-'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Rating</div>
                  <div className="text-lg font-semibold text-yellow-400">{proComparison || '-'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Attempts</div>
                  <div className="text-lg font-semibold">{attempts.length}</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={resetTest}
                  className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/30 font-semibold"
                  disabled={attempts.length === 0}
                >
                  Reset All
                </button>
                <button
                  onClick={exportResults}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={attempts.length === 0}
                >
                  Export Results
                </button>
              </div>
            </div>

            {/* Pro Comparison */}
            <div className="rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
              <h3 className="font-semibold mb-3">⚡ Pro Benchmarks</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pro-tier</span>
                  <span className="text-green-400">&lt;180ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Competitive</span>
                  <span className="text-blue-400">180-220ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Above Average</span>
                  <span className="text-yellow-400">220-280ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average</span>
                  <span className="text-orange-400">280-350ms</span>
                </div>
              </div>
            </div>

            {/* Hook */}
            <div className="rounded-xl bg-green-900/20 border border-green-500/30 p-4">
              <div className="text-sm text-green-300">
                <span className="font-semibold">💡 Pro Tip:</span> Run our FPS Booster, then retest. Lower system latency = faster reactions!
              </div>
            </div>

            {/* Attempts History */}
            {attempts.length > 0 && (
              <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-4">
                <h3 className="font-semibold mb-3 text-sm">Recent Attempts</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {attempts.slice().reverse().map((time, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-400">Attempt {attempts.length - idx}</span>
                      <span className={time === bestTime ? 'text-green-400 font-semibold' : 'text-gray-300'}>
                        {time}ms {time === bestTime && '⭐'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
