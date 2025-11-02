"use client";

import { useEffect, useRef, useState } from "react";

const DURATIONS = [10, 30, 60, 120];

export default function CpsTester() {
  const [duration, setDuration] = useState(10);
  const [running, setRunning] = useState(false);
  const [clicks, setClicks] = useState(0);
  const clicksRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => { setTimeLeft(duration); }, [duration]);

  function start() {
    setClicks(0);
    clicksRef.current = 0;
    setResult(null);
    setRunning(true);
    setTimeLeft(duration);
    clearInterval(timerRef.current);
    const startAt = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startAt) / 1000;
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);
      if (left === 0) {
        clearInterval(timerRef.current);
        setRunning(false);
        const finalClicks = clicksRef.current;
        const cps = finalClicks / duration;
        setResult({ clicks: finalClicks, duration, cps: Math.round(cps * 100) / 100 });
      }
    }, 50);
  }

  function onClickArea(e) {
    e.preventDefault();
    if (!running) return;
    clicksRef.current += 1;
    setClicks((c) => c + 1);
  }

  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 p-4">
      <div className="flex items-center gap-2">
        <div className="font-semibold">CPS Benchmark</div>
        <div className="ml-auto flex gap-2 text-sm">
          {DURATIONS.map((d)=>(
            <button key={d} onClick={()=>!running && setDuration(d)} className={`px-2 py-1 rounded border ${duration===d? 'bg-purple-700 border-purple-600' : 'bg-neutral-950 border-white/10'}`}>{d}s</button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-3">
        <div className="rounded-lg bg-neutral-950 border border-white/10 p-3 text-sm">
          <div className="text-gray-400">Time Left</div>
          <div className="text-2xl font-bold tabular-nums">{Math.ceil(timeLeft)}</div>
          <div className="mt-2 text-gray-400">Clicks</div>
          <div className="text-xl font-semibold tabular-nums">{clicks}</div>
          <div className="mt-2 flex gap-2">
            <button onClick={start} disabled={running} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm disabled:opacity-60">{running ? 'Running…' : 'Start'}</button>
            <button onClick={()=>{ setRunning(false); clearInterval(timerRef.current); setTimeLeft(duration); setClicks(0); setResult(null); }} className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-sm">Reset</button>
          </div>
          {result && (
            <div className="mt-3 text-sm">
              <div className="text-gray-400">Result</div>
              <div className="font-semibold">{result.cps} CPS ({result.clicks} clicks / {result.duration}s)</div>
            </div>
          )}
        </div>
        <button onMouseDown={onClickArea} onTouchStart={onClickArea} onMouseUp={(e)=>e.preventDefault()} onClick={(e)=>e.preventDefault()} className={`h-40 md:h-48 rounded-lg border-2 ${running? 'border-purple-500 bg-purple-950/20' : 'border-white/10 bg-neutral-950'} grid place-items-center select-none`}> 
          <div className="text-center">
            <div className="font-semibold">{running ? 'Click as fast as you can!' : 'Press Start, then click here'}</div>
            <div className="text-sm text-gray-400">Counts only while running</div>
          </div>
        </button>
      </div>
    </div>
  );
}
