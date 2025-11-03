/**
 * Normalization utilities for Pro Configs
 * Converts site-specific data into OptiPlay canonical schema
 */

export interface NormalizedConfig {
  crosshair: {
    color?: string;
    size?: number;
    gap?: number;
    thickness?: number;
    dot?: boolean;
    outline?: number;
    outlineOpacity?: number;
    // CS2 specific
    style?: number;
    sniper_width?: number;
    // Valorant specific
    innerLines?: { opacity?: number; length?: number; thickness?: number; offset?: number };
    outerLines?: { opacity?: number; length?: number; thickness?: number; offset?: number };
  };
  sensitivity: {
    dpi: number;
    inGameSens: number;
    cmPer360?: number;
    scoped?: number; // For CS2 zoom sensitivity
  };
  binds?: Array<{ key: string; action: string }>;
  resolution: string;
  launchOptions?: string;
  videoSettings?: {
    aspect?: string;
    displayMode?: string;
    scaling?: string;
  };
}

/**
 * Compute cm/360 from DPI and in-game sensitivity
 * Formula varies by game
 */
export function computeCmPer360(game: string, dpi: number, sens: number): number {
  if (game === 'cs2') {
    // CS2 uses yaw = 0.022
    const counts = (360 / 0.022) / sens;
    const inches = counts / dpi;
    return Math.round(inches * 2.54 * 100) / 100;
  }
  
  if (game === 'valorant') {
    // Valorant uses different formula
    const counts = (360 * 55.04) / (sens * 0.07);
    const inches = counts / dpi;
    return Math.round(inches * 2.54 * 100) / 100;
  }
  
  return 0;
}

/**
 * Parse numeric value safely with fallback
 */
export function parseNumber(value: any, fallback: number = 0): number {
  const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? fallback : Math.round(parsed * 100) / 100;
}

/**
 * Parse boolean value from various formats
 */
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase();
  return str === 'true' || str === 'yes' || str === '1' || str === 'on';
}

/**
 * Normalize color format to hex
 */
export function normalizeColor(color: string): string {
  if (!color) return '#00ff00';
  
  // If already hex, return it
  if (color.startsWith('#')) return color;
  
  // Common color name mappings
  const colorMap: Record<string, string> = {
    'green': '#00ff00',
    'cyan': '#00ffff',
    'yellow': '#ffff00',
    'red': '#ff0000',
    'blue': '#0000ff',
    'white': '#ffffff',
    'black': '#000000',
    'purple': '#ff00ff',
    'pink': '#ff69b4',
  };
  
  return colorMap[color.toLowerCase()] || '#00ff00';
}

/**
 * Parse resolution string into standard format
 */
export function normalizeResolution(res: string): string {
  if (!res) return '1920x1080';
  
  // Extract numbers
  const match = res.match(/(\d{3,4})\s*[x×]\s*(\d{3,4})/i);
  if (match) {
    return `${match[1]}x${match[2]}`;
  }
  
  return '1920x1080';
}

/**
 * Normalize CS2 crosshair from various formats
 */
export function normalizeCS2Crosshair(raw: any): NormalizedConfig['crosshair'] {
  return {
    style: parseNumber(raw.style, 4),
    color: normalizeColor(raw.color),
    size: parseNumber(raw.size, 3),
    gap: parseNumber(raw.gap, -3),
    thickness: parseNumber(raw.thickness, 1),
    dot: parseBoolean(raw.dot),
    outline: parseNumber(raw.outline, 1),
    outlineOpacity: parseNumber(raw.outlineOpacity, 0.5),
    sniper_width: parseNumber(raw.sniper_width, 1),
  };
}

/**
 * Normalize Valorant crosshair from various formats
 */
export function normalizeValorantCrosshair(raw: any): NormalizedConfig['crosshair'] {
  return {
    color: normalizeColor(raw.color),
    outlineOpacity: parseNumber(raw.outlineOpacity, 1),
    outline: parseNumber(raw.outlineThickness, 1),
    innerLines: {
      opacity: parseNumber(raw.innerLineOpacity, 1),
      length: parseNumber(raw.innerLineLength, 6),
      thickness: parseNumber(raw.innerLineThickness, 2),
      offset: parseNumber(raw.innerLineOffset, 3),
    },
    outerLines: {
      opacity: parseNumber(raw.outerLineOpacity, 0),
      length: parseNumber(raw.outerLineLength, 0),
      thickness: parseNumber(raw.outerLineThickness, 2),
      offset: parseNumber(raw.outerLineOffset, 10),
    },
    dot: parseBoolean(raw.centerDot),
  };
}

/**
 * Parse CS2 launch options
 */
export function parseCS2LaunchOptions(options: string): string {
  if (!options) return '';
  
  // Clean up common variations
  return options
    .replace(/\s+/g, ' ')
    .replace(/"+/g, '')
    .trim();
}

/**
 * Parse binds from various formats
 */
export function parseBinds(bindsText: string): Array<{ key: string; action: string }> {
  if (!bindsText) return [];
  
  const binds: Array<{ key: string; action: string }> = [];
  const lines = bindsText.split(/[;\n]/);
  
  for (const line of lines) {
    const match = line.match(/bind\s+"?([^"\s]+)"?\s+"?(.+?)"?$/i);
    if (match) {
      binds.push({
        key: match[1],
        action: match[2],
      });
    }
  }
  
  return binds;
}

/**
 * Complete normalization for a pro config
 */
export function normalizeProConfig(game: string, raw: any): NormalizedConfig {
  const dpi = parseNumber(raw.dpi, 800);
  const sens = parseNumber(raw.sensitivity || raw.sens, 1.0);
  
  const config: NormalizedConfig = {
    crosshair: game === 'cs2' 
      ? normalizeCS2Crosshair(raw.crosshair || {})
      : normalizeValorantCrosshair(raw.crosshair || {}),
    sensitivity: {
      dpi,
      inGameSens: sens,
      cmPer360: computeCmPer360(game, dpi, sens),
    },
    resolution: normalizeResolution(raw.resolution),
  };
  
  if (game === 'cs2') {
    config.sensitivity.scoped = parseNumber(raw.zoomSensitivity || raw.zoom_sensitivity, 1.0);
    config.launchOptions = parseCS2LaunchOptions(raw.launchOptions || '');
  }
  
  if (raw.binds) {
    config.binds = parseBinds(raw.binds);
  }
  
  if (raw.aspectRatio || raw.displayMode) {
    config.videoSettings = {
      aspect: raw.aspectRatio,
      displayMode: raw.displayMode,
      scaling: raw.scaling,
    };
  }
  
  return config;
}
