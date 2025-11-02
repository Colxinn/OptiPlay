'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const CANVAS_SIZE = 512;
const SUPPORTED_GAMES = ['Valorant', 'Counter-Strike 2', 'Apex Legends'];

const DEFAULT_CONFIG = {
  game: 'Valorant',
  params: {
    color: '#00FFFF',
    center_dot: true,
    center_dot_opacity: 1,
    center_dot_size: 2,
    inner_lines_length: 6,
    inner_lines_thickness: 2,
    inner_lines_opacity: 1,
    inner_lines_offset: 2,
    outer_lines_length: 5,
    outer_lines_thickness: 1,
    outer_lines_opacity: 0.6,
    outer_lines_offset: 4,
    outline_thickness: 0,
    outline_opacity: 0,
    scale: 14
  },
  background: {
    type: 'color',
    value: '#111320'
  }
};

function clipUnit(value, fallback, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  if (typeof min === 'number') {
    if (numeric < min) return min;
  }
  if (typeof max === 'number') {
    if (numeric > max) return max;
  }
  return numeric;
}

function sanitizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(lowered)) return true;
    if (['0', 'false', 'no', 'off'].includes(lowered)) return false;
  }
  return fallback;
}

function normalizeConfig(input) {
  const config = { ...DEFAULT_CONFIG, ...(input ?? {}) };
  const normalizedGame = SUPPORTED_GAMES.includes(config.game)
    ? config.game
    : DEFAULT_CONFIG.game;

  const params = {
    ...DEFAULT_CONFIG.params,
    ...(config.params ?? {})
  };

  const numericKeys = [
    'center_dot_opacity',
    'center_dot_size',
    'inner_lines_length',
    'inner_lines_thickness',
    'inner_lines_opacity',
    'inner_lines_offset',
    'outer_lines_length',
    'outer_lines_thickness',
    'outer_lines_opacity',
    'outer_lines_offset',
    'outline_thickness',
    'outline_opacity',
    'scale'
  ];

  for (const key of numericKeys) {
    params[key] = clipUnit(params[key], DEFAULT_CONFIG.params[key], 0, undefined);
  }

  const color =
    typeof params.color === 'string' && /^#?[0-9a-fA-F]{6}$/.test(params.color)
      ? params.color.startsWith('#')
        ? params.color.toUpperCase()
        : `#${params.color.toUpperCase()}`
      : DEFAULT_CONFIG.params.color;

  params.color = color;
  params.center_dot = sanitizeBoolean(params.center_dot, DEFAULT_CONFIG.params.center_dot);
  params.lock_outline = sanitizeBoolean(params.lock_outline, false);
  params.t_style = sanitizeBoolean(params.t_style, false);

  const background = (() => {
    const raw = config.background ?? DEFAULT_CONFIG.background;
    if (raw?.type === 'image' && typeof raw.data_base64 === 'string' && raw.data_base64.length) {
      return { type: 'image', data_base64: raw.data_base64 };
    }
    if (raw?.type === 'color' && typeof raw.value === 'string') {
      const value = /^#?[0-9a-fA-F]{6}$/.test(raw.value)
        ? raw.value.startsWith('#')
          ? raw.value.toUpperCase()
          : `#${raw.value.toUpperCase()}`
        : DEFAULT_CONFIG.background.value;
      return { type: 'color', value };
    }
    return DEFAULT_CONFIG.background;
  })();

  return {
    game: normalizedGame,
    params,
    background
  };
}

function hexToRgb(hex) {
  const sanitized = hex.replace('#', '');
  const isValid = /^[0-9a-fA-F]{6}$/.test(sanitized);
  if (!isValid) return { r: 0, g: 255, b: 0 };
  return {
    r: parseInt(sanitized.slice(0, 2), 16),
    g: parseInt(sanitized.slice(2, 4), 16),
    b: parseInt(sanitized.slice(4, 6), 16)
  };
}

