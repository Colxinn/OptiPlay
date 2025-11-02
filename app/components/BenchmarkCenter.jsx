"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import CompareHardware from "./CompareHardware.jsx";
import CpsTester from "./CpsTester.jsx";

const INITIAL_META = {
  games: [],
  gpus: [],
  cpus: [],
  resolutions: ["1080p", "1440p", "4K"],
};

const SUGGESTION_LIMIT = 8;
const SUGGESTION_DEBOUNCE = 150; // Reduced from 200ms

function LoadingScreen({ logs }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08060f]">
      <div className="w-full max-w-xl space-y-6 px-6">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-600 mb-2">
            OptiPlay Benchmarks
          </h1>
          <p className="text-gray-400 text-sm">Loading benchmark database...</p>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-neutral-900/80">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 animate-[shimmer_2s_ease-in-out_infinite]" 
               style={{ 
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 2s ease-in-out infinite'
               }}>
          </div>
        </div>

        {/* Loading Logs */}
        <div className="rounded-xl border border-white/10 bg-neutral-950/80 p-4 backdrop-blur-sm">
          <div className="space-y-2 font-mono text-xs">
            {logs.map((log, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-400 animate-[fadeIn_0.3s_ease-in]"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-purple-400">▸</span>
                <span>{log.message}</span>
                {log.done && <span className="ml-auto text-green-400">✓</span>}
                {log.loading && (
                  <span className="ml-auto">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-3">
            <div className="text-2xl font-bold text-purple-400">87</div>
            <div className="text-xs text-gray-500">GPUs</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-3">
            <div className="text-2xl font-bold text-fuchsia-400">89</div>
            <div className="text-xs text-gray-500">CPUs</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-3">
            <div className="text-2xl font-bold text-purple-400">21</div>
            <div className="text-xs text-gray-500">Games</div>
          </div>
        </div>

        {/* Total Combinations */}
        <div className="text-center">
          <div className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-950/40 to-fuchsia-950/40 p-3">
            <div className="text-xs text-gray-400 mb-1">Total Benchmark Combinations</div>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
              487,809
            </div>
            <div className="text-[10px] text-gray-500 mt-1">87 GPUs × 89 CPUs × 21 Games × 3 Resolutions</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function AnimatedBar({ label, value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="truncate pr-2">{label}</span>
        <span className="tabular-nums text-purple-200 font-medium">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded bg-neutral-800/80">
        <div
          className="h-full rounded bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function buildSuggestionPool(meta) {
  const pool = [];
  for (const game of meta.games) {
    pool.push({
      type: "game",
      slug: game.slug,
      value: game.slug,
      label: game.name,
      sub: game.genre ? `${game.genre}` : null,
    });
  }
  for (const gpu of meta.gpus) {
    pool.push({
      type: "gpu",
      slug: gpu.slug,
      value: gpu.slug,
      label: gpu.name,
      sub: gpu.family || gpu.architecture || null,
    });
  }
  for (const cpu of meta.cpus) {
    pool.push({
      type: "cpu",
      slug: cpu.slug,
      value: cpu.slug,
      label: cpu.name,
      sub: cpu.family || cpu.architecture || null,
    });
  }
  return pool;
}

// Optimized filtering with early returns and better performance
function filterSuggestions(pool, term, type) {
  const typeFiltered = pool.filter((item) => item.type === type);
  
  if (!term) {
    return typeFiltered.slice(0, SUGGESTION_LIMIT);
  }
  
  const lowered = term.toLowerCase();
  const results = [];
  
  // Early exit when we have enough results
  for (const item of typeFiltered) {
    if (results.length >= SUGGESTION_LIMIT) break;
    
    // Prioritize exact slug matches
    if (item.slug.toLowerCase() === lowered) {
      results.unshift(item);
      continue;
    }
    
    // Then check for starts-with matches
    if (item.label.toLowerCase().startsWith(lowered) || 
        item.slug.toLowerCase().startsWith(lowered)) {
      results.push(item);
      continue;
    }
    
    // Finally, contains matches
    if (item.label.toLowerCase().includes(lowered) ||
        item.slug.toLowerCase().includes(lowered) ||
        (item.sub && item.sub.toLowerCase().includes(lowered))) {
      results.push(item);
    }
  }
  
  return results.slice(0, SUGGESTION_LIMIT);
}

function SuggestInput({ label, placeholder, value, onChange, suggestions, onSelect, id, loading }) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) setFocusedIndex(-1);
  }, [open]);

  const handleChange = (event) => {
    const next = event.target.value;
    setInternalValue(next);
    onChange(next);
    setOpen(true);
  };

  const handleBlur = () => {
    window.setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (event) => {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((idx) => Math.min(idx + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((idx) => Math.max(idx - 1, 0));
    } else if (event.key === "Enter") {
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        event.preventDefault();
        onSelect(suggestions[focusedIndex]);
        setOpen(false);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-purple-200">{label}</label>
      <div className="relative">
        <input
          id={id}
          value={internalValue}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/10 bg-[#0c0b14] px-3 py-2 pr-8 text-sm text-gray-200 transition focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
          autoComplete="off"
          spellCheck="false"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
          </div>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-neutral-950/98 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <ul className="max-h-64 overflow-y-auto divide-y divide-white/5 text-sm text-gray-200">
            {suggestions.map((item, index) => (
              <li key={item.slug}>
                <button
                  type="button"
                  className={`flex w-full flex-col items-start px-3 py-2.5 text-left transition ${
                    index === focusedIndex 
                      ? "bg-purple-600/30 border-l-2 border-purple-400" 
                      : "hover:bg-purple-600/10"
                  }`}
                  onMouseDown={(evt) => evt.preventDefault()}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <span className="font-medium text-white">{item.label}</span>
                  <span className="text-[11px] text-gray-400">
                    {item.sub ? `${item.sub} • ${item.slug}` : item.slug}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BenchmarkCenter() {
  const [initializing, setInitializing] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState([]);
  const [meta, setMeta] = useState(INITIAL_META);
  const [filters, setFilters] = useState({
    game: "",
    gpu: "",
    cpu: "",
    resolution: "",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [typingState, setTypingState] = useState({
    game: "",
    gpu: "",
    cpu: "",
  });
  const [suggestionLoading, setSuggestionLoading] = useState({
    game: false,
    gpu: false,
    cpu: false,
  });

  const addLog = (message, loading = false, done = false) => {
    setLoadingLogs(prev => [...prev, { message, loading, done }]);
  };

  // Initial load with smart loading screen (skip for returning users)
  useEffect(() => {
    const controller = new AbortController();
    const hasVisited = typeof window !== 'undefined' && localStorage.getItem('optiplay_benchmarks_visited');
    
    const loadInitialData = async () => {
      try {
        // Skip loading screen animations for returning users
        if (hasVisited) {
          const res = await fetch("/api/benchmarks/meta", { signal: controller.signal });
          if (!res.ok) throw new Error("Failed to load metadata");
          const payload = await res.json();
          
          setMeta({
            games: payload.games ?? [],
            gpus: payload.gpus ?? [],
            cpus: payload.cpus ?? [],
            resolutions: payload.resolutions ?? ["1080p", "1440p", "4K"],
          });
          
          setInitializing(false);
          return;
        }
        
        // Show loading screen for first-time users
        addLog("Initializing benchmark database...", true);
        
        addLog("Loading hardware metadata...", true);
        const res = await fetch("/api/benchmarks/meta", { signal: controller.signal });
        
        if (!res.ok) throw new Error("Failed to load metadata");
        
        const payload = await res.json();
        
        addLog("Loading hardware metadata...", false, true);
        
        addLog(`Indexed ${payload.gpus?.length || 0} GPUs`, false, true);
        addLog(`Indexed ${payload.cpus?.length || 0} CPUs`, false, true);
        addLog(`Loaded ${payload.games?.length || 0} games`, false, true);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        addLog("Building search index...", true);
        
        setMeta({
          games: payload.games ?? [],
          gpus: payload.gpus ?? [],
          cpus: payload.cpus ?? [],
          resolutions: payload.resolutions ?? ["1080p", "1440p", "4K"],
        });
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        addLog("Building search index...", false, true);
        addLog("Ready! 🚀", false, true);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mark as visited
        if (typeof window !== 'undefined') {
          localStorage.setItem('optiplay_benchmarks_visited', 'true');
        }
        
        setInitializing(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          addLog(`Error: ${err.message}`, false, false);
          await new Promise(resolve => setTimeout(resolve, 500));
          setInitializing(false);
        }
      }
    };
    
    loadInitialData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (filters.game) params.set("game", filters.game);
        if (filters.gpu) params.set("gpu", filters.gpu);
        if (filters.cpu) params.set("cpu", filters.cpu);
        if (filters.resolution) params.set("resolution", filters.resolution);

        const res = await fetch(`/api/benchmarks?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load benchmark data.");
        }
        const payload = await res.json();
        setResults(Array.isArray(payload.results) ? payload.results : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message ?? "Unable to load benchmark data.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (!initializing) {
      load();
    }

    return () => controller.abort();
  }, [filters.game, filters.gpu, filters.cpu, filters.resolution, initializing]);

  // Memoize suggestion pool with useMemo for better performance
  const suggestionPool = useMemo(() => {
    if (meta.games.length === 0) return [];
    return buildSuggestionPool(meta);
  }, [meta.games.length, meta.gpus.length, meta.cpus.length]);
  
  const [suggestions, setSuggestions] = useState({
    game: [],
    gpu: [],
    cpu: [],
  });

  // Optimized suggestion filtering with reduced debounce and RAF
  useEffect(() => {
    if (suggestionPool.length === 0) return;
    
    const timers = [];
    
    for (const type of ["game", "gpu", "cpu"]) {
      const value = typingState[type];
      
      const timer = window.setTimeout(() => {
        setSuggestionLoading(prev => ({ ...prev, [type]: true }));
        
        // Use microtask for immediate update
        queueMicrotask(() => {
          const filtered = filterSuggestions(suggestionPool, value, type);
          setSuggestions((prev) => ({ ...prev, [type]: filtered }));
          setSuggestionLoading(prev => ({ ...prev, [type]: false }));
        });
      }, value.length === 0 ? 0 : SUGGESTION_DEBOUNCE);
      
      timers.push(timer);
    }
    
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [typingState, suggestionPool]);

  const maxWeighted = useMemo(
    () => results.reduce((acc, item) => Math.max(acc, item.weightedIndex ?? 0), 0),
    [results]
  );

  const groupedResults = useMemo(() => {
    const map = new Map();
    for (const result of results) {
      const familyKey = result.grouping?.gpuFamily ?? "Other GPUs";
      if (!map.has(familyKey)) map.set(familyKey, []);
      map.get(familyKey).push(result);
    }
    return Array.from(map.entries())
      .map(([family, items]) => ({
        family,
        items: items.sort((a, b) => (b.weightedIndex ?? 0) - (a.weightedIndex ?? 0)),
      }))
      .sort((a, b) => (b.items[0]?.weightedIndex ?? 0) - (a.items[0]?.weightedIndex ?? 0));
  }, [results]);

  const [collapsedFamilies, setCollapsedFamilies] = useState({});
  const toggleFamily = (family) =>
    setCollapsedFamilies((prev) => ({ ...prev, [family]: !prev[family] }));

  const handleSuggestionSelect = (type, suggestion) => {
    setFilters((prev) => ({ ...prev, [type]: suggestion.value }));
    setTypingState((prev) => ({ ...prev, [type]: suggestion.label }));
    setSuggestions((prev) => ({ ...prev, [type]: [] }));
  };

  const handleInputChange = (type, raw) => {
    setTypingState((prev) => ({ ...prev, [type]: raw }));
    setFilters((prev) => ({ ...prev, [type]: raw }));
  };

  if (initializing) {
    return <LoadingScreen logs={loadingLogs} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 shadow-lg shadow-black/20">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SuggestInput
            id="benchmark-game"
            label="Game"
            placeholder="Start typing…"
            value={typingState.game}
            onChange={(value) => handleInputChange("game", value)}
            onSelect={(suggestion) => handleSuggestionSelect("game", suggestion)}
            suggestions={suggestions.game}
            loading={suggestionLoading.game}
          />
          <SuggestInput
            id="benchmark-gpu"
            label="GPU"
            placeholder="RTX 4070, RX 7800, etc."
            value={typingState.gpu}
            onChange={(value) => handleInputChange("gpu", value)}
            onSelect={(suggestion) => handleSuggestionSelect("gpu", suggestion)}
            suggestions={suggestions.gpu}
            loading={suggestionLoading.gpu}
          />
          <SuggestInput
            id="benchmark-cpu"
            label="CPU"
            placeholder="i7 13700K, Ryzen 7800X3D…"
            value={typingState.cpu}
            onChange={(value) => handleInputChange("cpu", value)}
            onSelect={(suggestion) => handleSuggestionSelect("cpu", suggestion)}
            suggestions={suggestions.cpu}
            loading={suggestionLoading.cpu}
          />
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-purple-200">
              Resolution
            </label>
            <select
              className="w-full rounded-lg border border-white/10 bg-[#0c0b14] px-3 py-2 text-sm text-gray-200 transition focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
              value={filters.resolution}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, resolution: event.target.value }))
              }
            >
              <option value="">All resolutions</option>
              {meta.resolutions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            Suggestions appear instantly as you type. Press ESC to close, Enter to select.
          </p>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
              <span>Searching...</span>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 text-sm text-gray-400">
            Fetching benchmark data…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-950/40 p-6 text-sm text-red-200">
            {error}
          </div>
        ) : groupedResults.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 text-sm text-gray-400">
            No benchmark entries match those filters yet. Try broadening your search.
          </div>
        ) : (
          groupedResults.map(({ family, items }) => (
            <div
              key={family}
              className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/70 shadow-lg shadow-black/20"
            >
              <button
                type="button"
                onClick={() => toggleFamily(family)}
                className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-white/5"
              >
                <div>
                  <div className="text-sm font-semibold text-purple-100">{family}</div>
                  <div className="text-xs text-gray-500">
                    {items.length} configuration{items.length === 1 ? "" : "s"}
                  </div>
                </div>
                <span className="text-purple-200">
                  {collapsedFamilies[family] ? "Show" : "Hide"}
                </span>
              </button>
              {!collapsedFamilies[family] ? (
                <div className="grid gap-4 border-t border-white/5 px-5 py-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/5 bg-neutral-950/80 p-4 transition hover:border-purple-400/50"
                    >
                      <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wide text-purple-300">
                          {item.game.name} • {item.resolution}
                        </div>
                        <h3 className="text-base font-semibold text-white">
                          {item.gpu.name} + {item.cpu.name}
                        </h3>
                      </div>

                      <AnimatedBar
                        label="Weighted Performance Index"
                        value={item.weightedIndex}
                        max={maxWeighted}
                      />

                      <div className="grid gap-2 text-xs text-gray-300">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Average FPS</span>
                          <span className="tabular-nums text-white font-semibold">
                            {item.avgFps}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Performance / $</span>
                          <span className="tabular-nums text-purple-200">
                            {item.performancePerDollar ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Total Power (est.)</span>
                          <span className="tabular-nums text-amber-200">
                            {item.totalPowerDraw ? `${item.totalPowerDraw} W` : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-3 text-[11px] text-gray-400">
                        <div>
                          <span className="text-white">CPU:</span>{" "}
                          {item.cpu.benchmarkScore} score • {item.cpu.cores ?? "?"}c/
                          {item.cpu.threads ?? "?"}t • {item.cpu.tdpWatts ?? "?"} W TDP
                        </div>
                        <div>
                          <span className="text-white">GPU:</span>{" "}
                          {item.gpu.architecture ?? "Unknown"} • {item.gpu.powerDraw ?? "?"} W
                        </div>
                        {item.metadata?.source ? (
                          <div className="mt-1">
                            <span className="text-white">Source:</span> {item.metadata.source}
                          </div>
                        ) : null}
                        {item.metadata?.notes ? (
                          <div>
                            <span className="text-white">Notes:</span> {item.metadata.notes}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-5">
          <CompareHardware results={results} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-neutral-950/70 p-5 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-3">CPS Benchmark</h2>
          <div className="flex-1 rounded-xl border border-white/10 bg-neutral-900/70 p-4">
            <CpsTester />
          </div>
        </div>
      </section>
    </div>
  );
}
