"use client";

import { useEffect, useMemo, useState } from "react";
import latencyData from "@/data/latencyMetrics.json";
import { PING_REGIONS } from "@/lib/pingRegions";

const COLOR_LEGEND = [
  { color: "#22c55e", label: "<=25ms" },
  { color: "#a3e635", label: "26-40ms" },
  { color: "#facc15", label: "41-60ms" },
  { color: "#f59e0b", label: "61-80ms" },
  { color: "#ef4444", label: "80ms+" },
];

const CLOUD_FLARE_DATA = latencyData?.sources?.cloudflare ?? [];
const GOOGLE_DNS_BASELINE = latencyData?.sources?.google ?? null;
const GENERATED_AT = latencyData?.generatedAt
  ? new Date(latencyData.generatedAt).toUTCString()
  : null;

function project(lon, lat, w, h) {
  const x = (lon + 180) * (w / 360);
  const y = (90 - lat) * (h / 180);
  return { x, y };
}

function colorForLatency(ms) {
  if (ms == null) return "#4b5563";
  if (ms <= 25) return "#22c55e";
  if (ms <= 40) return "#a3e635";
  if (ms <= 60) return "#facc15";
  if (ms <= 80) return "#f59e0b";
  return "#ef4444";
}

function formatLatency(value) {
  if (!Number.isFinite(value)) return "No data";
  return `${value} ms`;
}

function formatJitter(value) {
  if (!Number.isFinite(value)) return "—";
  return `${value} ms`;
}