function rgba(color, opacity = 1) {
  const { r, g, b } = hexToRgb(color);
  const alpha = Math.min(Math.max(opacity, 0), 1);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatNumber(value, digits = 2) {
  if (!Number.isFinite(value)) return '0';
  return Number(value).toFixed(digits).replace(/\.?0+$/, '');
}

function generateCS2Code(params) {
  const { r, g, b } = hexToRgb(params.color);
  const lines = [
    'cl_crosshairstyle 4',
    `cl_crosshairsize ${formatNumber(params.inner_lines_length)}`,
    `cl_crosshairthickness ${formatNumber(params.inner_lines_thickness)}`,
    `cl_crosshairgap ${formatNumber(params.inner_lines_offset)}`,
    `cl_crosshairdot ${params.center_dot ? 1 : 0}`,
    'cl_crosshairusealpha 1',
    `cl_crosshairalpha ${Math.round(Math.min(Math.max(params.inner_lines_opacity, 0), 1) * 255)}`,
    'cl_crosshaircolor 5',
    `cl_crosshaircolor_r ${r}`,
    `cl_crosshaircolor_g ${g}`,
    `cl_crosshaircolor_b ${b}`,
    `cl_crosshair_t ${params.t_style ? 1 : 0}`,
    'cl_crosshair_recoil 0',
    'cl_crosshairgap_useweaponvalue 0'
  ];

  if (params.outline_thickness > 0 && params.outline_opacity > 0) {
    lines.push('cl_crosshair_drawoutline 1');
    lines.push(`cl_crosshair_outlinethickness ${formatNumber(params.outline_thickness)}`);
  } else {
    lines.push('cl_crosshair_drawoutline 0');
  }

  return lines.join('\n');
}

function generateValorantCode(params) {
  const parts = [
    `// Valorant primary crosshair configuration`,
    `color: ${params.color}`,
    `center_dot: ${params.center_dot ? 'on' : 'off'} (opacity ${formatNumber(params.center_dot_opacity)})`,
    `center_dot_size: ${formatNumber(params.center_dot_size)}`,
    `inner_lines: length=${formatNumber(params.inner_lines_length)}, thickness=${formatNumber(params.inner_lines_thickness)}, offset=${formatNumber(params.inner_lines_offset)}, opacity=${formatNumber(params.inner_lines_opacity)}`,
    `outer_lines: length=${formatNumber(params.outer_lines_length)}, thickness=${formatNumber(params.outer_lines_thickness)}, offset=${formatNumber(params.outer_lines_offset)}, opacity=${formatNumber(params.outer_lines_opacity)}`,
    params.outline_thickness > 0
      ? `outlines: on (thickness=${formatNumber(params.outline_thickness)}, opacity=${formatNumber(params.outline_opacity)})`
      : 'outlines: off',
    params.t_style ? 't_style: enabled' : 't_style: disabled'
  ];

  parts.push('');
  parts.push('# Copy each value into Valorant > Settings > Crosshair');
  return parts.join('\n');
}

function generateApexCode(params) {
  const { r, g, b } = hexToRgb(params.color);
  const commands = [
    '// Apex Legends reticle adjustments (copy into autoexec.cfg or execute in console)',
    `reticle_color "${r / 255} ${g / 255} ${b / 255}"`,
    `reticle_thickness ${formatNumber(params.inner_lines_thickness)}`,
    `reticle_center_dot ${params.center_dot ? 1 : 0}`,
    `reticle_center_dot_size ${formatNumber(params.center_dot_size || params.inner_lines_thickness)}`,
    `reticle_opacity ${formatNumber(params.inner_lines_opacity)}`,
    `reticle_outer_opacity ${formatNumber(params.outer_lines_opacity)}`
  ];
  return commands.join('\n');
}

function getCodeForGame(game, params) {
  switch (game) {
    case 'Counter-Strike 2':
      return generateCS2Code(params);
    case 'Apex Legends':
      return generateApexCode(params);
    case 'Valorant':
    default:
      return generateValorantCode(params);
  }
}

function drawCheckerboard(ctx, size) {
  const block = 32;
  for (let y = 0; y < size; y += block) {
    for (let x = 0; x < size; x += block) {
      const isDark = ((x + y) / block) % 2 === 0;
      ctx.fillStyle = isDark ? '#1A1D2A' : '#151722';
      ctx.fillRect(x, y, block, block);
    }
  }
}

function drawLineWithOutline(ctx, color, opacity, outlineThickness, outlineOpacity, rect) {
  const [x, y, width, height] = rect;
  if (outlineThickness > 0 && outlineOpacity > 0) {
    const outlineRect = [
      x - outlineThickness,
      y - outlineThickness,
      width + outlineThickness * 2,
      height + outlineThickness * 2
    ];
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(outlineOpacity, 1)})`;
    ctx.fillRect(...outlineRect);
  }
  ctx.fillStyle = rgba(color, opacity);
  ctx.fillRect(x, y, width, height);
}

export default function CrosshairEngine({ initialConfig = DEFAULT_CONFIG }) {
  const [config, setConfig] = useState(() => normalizeConfig(initialConfig));
  const [rawInput, setRawInput] = useState(() => JSON.stringify(normalizeConfig(initialConfig), null, 2));
  const [parseError, setParseError] = useState('');
  const [bgImage, setBgImage] = useState(null);
  const canvasRef = useRef(null);

  const generatedCode = useMemo(
    () => getCodeForGame(config.game, config.params),
    [config.game, config.params]
  );

  useEffect(() => {
    if (config.background.type === 'image' && config.background.data_base64) {
      const image = new Image();
      image.src = config.background.data_base64;
      image.onload = () => setBgImage(image);
      image.onerror = () => setBgImage(null);
      return () => {
        setBgImage(null);
      };
    }
    setBgImage(null);
  }, [config.background]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (config.background.type === 'color') {
      ctx.fillStyle = config.background.value;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      drawCheckerboard(ctx, CANVAS_SIZE);
    }

    ctx.imageSmoothingEnabled = true;

    const { params } = config;
    const center = CANVAS_SIZE / 2;
    const scale = params.scale || DEFAULT_CONFIG.params.scale;

    const innerOffset = params.inner_lines_offset * scale;
    const innerLength = params.inner_lines_length * scale;
    const innerThickness = Math.max(1, params.inner_lines_thickness * (scale / 6));

    const outerOffset = params.outer_lines_offset * scale;
    const outerLength = params.outer_lines_length * scale;
    const outerThickness = Math.max(1, params.outer_lines_thickness * (scale / 6));

    const outlineSize = params.outline_thickness * (scale / 6);

    // Inner lines - horizontal
    if (innerLength > 0 && innerThickness > 0 && params.inner_lines_opacity > 0) {
      drawLineWithOutline(
        ctx,
        params.color,
        params.inner_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center - innerOffset - innerLength,
          center - innerThickness / 2,
          innerLength,
          innerThickness
        ]
      );
      drawLineWithOutline(
        ctx,
        params.color,
        params.inner_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center + innerOffset,
          center - innerThickness / 2,
          innerLength,
          innerThickness
        ]
      );

      drawLineWithOutline(
        ctx,
        params.color,
        params.inner_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center - innerThickness / 2,
          center - innerOffset - innerLength,
          innerThickness,
          innerLength
        ]
      );
      drawLineWithOutline(
        ctx,
        params.color,
        params.inner_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center - innerThickness / 2,
          center + innerOffset,
          innerThickness,
          innerLength
        ]
      );
    }

    if (outerLength > 0 && outerThickness > 0 && params.outer_lines_opacity > 0) {
      drawLineWithOutline(
        ctx,
        params.color,
        params.outer_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center - outerOffset - outerLength,
          center - outerThickness / 2,
          outerLength,
          outerThickness
        ]
      );
      drawLineWithOutline(
        ctx,
        params.color,
        params.outer_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center + outerOffset,
          center - outerThickness / 2,
          outerLength,
          outerThickness
        ]
      );
      drawLineWithOutline(
        ctx,
        params.color,
        params.outer_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center - outerThickness / 2,
          center - outerOffset - outerLength,
          outerThickness,
          outerLength
        ]
      );
      drawLineWithOutline(
        ctx,
        params.color,
        params.outer_lines_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center - outerThickness / 2,
          center + outerOffset,
          outerThickness,
          outerLength
        ]
      );
    }

    if (params.center_dot) {
      const dotSize = (params.center_dot_size || params.inner_lines_thickness) * (scale / 4);
      drawLineWithOutline(
        ctx,
        params.color,
        params.center_dot_opacity,
        outlineSize,
        params.outline_opacity,
        [
          center - dotSize / 2,
          center - dotSize / 2,
          dotSize,
          dotSize
        ]
      );
    }

    ctx.restore();
  }, [config, bgImage]);

  const updateConfig = updater => {
    setConfig(prev => {
      const nextValue = typeof updater === 'function' ? updater(prev) : updater;
      const normalized = normalizeConfig(nextValue);
      setRawInput(JSON.stringify(normalized, null, 2));
      setParseError('');
      return normalized;
    });
  };

  const handleRawInputChange = value => {
    setRawInput(value);
    try {
      const parsed = JSON.parse(value);
      const normalized = normalizeConfig(parsed);
      setConfig(normalized);
      setParseError('');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON payload.');
    }
  };

  const handleBackgroundUpload = file => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateConfig(prev => ({
        ...prev,
        background: { type: 'image', data_base64: reader.result }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundColor = value => {
    updateConfig(prev => ({
      ...prev,
      background: { type: 'color', value }
    }));
  };

  const clearBackgroundImage = () => {
    updateConfig(prev => ({
      ...prev,
      background: { type: 'color', value: DEFAULT_CONFIG.background.value }
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col gap-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-xl border border-white/10 shadow-lg bg-[#0a0b16]"
          />
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-3 text-xs uppercase tracking-wide text-slate-300">
              <span className="px-2 py-1 rounded bg-white/10 border border-white/10">Background Image</span>
              <input
                type="file"
                accept="image/*"
                className="text-xs text-slate-400"
                onChange={event => handleBackgroundUpload(event.target.files?.[0])}
              />
            </label>
            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
              <span className="px-2 py-1 rounded bg-white/10 border border-white/10">Background Color</span>
              <input
                type="color"
                value={
                  config.background.type === 'color'
                    ? config.background.value
                    : DEFAULT_CONFIG.background.value
                }
                onChange={event => handleBackgroundColor(event.target.value)}
              />
            </label>
            {config.background.type === 'image' && (
              <button
                type="button"
                onClick={clearBackgroundImage}
                className="text-xs px-3 py-1 rounded border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                Remove Image
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Crosshair JSON Input</h2>
                <p className="text-sm text-slate-400">
                  Paste OptiPlay crosshair payloads to instantly render them.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">Game</span>
                <select
                  value={config.game}
                  onChange={event =>
                    updateConfig(prev => ({
                      ...prev,
                      game: event.target.value
                    }))
                  }
                  className="bg-[#0c0e1d] border border-white/10 rounded px-3 py-1 text-sm"
                >
                  {SUPPORTED_GAMES.map(game => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={rawInput}
              onChange={event => handleRawInputChange(event.target.value)}
              spellCheck={false}
              className="mt-3 w-full min-h-[16rem] rounded-lg bg-[#0c0e1d] border border-white/10 px-3 py-3 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none focus:ring-2 focus:ring-optiPurple-500/60"
            />
            {parseError ? (
              <p className="mt-2 text-xs text-red-400">Parse error: {parseError}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-400">
                Need a starting point? Use the sample payload to tweak colors, thickness, and offsets.
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Generated Crosshair Code</h2>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(generatedCode)}
                className="text-xs px-3 py-1 rounded border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                Copy Code
              </button>
            </div>
            <textarea
              readOnly
              value={generatedCode}
              className="mt-3 w-full min-h-[10rem] rounded-lg bg-[#101225] border border-white/10 px-3 py-3 font-mono text-xs text-slate-100"
            />
            <p className="mt-2 text-xs text-slate-500">
              Paste directly into the associated game console or settings panel. Values are derived from the active payload.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-[#0c0e1d] px-4 py-4 text-xs text-slate-400 leading-relaxed">
        <p>
          OptiPlay renders at 512×512 with smoothing enabled. Scale values adjust visual proportions without altering code output,
          ensuring one-to-one translation between preview and in-game sliders.
        </p>
      </div>
    </div>
  );
}

export { DEFAULT_CONFIG as DEFAULT_CROSSHAIR_CONFIG };
