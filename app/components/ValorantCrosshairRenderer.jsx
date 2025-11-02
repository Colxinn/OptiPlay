'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const CANVAS_SIZE = 512;
const RENDER_SCALE = 2;
const BASE_MULTIPLIER = 2;
const PREVIEW_ZOOM = CANVAS_SIZE / 160;

const DEFAULT_PARAMS = {
  color: '#00FF88',
  center_dot: false,
  center_dot_size: 2,
  center_dot_opacity: 1,
  inner_lines_length: 6,
  inner_lines_thickness: 2,
  inner_lines_offset: 2,
  inner_lines_opacity: 1,
  outer_lines_length: 2,
  outer_lines_thickness: 2,
  outer_lines_offset: 10,
  outer_lines_opacity: 0.35,
  outline: true,
  outline_thickness: 1,
  firing_error: false,
  movement_error: false,
  show_inner: true,
  show_outer: true
};

// Valorant color codes
const VALORANT_COLORS = {
  '#FFFFFF': '0',  // White
  '#00FF00': '1',  // Green
  '#FFFF00': '2',  // Yellow/Chartreuse
  '#00FFFF': '3',  // Cyan
  '#FF00FF': '4',  // Pink/Magenta
  '#FF0000': '5',  // Red
  '#0000FF': '6',  // Blue
  '#000000': '7',  // Black
};

function getClosestValorantColor(hexColor) {
  const color = parseHexColor(hexColor);
  let closestColor = '1'; // Default to green
  let minDistance = Infinity;

  for (const [hex, code] of Object.entries(VALORANT_COLORS)) {
    const valorantColor = parseHexColor(hex);
    const distance = Math.sqrt(
      Math.pow(color.r - valorantColor.r, 2) +
      Math.pow(color.g - valorantColor.g, 2) +
      Math.pow(color.b - valorantColor.b, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = code;
    }
  }
  
  return closestColor;
}

function generateValorantCode(params) {
  const colorCode = getClosestValorantColor(params.color);
  
  // Valorant uses 0-1 scale for most values
  const parts = [
    '0', // Profile version
    colorCode, // Color
    params.outline ? '1' : '0', // Outlines
    params.center_dot ? '1' : '0', // Center dot
    params.outline_thickness.toFixed(0), // Outline opacity (uses thickness as proxy)
    params.center_dot_opacity.toFixed(2), // Center dot opacity
    params.center_dot_size.toFixed(0), // Center dot thickness
    params.show_inner ? '1' : '0', // Show inner lines
    params.inner_lines_opacity.toFixed(2), // Inner line opacity
    params.inner_lines_length.toFixed(0), // Inner line length
    params.inner_lines_thickness.toFixed(0), // Inner line thickness  
    params.inner_lines_offset.toFixed(0), // Inner line offset
    params.movement_error ? '1' : '0', // Movement error
    params.firing_error ? '1' : '0', // Firing error
    params.show_outer ? '1' : '0', // Show outer lines
    params.outer_lines_opacity.toFixed(2), // Outer line opacity
    params.outer_lines_length.toFixed(0), // Outer line length
    params.outer_lines_thickness.toFixed(0), // Outer line thickness
    params.outer_lines_offset.toFixed(0), // Outer line offset
    '1', // Fade
    '1', // Movement error
    '1', // Firing error  
  ];
  
  return parts.join(';');
}

function formatSummary(params) {
  const valorantCode = generateValorantCode(params);
  return [
    `=== VALORANT CROSSHAIR CODE ===`,
    valorantCode,
    ``,
    `=== Settings Breakdown ===`,
    `Color: ${parseHexColor(params.color).hex}`,
    `Center Dot: ${params.center_dot ? `On (size ${params.center_dot_size.toFixed(0)}, opacity ${params.center_dot_opacity.toFixed(2)})` : 'Off'}`,
    `Inner Lines: ${params.show_inner ? 'On' : 'Off'} — length ${params.inner_lines_length.toFixed(0)}, thickness ${params.inner_lines_thickness.toFixed(0)}, offset ${params.inner_lines_offset.toFixed(0)}, opacity ${params.inner_lines_opacity.toFixed(2)}`,
    `Outer Lines: ${params.show_outer ? 'On' : 'Off'} — length ${params.outer_lines_length.toFixed(0)}, thickness ${params.outer_lines_thickness.toFixed(0)}, offset ${params.outer_lines_offset.toFixed(0)}, opacity ${params.outer_lines_opacity.toFixed(2)}`,
    `Outline: ${params.outline ? `On (thickness ${params.outline_thickness.toFixed(0)})` : 'Off'}`,
    `Movement Error: ${params.movement_error ? 'On' : 'Off'}`,
    `Firing Error: ${params.firing_error ? 'On' : 'Off'}`,
    ``,
    `Copy the code above and paste it into Valorant's crosshair import field!`
  ].join('\n');
}

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

function buildBars(length, thickness, offset, scale, snap, minUnit) {
  if (length <= 0 || thickness <= 0) return [];

  const lengthPx = Math.max(0, length) * scale;
  const thicknessPx = Math.max(minUnit, thickness * scale);
  const offsetPx = Math.max(0, offset) * scale;
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
    x: snap(bar.x),
    y: snap(bar.y),
    w: Math.max(minUnit, snap(bar.x + bar.w) - snap(bar.x)),
    h: Math.max(minUnit, snap(bar.y + bar.h) - snap(bar.y))
  }));
}

