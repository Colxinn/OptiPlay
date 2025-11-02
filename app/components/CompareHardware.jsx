'use client';

import { useEffect, useMemo, useState } from 'react';

function formatDifference(value, unit = '') {
  if (value === null || Number.isNaN(value)) return '—';
  const symbol = value > 0 ? '+' : '';
  return `${symbol}${value.toFixed(1)}${unit}`;
}

function optionLabel(result) {
  return `${result.game.name} • ${result.resolution} • ${result.gpu.name} + ${result.cpu.name}`;
}

export default function CompareHardware({ results }) {
  const options = useMemo(() => {
    return (results ?? []).map((item) => ({
      id: item.id,
      label: optionLabel(item),
      avgFps: Number(item.avgFps ?? 0),
      weightedIndex: Number(item.weightedIndex ?? 0),
      performancePerDollar:
        item.performancePerDollar === null || item.performancePerDollar === undefined
          ? null
          : Number(item.performancePerDollar),
      totalPowerDraw:
        item.totalPowerDraw === null || item.totalPowerDraw === undefined
          ? null
          : Number(item.totalPowerDraw),
      gpuPrice: Number(item.gpu.priceUsd ?? 0),
      cpuPrice: Number(item.cpu.priceUsd ?? 0),
    }));
  }, [results]);

  const [leftId, setLeftId] = useState(options[0]?.id ?? null);
  const [rightId, setRightId] = useState(options[1]?.id ?? options[0]?.id ?? null);

  useEffect(() => {
    if (!options.length) {
      setLeftId(null);
      setRightId(null);
      return;
    }
    if (!options.find((opt) => opt.id === leftId)) {
      setLeftId(options[0].id);
    }
    if (!options.find((opt) => opt.id === rightId)) {
      setRightId(options[options.length > 1 ? 1 : 0].id);
    }
  }, [options, leftId, rightId]);

  const left = options.find((opt) => opt.id === leftId) ?? null;
  const right = options.find((opt) => opt.id === rightId) ?? null;

  const fpsDiff =
    left && right ? left.avgFps - right.avgFps : null;
  const perfPerDollarDiff =
    left && right && left.performancePerDollar !== null && right.performancePerDollar !== null
      ? left.performancePerDollar - right.performancePerDollar
      : null;
  const powerDiff =
    left && right && left.totalPowerDraw !== null && right.totalPowerDraw !== null
      ? left.totalPowerDraw - right.totalPowerDraw
      : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Compare Hardware</h2>
        <p className="text-xs text-gray-400">
          Pick two recorded setups to see how their FPS, efficiency, and power stack up.
        </p>
      </div>

      {options.length < 2 ? (
        <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-4 text-sm text-gray-400">
          Add at least two benchmark entries to compare configurations.
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-purple-200">
                Setup A
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-[#0c0b14] px-3 py-2 text-sm text-gray-200"
                value={leftId ?? ''}
                onChange={(event) => setLeftId(event.target.value)}
              >
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-purple-200">
                Setup B
              </label>
              <select
                className="w-full rounded-lg border border-white/10 bg-[#0c0b14] px-3 py-2 text-sm text-gray-200"
                value={rightId ?? ''}
                onChange={(event) => setRightId(event.target.value)}
              >
                {options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-neutral-900/70 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400">FPS difference</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {formatDifference(fpsDiff, ' FPS')}
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Positive values mean Setup A renders more frames on average.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-neutral-900/70 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400">Performance per $</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {formatDifference(perfPerDollarDiff)}
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Calculated from average FPS divided by combined CPU + GPU MSRP.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-neutral-900/70 p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400">
                Power consumption delta
              </div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {formatDifference(powerDiff, ' W')}
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Estimated from GPU board power plus CPU TDP (or test rig telemetry).
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
