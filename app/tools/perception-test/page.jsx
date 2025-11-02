'use client';

import { useState, useEffect, useRef } from 'react';

export default function PerceptionTest() {
  const [state, setState] = useState('idle'); // idle, testing, results
  const [attempts, setAttempts] = useState([]);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [targetColor, setTargetColor] = useState('#ef4444');
  const [flickerRate, setFlickerRate] = useState(144); // Hz
  const [testDuration, setTestDuration] = useState(10); // seconds
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const colorChangeTimeRef = useRef(null);

  const avgAccuracy = attempts.length > 0
    ? Math.round(attempts.reduce((sum, t) => sum + t, 0) / attempts.length)
    : 0;
  const bestAccuracy = attempts.length > 0 ? Math.min(...attempts) : 0;

  const perceptionIndex = avgAccuracy > 0 ? Math.max(0, 1000 - avgAccuracy * 2) : 0;
  const rating = perceptionIndex >= 800 ? 'Elite' :
                 perceptionIndex >= 600 ? 'Excellent' :
                 perceptionIndex >= 400 ? 'Good' :
                 perceptionIndex >= 200 ? 'Average' : 'Needs Training';

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTest = () => {
    setState('testing');
    setCurrentColor('#3b82f6');
    
    // Set random time for color change (2-5 seconds)
    const changeTime = Math.random() * 3000 + 2000;
    
    colorChangeTimeRef.current = Date.now() + changeTime;
    
    setTimeout(() => {
      setCurrentColor('#ef4444');
      startTimeRef.current = performance.now();
    }, changeTime);
  };

  const handleClick = () => {
    if (state === 'testing' && currentColor === '#ef4444') {
      const reactionTime = Math.round(performance.now() - startTimeRef.current);
      setAttempts([...attempts, reactionTime]);
      setState('results');
    } else if (state === 'testing') {
      alert('Too early! Wait for the color to change to red.');
      setState('idle');
    }
  };

  const resetTest = () => {
    setAttempts([]);
    setState('idle');
  };

  const exportResults = () => {
    const data = {
      perceptionIndex,
      rating,
      avgAccuracy,
      bestAccuracy,
      flickerRate,
      attempts,
      date: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optiplay-perception-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">👁️ Perception Accuracy Test</h1>
          <p className="text-gray-400">Measure how precisely you notice frame changes and color shifts.</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Settings (only in idle) */}
            {state === 'idle' && (
              <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6 space-y-4">
                <h3 className="font-semibold mb-3">Test Settings</h3>
                
                <div>
                  <label className="text-sm text-gray-400 block mb-2">
                    Simulated Refresh Rate: {flickerRate}Hz
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="240"
                    step="30"
                    value={flickerRate}
                    onChange={(e) => setFlickerRate(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>60Hz</span>
                    <span>120Hz</span>
                    <span>144Hz</span>
                    <span>165Hz</span>
                    <span>240Hz</span>
                  </div>
                </div>
              </div>
            )}

            {/* Test Display */}
            <div
              onClick={handleClick}
              className="rounded-xl border border-white/10 cursor-pointer hover:border-white/20 transition-all flex items-center justify-center relative overflow-hidden"
              style={{ 
                minHeight: '500px',
                backgroundColor: state === 'idle' ? '#0b0b10' : currentColor,
                transition: 'background-color 0.05s ease'
              }}
            >
              {state === 'idle' && (
                <div className="text-center">
                  <div className="text-6xl mb-4">👁️</div>
                  <div className="text-2xl font-semibold mb-2">Click to Start</div>
                  <p className="text-gray-400">Click as soon as you see the color change to red</p>
                </div>
              )}

              {state === 'testing' && currentColor === '#3b82f6' && (
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white drop-shadow-lg">
                    Wait for color change...
                  </div>
                </div>
              )}

              {state === 'testing' && currentColor === '#ef4444' && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-lg animate-pulse">
                    CLICK NOW!
                  </div>
                </div>
              )}

              {state === 'results' && (
                <div className="text-center space-y-4">
                  <div className="text-7xl font-bold text-white drop-shadow-lg">
                    {attempts[attempts.length - 1]}ms
                  </div>
                  <div className="text-2xl text-white">
                    {attempts[attempts.length - 1] < 100 ? '🔥 Lightning Fast!' :
                     attempts[attempts.length - 1] < 150 ? '⚡ Excellent!' :
                     attempts[attempts.length - 1] < 200 ? '✨ Good!' :
                     attempts[attempts.length - 1] < 300 ? '👍 Not Bad' : '🐌 Keep Practicing'}
                  </div>
                  <div className="flex gap-3 justify-center pt-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); startTest(); }}
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
              )}
            </div>

            {/* Start Button */}
            {state === 'idle' && (
              <button
                onClick={startTest}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold"
              >
                Start Perception Test
              </button>
            )}

            {/* Instructions */}
            <div className="rounded-lg bg-neutral-900/50 border border-white/5 p-4">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Test measures how quickly you perceive color changes</li>
                <li>• Screen will be blue, then change to red at a random time</li>
                <li>• Click as soon as you notice the color change</li>
                <li>• Higher refresh rates may improve your perception index</li>
                <li>• Complete multiple attempts for accurate results</li>
              </ul>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-6">
            <div className="rounded-xl bg-neutral-900/50 border border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Your Results</h2>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Perceptual Reaction Index</div>
                  <div className="text-3xl font-bold text-purple-400">{perceptionIndex}</div>
                  <div className="text-sm text-yellow-400 mt-1">{rating}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Average Accuracy</div>
                  <div className="text-2xl font-semibold text-green-400">{avgAccuracy || '-'}ms</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Best Time</div>
                  <div className="text-xl font-semibold text-blue-400">{bestAccuracy || '-'}ms</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Attempts</div>
                  <div className="text-lg font-semibold">{attempts.length}</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={resetTest}
                  disabled={attempts.length === 0}
                  className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset All
                </button>
                <button
                  onClick={exportResults}
                  disabled={attempts.length === 0}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export Results
                </button>
              </div>
            </div>

            {/* Rating Scale */}
            <div className="rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
              <h3 className="font-semibold mb-3">Index Scale</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Elite</span>
                  <span className="text-purple-400">800-1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Excellent</span>
                  <span className="text-blue-400">600-799</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Good</span>
                  <span className="text-green-400">400-599</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average</span>
                  <span className="text-yellow-400">200-399</span>
                </div>
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
                      <span className={time === bestAccuracy ? 'text-green-400 font-semibold' : 'text-gray-300'}>
                        {time}ms {time === bestAccuracy && '⭐'}
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
