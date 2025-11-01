'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const CANVAS_SIZE = 512;
const RENDER_SCALE = 2; // draw at 2× then downsample for crisp edges

// Calibrated multipliers approximating Source 2 crosshair units.
const LENGTH_SCALE = 9.5;
const GAP_SCALE = 9.5;
const THICKNESS_SCALE = 3.8;
const OUTLINE_SCALE = 2.2;
const DOT_SCALE = THICKNESS_SCALE * 1.35;

const DEFAULT_PARAMS = {
  color: '#00FF00',
  alpha: 255,
  style: 4,
  size: 4,
  gap: -1,
  thickness: 1.5,
  dot: false,
  dot_size: 0,
  outline: true,
  outline_thickness: 1
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseHexColor(hex) {
  const sanitized = (hex || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) {
    return { r: 0, g: 255, b: 0, hex: '#00FF00' };
  }
  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16),
    hex: `#${sanitized.toUpperCase()}`
  };
}

function toRgba(color, alpha255) {
  const { r, g, b } = parseHexColor(color);
  const alpha = clamp(alpha255, 0, 255) / 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

function generateConsoleString(params) {
  const { r, g, b } = parseHexColor(params.color);
  const outlineEnabled = params.outline && params.outline_thickness > 0;
  const commands = [
    `cl_crosshairstyle ${params.style}`,
    `cl_crosshairsize ${clamp(params.size, -100, 100)}`,
    `cl_crosshairgap ${clamp(params.gap, -100, 100)}`,
    `cl_crosshairthickness ${clamp(params.thickness, 0, 10)}`,
    `cl_crosshairdot ${params.dot ? 1 : 0}`,
    `cl_crosshairalpha ${clamp(params.alpha, 0, 255)}`,
    'cl_crosshairusealpha 1',
    'cl_crosshaircolor 5',
    `cl_crosshaircolor_r ${r}`,
    `cl_crosshaircolor_g ${g}`,
    `cl_crosshaircolor_b ${b}`,
    `cl_crosshair_drawoutline ${outlineEnabled ? 1 : 0}`,
    `cl_crosshair_outlinethickness ${outlineEnabled ? clamp(params.outline_thickness, 0, 3) : 0}`
  ];
  return commands.join('; ');
}

function snapFactory(pixelScale) {
  return value => Math.round(value * pixelScale) / pixelScale;
}

function snapRect(x, y, width, height, snap, minUnit) {
  const x1 = snap(x);
  const y1 = snap(y);
  const x2 = snap(x + width);
  const y2 = snap(y + height);
  const rectWidth = Math.max(minUnit, x2 - x1);
  const rectHeight = Math.max(minUnit, y2 - y1);
  return { x: x1, y: y1, w: rectWidth, h: rectHeight };
}

function expandRect(rect, amount, snap, minUnit) {
  return snapRect(
    rect.x - amount,
    rect.y - amount,
    rect.w + amount * 2,
    rect.h + amount * 2,
    snap,
    minUnit
  );
}

function computeBars(params, snap, minUnit) {
  const thicknessPx = Math.max(params.thickness * THICKNESS_SCALE, minUnit);
  const lengthPx = Math.max(params.size * LENGTH_SCALE, 0);
  const gapPx = params.gap * GAP_SCALE;
  const halfThickness = thicknessPx / 2;

  const bars = [
    snapRect(-(gapPx + lengthPx), -halfThickness, lengthPx, thicknessPx, snap, minUnit),
    snapRect(gapPx, -halfThickness, lengthPx, thicknessPx, snap, minUnit),
    snapRect(-halfThickness, -(gapPx + lengthPx), thicknessPx, lengthPx, snap, minUnit),
    snapRect(-halfThickness, gapPx, thicknessPx, lengthPx, snap, minUnit)
  ];

  return { bars, thicknessPx };
}

function computeDot(params, thicknessPx, snap, minUnit) {
  if (!params.dot) return null;
  const side = params.dot_size > 0
    ? Math.max(params.dot_size * DOT_SCALE, minUnit * 2)
    : Math.max(thicknessPx, minUnit * 2);
  return snapRect(-side / 2, -side / 2, side, side, snap, minUnit);
}

export default function CS2CrosshairRenderer({ initialParams = DEFAULT_PARAMS, background = '#1b1b1b' }) {
  const [params, setParams] = useState(() => ({ ...DEFAULT_PARAMS, ...initialParams }));
  const canvasRef = useRef(null);
  const consoleString = useMemo(() => generateConsoleString(params), [params]);

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

    const snap = snapFactory(pixelScale);
    const minUnit = 1 / pixelScale;

    ctx.save();
    ctx.scale(pixelScale, pixelScale);
    ctx.imageSmoothingEnabled = true;

    ctx.fillStyle = background || '#1b1b1b';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    const { bars, thicknessPx } = computeBars(params, snap, minUnit);
    const dotRect = computeDot(params, thicknessPx, snap, minUnit);
    const outlinePx = params.outline && params.outline_thickness > 0
      ? Math.max(params.outline_thickness * OUTLINE_SCALE, minUnit)
      : 0;

    if (outlinePx > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      bars.forEach(bar => {
        const expanded = expandRect(bar, outlinePx, snap, minUnit);
        ctx.fillRect(expanded.x, expanded.y, expanded.w, expanded.h);
      });
      if (dotRect) {
        const expandedDot = expandRect(dotRect, outlinePx, snap, minUnit);
        ctx.fillRect(expandedDot.x, expandedDot.y, expandedDot.w, expandedDot.h);
      }
    }

    ctx.fillStyle = toRgba(params.color, params.alpha);
    ctx.shadowColor = toRgba(params.color, Math.min(params.alpha, 255) * 0.4);
    ctx.shadowBlur = 1.5;
    bars.forEach(bar => ctx.fillRect(bar.x, bar.y, bar.w, bar.h));
    ctx.shadowBlur = 0;

    if (dotRect) {
      ctx.fillRect(dotRect.x, dotRect.y, dotRect.w, dotRect.h);
    }

    ctx.restore();
  }, [params, background]);

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const toggleDot = enabled => {
    setParams(prev => ({
      ...prev,
      dot: enabled,
      dot_size:
        enabled && prev.dot_size <= 0
          ? Math.max(prev.thickness, DEFAULT_PARAMS.thickness)
          : prev.dot_size
    }));
  };

  const toggleOutline = enabled => {
    setParams(prev => ({
      ...prev,
      outline: enabled,
      outline_thickness:
        enabled && prev.outline_thickness <= 0
          ? DEFAULT_PARAMS.outline_thickness
          : prev.outline_thickness
    }));
  };

  const { hex } = parseHexColor(params.color);

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
            onClick={() => navigator.clipboard?.writeText(consoleString)}
            className="self-start text-xs uppercase tracking-wide px-3 py-1.5 rounded border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Copy Console Command
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Crosshair Parameters</h2>
            <p className="text-sm text-slate-400">
              Matches Counter-Strike 2&apos;s classic static crosshair with calibrated unit scaling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-300">Color</span>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={hex}
                  onChange={event => updateParam('color', event.target.value)}
                  className="h-10 w-12 border border-white/10 rounded"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={event => updateParam('color', event.target.value)}
                  className="flex-1 bg-[#090b16] border border-white/10 rounded px-2 py-1 font-mono text-xs uppercase"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Alpha</span>
              <input
                type="range"
                min="0"
                max="255"
                value={params.alpha}
                onChange={event => updateParam('alpha', Number(event.target.value))}
              />
              <span className="text-xs text-slate-400">{params.alpha}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Size</span>
              <input
                type="range"
                min="0"
                max="12"
                step="0.1"
                value={params.size}
                onChange={event => updateParam('size', Number(event.target.value))}
              />
              <span className="text-xs text-slate-400">{params.size.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Gap</span>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={params.gap}
                onChange={event => updateParam('gap', Number(event.target.value))}
              />
              <span className="text-xs text-slate-400">{params.gap.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Thickness</span>
              <input
                type="range"
                min="0.1"
                max="6"
                step="0.1"
                value={params.thickness}
                onChange={event => updateParam('thickness', Number(event.target.value))}
              />
              <span className="text-xs text-slate-400">{params.thickness.toFixed(1)}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Dot Size</span>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={params.dot_size}
                onChange={event => updateParam('dot_size', Number(event.target.value))}
                disabled={!params.dot}
              />
              <span className="text-xs text-slate-400">
                {params.dot ? params.dot_size.toFixed(1) : 'Dot disabled'}
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.dot}
                onChange={event => toggleDot(event.target.checked)}
              />
              <span>Center Dot</span>
            </label>

            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.outline}
                onChange={event => toggleOutline(event.target.checked)}
              />
              <span>Outline</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-slate-300">Outline Thickness</span>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={params.outline_thickness}
                onChange={event => updateParam('outline_thickness', Number(event.target.value))}
                disabled={!params.outline}
              />
              <span className="text-xs text-slate-400">
                {params.outline ? params.outline_thickness.toFixed(1) : 'Outline disabled'}
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

          <div className="bg-[#090b16] border border-white/10 rounded-lg p-4 text-xs font-mono text-green-300 leading-relaxed break-words">
            {consoleString}
          </div>
        </div>
      </div>
    </div>
  );
}
