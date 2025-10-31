"use client";

import { useEffect, useMemo, useState } from "react";
import CompareHardware from "./CompareHardware.jsx";
import CpsTester from "./CpsTester.jsx";

const INITIAL_META = {
  games: [],
  gpus: [],
  cpus: [],
  resolutions: ["1080p", "1440p", "4K"],
};

const SUGGESTION_LIMIT = 6;
const SUGGESTION_DEBOUNCE = 120;

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

function filterSuggestions(pool, term, type) {
  if (!term) {
    return pool.filter((item) => item.type === type).slice(0, SUGGESTION_LIMIT);
  }
  const lowered = term.toLowerCase();
  return pool
    .filter((item) => item.type === type)
    .filter((item) => {
      return (
        item.label.toLowerCase().includes(lowered) ||
        (item.slug && item.slug.toLowerCase().includes(lowered)) ||
        (item.sub && item.sub.toLowerCase().includes(lowered))
      );
    })
    .slice(0, SUGGESTION_LIMIT);
}

function SuggestInput({ label, placeholder, value, onChange, suggestions, onSelect, id }) {
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
    window.setTimeout(() => setOpen(false), 100);
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
    }
  };

  return (
    <div className="relative space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-purple-200">{label}</label>
      <input
        id={id}
        value={internalValue}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-[#0c0b14] px-3 py-2 text-sm text-gray-200"
        autoComplete="off"
        spellCheck="false"
      />
      {open && suggestions.length ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-neutral-950/95 shadow-lg shadow-black/30">
          <ul className="divide-y divide-white/5 text-sm text-gray-200">
            {suggestions.map((item, index) => (
              <li key={item.slug}>
                <button
                  type="button"
                  className={`flex w-full flex-col items-start px-3 py-2 text-left transition ${
                    index === focusedIndex ? "bg-purple-600/20" : "hover:bg-purple-600/10"
                  }`}
                  onMouseDown={(evt) => evt.preventDefault()}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <span className="text-white">{item.label}</span>
                  <span className="text-[11px] text-gray-400">
                    {item.sub ? `${item.sub} • ${item.slug}` : item.slug}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function BenchmarkCenter() {
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

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/benchmarks/meta", { signal: controller.signal })
      .then((res) => res.json())
      .then((payload) => {
        setMeta({
          games: payload.games ?? [],
          gpus: payload.gpus ?? [],
          cpus: payload.cpus ?? [],
          resolutions: payload.resolutions ?? ["1080p", "1440p", "4K"],
        });
      })
      .catch(() => {});
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
    load();

    return () => controller.abort();
  }, [filters.game, filters.gpu, filters.cpu, filters.resolution]);

  const suggestionPool = useMemo(() => buildSuggestionPool(meta), [meta]);
  const [suggestions, setSuggestions] = useState({
    game: [],
    gpu: [],
    cpu: [],
  });

  useEffect(() => {
    const timers = [];
    for (const type of ["game", "gpu", "cpu"]) {
      const value = typingState[type];
      const timer = window.setTimeout(() => {
        setSuggestions((prev) => ({
          ...prev,
          [type]: filterSuggestions(suggestionPool, value, type),
        }));
      }, SUGGESTION_DEBOUNCE);
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
          />
          <SuggestInput
            id="benchmark-gpu"
            label="GPU"
            placeholder="RTX 4070, RX 7800, etc."
            value={typingState.gpu}
            onChange={(value) => handleInputChange("gpu", value)}
            onSelect={(suggestion) => handleSuggestionSelect("gpu", suggestion)}
            suggestions={suggestions.gpu}
          />
          <SuggestInput
            id="benchmark-cpu"
            label="CPU"
            placeholder="i7 13700K, Ryzen 7800X3D…"
            value={typingState.cpu}
            onChange={(value) => handleInputChange("cpu", value)}
            onSelect={(suggestion) => handleSuggestionSelect("cpu", suggestion)}
            suggestions={suggestions.cpu}
          />
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-purple-200">
              Resolution
            </label>
            <select
              className="w-full rounded-lg border border-white/10 bg-[#0c0b14] px-3 py-2 text-sm text-gray-200"
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
        <p className="mt-3 text-[11px] text-gray-500">
          Suggestions appear as you type. You can also paste custom slugs or family names (e.g., “rtx 40” or “ryzen 7000”).
        </p>
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
