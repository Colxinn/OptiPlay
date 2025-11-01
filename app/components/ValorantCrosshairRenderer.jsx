'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const CANVAS_SIZE = 512;
const UNIT_SCALE = 10; // converts Valorant slider units to pixels for 512 canvas render

const DEFAULT_PARAMS = {
  color: '#00FF88',
  center_dot: false,
  center_dot_size: 2,
  center_dot_opacity: 1,
  inner_lines_length: 6,
  inner_lines_thickness: 2,
  inner_lines_offset: 2,
  inner_lines_opacity: 1,
  outer_lines_length: 5,
  outer_lines_thickness: 1,
  outer_lines_offset: 4,
  outer_lines_opacity: 0.35,
  outline: true,
  outline_thickness: 1
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseHexColor(hex) {
  const sanitized = (hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) {
    return { r: 0, g: 255, b: 136, hex: '#00FF88' };
  }
  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16),
    hex: `#${sanitized.toUpperCase()}`
  };
}

function rgba(hex, opacity) {
  const { r, g, b } = parseHexColor(hex);
  const alpha = clamp(opacity, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildBars(length, thickness, offset) {
  if (length <= 0 || thickness <= 0) return [];

  const lengthPx = Math.max(0, length) * UNIT_SCALE;
  const thicknessPx = Math.max(1, thickness * UNIT_SCALE);
  const offsetPx = Math.max(0, offset) * UNIT_SCALE;
  const halfThickness = thicknessPx / 2;

  const bars = [
    {
      x: -(offsetPx + lengthPx),
      y: -halfThickness,
      w: lengthPx,
      h: thicknessPx
    },
    {
      x: offsetPx,
      y: -halfThickness,
      w: lengthPx,
      h: thicknessPx
    },
    {
      x: -halfThickness,
      y: -(offsetPx + lengthPx),
      w: thicknessPx,
      h: lengthPx
    },
    {
      x: -halfThickness,
      y: offsetPx,
      w: thicknessPx,
      h: lengthPx
    }
  ];

  return bars.map(bar => ({
    x: Math.round(bar.x),
    y: Math.round(bar.y),
    w: Math.max(1, Math.round(bar.w)),
    h: Math.max(1, Math.round(bar.h))
  }));
}

function buildDot(params) {
  if (!params.center_dot || params.center_dot_opacity <= 0) return null;
  const baseSide = Math.max(1, params.center_dot_size) * UNIT_SCALE;
  const side = Math.max(2, Math.round(baseSide));
  const half = side / 2;
  return {
    x: Math.round(-half),
    y: Math.round(-half),
    w: side,
    h: side
  };
}

function formatSummary(params) {
  return [
    `Color: ${parseHexColor(params.color).hex}`,
    `Center Dot: ${params.center_dot ? `On (size ${params.center_dot_size.toFixed(1)}, opacity ${params.center_dot_opacity.toFixed(2)})` : 'Off'}`,
    `Inner Lines — length ${params.inner_lines_length.toFixed(1)}, thickness ${params.inner_lines_thickness.toFixed(1)}, offset ${params.inner_lines_offset.toFixed(1)}, opacity ${params.inner_lines_opacity.toFixed(2)}`,
    `Outer Lines — length ${params.outer_lines_length.toFixed(1)}, thickness ${params.outer_lines_thickness.toFixed(1)}, offset ${params.outer_lines_offset.toFixed(1)}, opacity ${params.outer_lines_opacity.toFixed(2)}`,
    `Outline: ${params.outline ? `On (thickness ${params.outline_thickness.toFixed(1)})` : 'Off'}`
  ].join('\n');
}

export default function ValorantCrosshairRenderer({ initialParams = DEFAULT_PARAMS, background = '#1b1b1b' }) {
  const [params, setParams] = useState(() => ({ ...DEFAULT_PARAMS, ...initialParams }));
  const canvasRef = useRef(null);
  const exportSummary = useMemo(() => formatSummary(params), [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const renderSize = CANVAS_SIZE * dpr;
    canvas.width = renderSize;
    canvas.height = renderSize;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = background || '#1b1b1b';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    const innerBars = buildBars(params.inner_lines_length, params.inner_lines_thickness, params.inner_lines_offset);
    const outerBars = buildBars(params.outer_lines_length, params.outer_lines_thickness, params.outer_lines_offset);
    const dotRect = buildDot(params);
    const outlineThicknessPx = params.outline ? params.outline_thickness * UNIT_SCALE * 0.6 : 0;

    const drawBars = (bars, opacity) => {
      if (!bars.length || opacity <= 0) return;

      if (outlineThicknessPx > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.9, opacity + 0.25)})`;
        bars.forEach(bar => {
          ctx.fillRect(
            bar.x - outlineThicknessPx,
            bar.y - outlineThicknessPx,
            bar.w + outlineThicknessPx * 2,
            bar.h + outlineThicknessPx * 2
          );
        });
      }

      ctx.fillStyle = rgba(params.color, opacity);
      bars.forEach(bar => ctx.fillRect(bar.x, bar.y, bar.w, bar.h));
    };

    // Outer lines first, then inner lines for stacking
    drawBars(outerBars, params.outer_lines_opacity);
    drawBars(innerBars, params.inner_lines_opacity);

    if (dotRect && params.center_dot_opacity > 0) {
      if (outlineThicknessPx > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.9, params.center_dot_opacity + 0.25)})`;
        ctx.fillRect(
          dotRect.x - outlineThicknessPx,
          dotRect.y - outlineThicknessPx,
          dotRect.w + outlineThicknessPx * 2,
          dotRect.h + outlineThicknessPx * 2
        );
      }

      ctx.fillStyle = rgba(params.color, params.center_dot_opacity);
      ctx.fillRect(dotRect.x, dotRect.y, dotRect.w, dotRect.h);
    }

    ctx.restore();
  }, [params, background]);

  const { hex } = parseHexColor(params.color);

  const updateParams = updates => {
    setParams(prev => ({ ...prev, ...updates }));
  };

  const handleRange = (key, min, max, value) => {
    updateParams({ [key]: clamp(Number(value), min, max) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col gap-4">
          <canvas
            ref={canvasRef}
            className="w-[512px] h-[512px] max-w-full rounded-xl border border-white/10 bg-[#05070f] shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
          />
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(exportSummary)}
            className="self-start text-xs uppercase tracking-wide px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Copy Valorant Settings
          </button>
        </div>

        <div className="flex-1 space-y-5 text-sm">
          <div>
            <h2 className="text-lg font-semibold">Valorant Parameters</h2>
            <p className="text-sm text-slate-400">
              Mirrors the in-game crosshair panel for primary scope. Adjust sliders to see a pixel-accurate preview.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-300">Color</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={hex}
                  onChange={event => updateParams({ color: event.target.value })}
                  className="h-10 w-12 border border-white/10 rounded"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={event => updateParams({ color: event.target.value })}
                  className="flex-1 bg-[#090b16] border border-white/10 rounded px-2 py-1 font-mono text-xs uppercase"
                />
              </div>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.center_dot}
                onChange={event => updateParams({ center_dot: event.target.checked })}
              />
              <span>Center Dot</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Center Dot Size</span>
              <input
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={params.center_dot_size}
                onChange={event => handleRange('center_dot_size', 0, 4, event.target.value)}
                disabled={!params.center_dot}
              />
              <span className="text-xs text-slate-400">
                {params.center_dot ? params.center_dot_size.toFixed(1) : 'Dot disabled'}
              </span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Center Dot Opacity</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.center_dot_opacity}
                onChange={event => handleRange('center_dot_opacity', 0, 1, event.target.value)}
                disabled={!params.center_dot}
              />
              <span className="text-xs text-slate-400">
                {params.center_dot ? params.center_dot_opacity.toFixed(2) : 'Dot disabled'}
              </span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Inner Length</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={params.inner_lines_length}
                onChange={event => handleRange('inner_lines_length', 0, 10, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.inner_lines_length.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Inner Thickness</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={params.inner_lines_thickness}
                onChange={event => handleRange('inner_lines_thickness', 0, 10, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.inner_lines_thickness.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Inner Offset</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={params.inner_lines_offset}
                onChange={event => handleRange('inner_lines_offset', 0, 10, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.inner_lines_offset.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Inner Opacity</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.inner_lines_opacity}
                onChange={event => handleRange('inner_lines_opacity', 0, 1, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.inner_lines_opacity.toFixed(2)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Outer Length</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={params.outer_lines_length}
                onChange={event => handleRange('outer_lines_length', 0, 10, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.outer_lines_length.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Outer Thickness</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={params.outer_lines_thickness}
                onChange={event => handleRange('outer_lines_thickness', 0, 10, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.outer_lines_thickness.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Outer Offset</span>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={params.outer_lines_offset}
                onChange={event => handleRange('outer_lines_offset', 0, 20, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.outer_lines_offset.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Outer Opacity</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={params.outer_lines_opacity}
                onChange={event => handleRange('outer_lines_opacity', 0, 1, event.target.value)}
              />
              <span className="text-xs text-slate-400">{params.outer_lines_opacity.toFixed(2)}</span>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.outline}
                onChange={event => updateParams({ outline: event.target.checked })}
              />
              <span>Outline</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Outline Thickness</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={params.outline_thickness}
                onChange={event => handleRange('outline_thickness', 0, 2, event.target.value)}
                disabled={!params.outline}
              />
              <span className="text-xs text-slate-400">
                {params.outline ? params.outline_thickness.toFixed(2) : 'Outline disabled'}
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setParams(DEFAULT_PARAMS)}
            className="text-xs uppercase tracking-wide px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Reset to Default
          </button>

          <div className="bg-[#090b16] border border-white/10 rounded-lg p-4 text-xs font-mono text-purple-200 leading-relaxed whitespace-pre-wrap">
            {exportSummary}
          </div>
        </div>
      </div>
    </div>
  );
}