function buildDot(params, scale, snap, minUnit) {
  if (!params.center_dot || params.center_dot_opacity <= 0) return null;
  const side = Math.max(minUnit * 2, params.center_dot_size * scale);
  const half = side / 2;
  return {
    x: snap(-half),
    y: snap(-half),
    w: Math.max(minUnit, snap(half) - snap(-half)),
    h: Math.max(minUnit, snap(half) - snap(-half))
  };
}

export default function ValorantCrosshairRenderer({ initialParams = DEFAULT_PARAMS, background = '#1b1b1b' }) {
  const [params, setParams] = useState(() => ({ ...DEFAULT_PARAMS, ...initialParams }));
  const canvasRef = useRef(null);
  const exportSummary = useMemo(() => formatSummary(params), [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const pixelScale = dpr * RENDER_SCALE;
    canvas.width = CANVAS_SIZE * pixelScale;
    canvas.height = CANVAS_SIZE * pixelScale;
    canvas.style.width = `${CANVAS_SIZE}px`;
    canvas.style.height = `${CANVAS_SIZE}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snap = value => Math.round(value * pixelScale) / pixelScale;
    const minUnit = 1 / pixelScale;

    ctx.save();
    ctx.scale(pixelScale, pixelScale);
    ctx.imageSmoothingEnabled = true;

    ctx.fillStyle = background || '#1b1b1b';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    const viewport = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const scale = (viewport / 1080) * BASE_MULTIPLIER * PREVIEW_ZOOM;
    const dotRadiusUnits = params.center_dot ? params.center_dot_size / 2 : 0;

    const innerBars = params.show_inner ? buildBars(
      params.inner_lines_length,
      params.inner_lines_thickness,
      params.inner_lines_offset + dotRadiusUnits,
      scale,
      snap,
      minUnit
    ) : [];

    const outerBars = params.show_outer ? buildBars(
      params.outer_lines_length,
      params.outer_lines_thickness,
      params.outer_lines_offset + dotRadiusUnits,
      scale,
      snap,
      minUnit
    ) : [];

    const dotRect = buildDot(params, scale, snap, minUnit);
    const outlineThicknessPx = params.outline ? Math.max(params.outline_thickness * scale, minUnit) : 0;
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
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const code = generateValorantCode(params);
                navigator.clipboard?.writeText(code);
              }}
              className="flex-1 text-xs uppercase tracking-wide px-4 py-2 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 hover:from-purple-600/30 hover:to-fuchsia-600/30 transition font-semibold"
            >
              📋 Copy Import Code
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(exportSummary)}
              className="text-xs uppercase tracking-wide px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              Copy All Settings
            </button>
          </div>
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

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.outline}
                onChange={event => updateParams({ outline: event.target.checked })}
              />
              <span>Outline</span>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.show_inner}
                onChange={event => updateParams({ show_inner: event.target.checked })}
              />
              <span>Show Inner Lines</span>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.show_outer}
                onChange={event => updateParams({ show_outer: event.target.checked })}
              />
              <span>Show Outer Lines</span>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.movement_error}
                onChange={event => updateParams({ movement_error: event.target.checked })}
              />
              <span>Movement Error</span>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.firing_error}
                onChange={event => updateParams({ firing_error: event.target.checked })}
              />
              <span>Firing Error</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Center Dot Size</span>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={params.center_dot_size}
                onChange={event => handleRange('center_dot_size', 1, 8, event.target.value)}
                disabled={!params.center_dot}
              />
              <span className="text-xs text-slate-400">
                {params.center_dot ? params.center_dot_size.toFixed(0) : 'Dot disabled'}
              </span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Center Dot Opacity</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={params.center_dot_opacity}
                onChange={event => handleRange('center_dot_opacity', 0, 1, event.target.value)}
                disabled={!params.center_dot}
              />
              <span className="text-xs text-slate-400">
                {params.center_dot ? params.center_dot_opacity.toFixed(2) : 'Dot disabled'}
              </span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Outline Thickness</span>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={params.outline_thickness}
                onChange={event => handleRange('outline_thickness', 1, 3, event.target.value)}
                disabled={!params.outline}
              />
              <span className="text-xs text-slate-400">
                {params.outline ? params.outline_thickness.toFixed(0) : 'Outline disabled'}
              </span>
            </label>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-purple-200">Inner Lines</h3>
            <div className="grid md:grid-cols-2 gap-4">

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
            </div>
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