function formatPacketLoss(value) {
  if (!Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(2)}%`;
}

export default function PingHeatmap({ height = 320, compact = false }) {
  const cloudflareData = CLOUD_FLARE_DATA;

  const { byKey, summary } = useMemo(() => {
    const incoming = new Map(cloudflareData.map((entry) => [entry.region, entry]));
    const map = {};

    PING_REGIONS.forEach((region) => {
      const metrics = incoming.get(region.key);
      map[region.key] =
        metrics ??
        {
          region: region.key,
          label: region.key,
          latencyAvg: null,
          jitterAvg: null,
          packetLoss: null,
          source: "Cloudflare Radar (Speed)",
        };
    });

    const valid = cloudflareData
      .filter((entry) => Number.isFinite(entry.latencyAvg))
      .sort((a, b) => a.latencyAvg - b.latencyAvg);

    return {
      byKey: map,
      summary: {
        best: valid[0] ?? null,
        topThree: valid.slice(0, 3),
        coverage: {
          withData: valid.length,
          total: PING_REGIONS.length,
        },
      },
    };
  }, [cloudflareData]);

  const defaultActive = useMemo(() => {
    if (summary.best?.region) return summary.best.region;
    if (cloudflareData[0]?.region) return cloudflareData[0].region;
    return PING_REGIONS[0]?.key ?? null;
  }, [summary.best, cloudflareData]);
  const [active, setActive] = useState(defaultActive);

  useEffect(() => {
    if (!active && defaultActive) {
      setActive(defaultActive);
    }
  }, [active, defaultActive]);

  const activeMetrics = active ? byKey[active] ?? null : null;

  const view = { w: 960, h: 480 };

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900 p-4">
      <div className="flex flex-wrap items-start gap-2">
        <div>
          <div className="font-semibold text-purple-100">Global Ping Heatmap</div>
          <div className="text-xs text-gray-400">
            {GENERATED_AT ? `Updated ${GENERATED_AT}` : "Awaiting latency metrics"}
          </div>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          {GOOGLE_DNS_BASELINE && Number.isFinite(GOOGLE_DNS_BASELINE.avgResolutionMs) ? (
            <span>Google DNS baseline: {GOOGLE_DNS_BASELINE.avgResolutionMs} ms</span>
          ) : (
            <span>Google DNS baseline unavailable</span>
          )}
        </div>
      </div>

      <div
        className={`mt-3 grid gap-4 ${
          compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr,280px]"
        }`}
      >
        <div className="overflow-hidden rounded-lg border border-white/10 bg-neutral-950">
          <svg viewBox={`0 0 ${view.w} ${view.h}`} className="w-full" style={{ height }}>
            <rect width={view.w} height={view.h} className="fill-[#0a0a0f]" />
            <g className="fill-neutral-800">
              <path d="M45,210 L120,180 L210,190 L260,210 L320,210 L360,195 L415,210 L455,200 L505,210 L525,240 L505,270 L450,290 L360,300 L280,280 L220,290 L150,280 L70,250 L45,230 Z" />
              <path d="M520,170 L560,155 L600,170 L630,185 L660,210 L645,230 L610,235 L580,220 L555,205 Z" />
              <path d="M350,150 L380,140 L410,150 L430,160 L410,170 L380,170 Z" />
              <path d="M700,240 L740,255 L760,275 L740,295 L700,300 L670,285 L675,260 Z" />
            </g>

            {PING_REGIONS.map((region) => {
              const point = project(region.lon, region.lat, view.w, view.h);
              const metrics = byKey[region.key];
              const fill = colorForLatency(metrics?.latencyAvg);
              const isActive = active === region.key;

              return (
                <g
                  key={region.key}
                  className="cursor-pointer"
                  onMouseEnter={() => setActive(region.key)}
                  onClick={() => setActive(region.key)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Region ${region.key}`}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") setActive(region.key);
                  }}
                  onFocus={() => setActive(region.key)}
                >
                  <circle cx={point.x} cy={point.y} r={26} fill="transparent" />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={18}
                    fill={fill}
                    stroke={isActive ? "#c084fc" : "#111827"}
                    strokeWidth={isActive ? 4 : 2}
                  />
                  <text x={point.x + 22} y={point.y + 6} className="text-[13px] fill-gray-200">
                    {metrics?.label ?? region.key}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="px-3 pb-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>Legend:</span>
              {COLOR_LEGEND.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {summary.coverage.withData} of {summary.coverage.total} regions have live Cloudflare latency samples.
            </div>
          </div>
        </div>

        {compact ? (
          <div className="space-y-3 rounded-lg border border-white/10 bg-neutral-950 p-3 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-300">
              Quick stats
            </div>

            {summary.best ? (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                <div className="text-xs uppercase tracking-wide text-green-300">
                  Lowest average latency
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {summary.best.label ?? summary.best.region}: {formatLatency(summary.best.latencyAvg)}
                </div>
                <div className="mt-1 text-xs text-gray-200">
                  Jitter {formatJitter(summary.best.jitterAvg)} - Packet loss {formatPacketLoss(summary.best.packetLoss)}
                </div>
              </div>
            ) : (
              <div className="text-gray-400">No latency data yet.</div>
            )}

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                Top regions
              </div>
              <ul className="mt-2 space-y-2 text-gray-200">
                {summary.topThree.length ? (
                  summary.topThree.map((entry) => (
                    <li key={entry.region} className="flex justify-between text-sm">
                      <span>{entry.label ?? entry.region}</span>
                      <span className="text-purple-200">{formatLatency(entry.latencyAvg)}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Waiting for Cloudflare data.</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-neutral-950 p-3">
            <div className="font-semibold">Region details</div>
            {activeMetrics ? (
              <div className="mt-2 text-sm text-gray-200 space-y-2">
                <div>
                  <div className="text-gray-400">Region</div>
                  <div className="font-semibold text-white">
                    {activeMetrics.label ?? activeMetrics.region ?? active}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Average latency</div>
                  <div className="font-semibold text-white">{formatLatency(activeMetrics.latencyAvg)}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-gray-400">Jitter</div>
                    <div className="font-semibold text-white">{formatJitter(activeMetrics.jitterAvg)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Packet loss</div>
                    <div className="font-semibold text-white">{formatPacketLoss(activeMetrics.packetLoss)}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Source - {activeMetrics.source ?? "Cloudflare Radar"}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-400">Hover or click a region to see latency metrics.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
