'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const CANVAS_SIZE = 512;
const UNIT_SCALE = 8; // scales CS2 units to pixels for 512 canvas render

const DEFAULT_PARAMS = {
  color: '#00ff00',
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
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateConsoleString(params) {
  const { r, g, b } = parseHexColor(params.color);
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
    `cl_crosshair_drawoutline ${params.outline ? 1 : 0}`,
    `cl_crosshair_outlinethickness ${clamp(params.outline_thickness, 0, 3)}`
  ];
  return commands.join('; ');
}

function computeBars(params) {
  const thicknessPx = Math.max(1, params.thickness * UNIT_SCALE);
  const sizePx = params.size * UNIT_SCALE;
  const gapPx = params.gap * UNIT_SCALE;
  const halfThickness = thicknessPx / 2;

  const bars = [
    // left
    {
      x: -(gapPx + sizePx + halfThickness),
      y: -halfThickness,
      w: sizePx,
      h: thicknessPx
    },
    // right
    {
      x: gapPx + halfThickness,
      y: -halfThickness,
      w: sizePx,
      h: thicknessPx
    },
    // top
    {
      x: -halfThickness,
      y: -(gapPx + sizePx + halfThickness),
      w: thicknessPx,
      h: sizePx
    },
    // bottom
    {
      x: -halfThickness,
      y: gapPx + halfThickness,
      w: thicknessPx,
      h: sizePx
    }
  ];

  return bars.map(bar => ({
    x: Math.round(bar.x),
    y: Math.round(bar.y),
    w: Math.max(1, Math.round(bar.w)),
    h: Math.max(1, Math.round(bar.h))
  }));
}

function computeDot(params, thicknessPx) {
  if (!params.dot) return null;
  const dotSide =
    params.dot_size > 0
      ? Math.max(1, Math.round(params.dot_size * UNIT_SCALE * 2))
      : Math.max(2, Math.round(thicknessPx * 1.5));
  const half = dotSide / 2;
  return {
    x: Math.round(-half),
    y: Math.round(-half),
    w: dotSide,
    h: dotSide
  };
}

export default function CS2CrosshairRenderer({ initialParams = DEFAULT_PARAMS, background = '#1b1b1b' }) {
  const [params, setParams] = useState(() => ({ ...DEFAULT_PARAMS, ...initialParams }));
  const canvasRef = useRef(null);
  const consoleString = useMemo(() => generateConsoleString(params), [params]);

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

    const bars = computeBars(params);
    const thicknessPx = Math.max(1, params.thickness * UNIT_SCALE);
    const dotRect = computeDot(params, thicknessPx);
    const accentColor = toRgba(params.color, params.alpha);

    if (params.outline) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      const outline = Math.max(0, params.outline_thickness) * UNIT_SCALE;
      bars.forEach(bar => {
        ctx.fillRect(
          bar.x - outline,
          bar.y - outline,
          bar.w + outline * 2,
          bar.h + outline * 2
        );
      });
      if (dotRect) {
        ctx.fillRect(
          dotRect.x - outline,
          dotRect.y - outline,
          dotRect.w + outline * 2,
          dotRect.h + outline * 2
        );
      }
    }

    ctx.fillStyle = accentColor;
    bars.forEach(bar => {
      ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
    });

    if (dotRect) {
      ctx.fillRect(dotRect.x, dotRect.y, dotRect.w, dotRect.h);
    }

    ctx.restore();
  }, [params, background]);

  const updateParam = (key, value) => {
    setParams(prev => ({
      ...prev,
      [key]: value
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
              Tweak CS2 values and preview instantly. All sliders map one-to-one with in-game settings.
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
              />
              <span className="text-xs text-slate-400">
                {params.dot ? params.dot_size.toFixed(1) : 'Dot disabled'}
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.dot}
                onChange={event => updateParam('dot', event.target.checked)}
              />
              <span>Center Dot</span>
            </label>
            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <input
                type="checkbox"
                checked={params.outline}
                onChange={event => updateParam('outline', event.target.checked)}
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
