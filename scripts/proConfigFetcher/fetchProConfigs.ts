/**
 * Pro Config Fetcher
 * Scrapes professional player configs from public sources
 * with proper attribution, caching, and rate limiting
 */

import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import { normalizeProConfig, type NormalizedConfig } from './normalize';

const CACHE_DIR = path.join(process.cwd(), 'cache', 'prosettings');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CONCURRENCY_LIMIT = 3;

export interface ProConfigData {
  name: string;
  game: string;
  team?: string;
  sourceUrl: string;
  sourceName: string;
  normalized: NormalizedConfig;
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

/**
 * Get cached HTML if available and fresh
 */
async function getCachedHTML(url: string): Promise<string | null> {
  const filename = Buffer.from(url).toString('base64').substring(0, 200) + '.html';
  const filepath = path.join(CACHE_DIR, filename);
  
  try {
    const stats = await fs.stat(filepath);
    const age = Date.now() - stats.mtimeMs;
    
    if (age < CACHE_DURATION) {
      console.log(`📦 Cache hit: ${url}`);
      return await fs.readFile(filepath, 'utf-8');
    }
  } catch (err) {
    // Cache miss
  }
  
  return null;
}

/**
 * Save HTML to cache
 */
async function cacheHTML(url: string, html: string): Promise<void> {
  const filename = Buffer.from(url).toString('base64').substring(0, 200) + '.html';
  const filepath = path.join(CACHE_DIR, filename);
  
  try {
    await fs.writeFile(filepath, html, 'utf-8');
    console.log(`💾 Cached: ${url}`);
  } catch (err) {
    console.error(`Failed to cache ${url}:`, err);
  }
}

/**
 * Fetch HTML with caching
 */
async function fetchHTML(url: string): Promise<string> {
  // Check cache first
  const cached = await getCachedHTML(url);
  if (cached) return cached;
  
  // Fetch fresh
  console.log(`🌐 Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'OptiPlay Config Aggregator (https://optiplay.gg) - Educational use with attribution',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  
  const html = await response.text();
  
  // Cache for next time
  await cacheHTML(url, html);
  
  // Rate limiting delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  return html;
}

/**
 * Parse ProSettings.net player page (works for all games)
 */
export async function parseProsettings(url: string): Promise<ProConfigData> {
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);
  
  // Extract player name from h1 or title
  const name = $('h1').first().text().trim() || 
               $('title').text().split('-')[0].trim();
  
  // Determine game - check for CS2 or VALORANT heading/image
  let game = 'cs2'; // default to CS2
  
  // Check for game icon images
  const gameIcon = $('img[alt="CS2"], img[src*="cs2-icon"]').length > 0 ? 'cs2' :
                   $('img[alt="VALORANT"], img[src*="valorant"]').length > 0 ? 'valorant' : null;
  
  if (gameIcon) {
    game = gameIcon;
  } else {
    // Fallback: check headings
    const headings = $('h2').text();
    if (headings.includes('VALORANT') || headings.includes('Valorant')) {
      game = 'valorant';
    } else if (headings.includes('CS2') || headings.includes('Counter-Strike')) {
      game = 'cs2';
    }
  }
  
  // Extract team from player info - look in tables
  let team = '';
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const label = $(cells[0]).text().trim();
      if (label === 'Team' || label.includes('Team')) {
        team = $(cells[1]).text().trim();
      }
    }
  });
  
  // Extract settings from tables
  const raw: any = {
    crosshair: {},
  };
  
  // Find all tables and extract data
  $('table').each((_, table) => {
    $(table).find('tr').each((_, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().toLowerCase();
        const value = $(cells[1]).text().trim();
        
        // Mouse settings
        if (label.includes('dpi') && !label.includes('edpi')) {
          raw.dpi = value;
        }
        if (label.includes('in-game sens') || label === 'sensitivity') {
          raw.sensitivity = value;
        }
        if (label.includes('zoom sens')) {
          raw.zoomSensitivity = value;
        }
        if (label.includes('hz') || label.includes('polling')) {
          raw.pollingRate = value;
        }
        
        // Video settings
        if (label.includes('resolution')) {
          raw.resolution = value;
        }
        if (label.includes('aspect ratio')) {
          raw.aspectRatio = value;
        }
        if (label.includes('scaling mode')) {
          raw.scalingMode = value;
        }
        
        // Crosshair - CS2
        if (label.includes('crosshair color')) {
          raw.crosshair.color = value;
        }
        if (label.includes('crosshair size') || label === 'size') {
          raw.crosshair.size = value;
        }
        if (label.includes('thickness')) {
          raw.crosshair.thickness = value;
        }
        if (label.includes('gap')) {
          raw.crosshair.gap = value;
        }
        if (label.includes('dot')) {
          raw.crosshair.dot = value;
        }
        if (label.includes('style')) {
          raw.crosshair.style = value;
        }
        if (label.includes('outline')) {
          raw.crosshair.outline = value;
        }
        
        // Crosshair - Valorant
        if (label.includes('color')) {
          raw.crosshair.color = value;
        }
        if (label.includes('outlines')) {
          raw.crosshair.outlineThickness = value;
        }
        if (label.includes('center dot')) {
          raw.crosshair.centerDot = value;
        }
        if (label.includes('inner line opacity')) {
          raw.crosshair.innerLineOpacity = value;
        }
        if (label.includes('inner line length')) {
          raw.crosshair.innerLineLength = value;
        }
        if (label.includes('inner line thickness')) {
          raw.crosshair.innerLineThickness = value;
        }
        if (label.includes('inner line offset')) {
          raw.crosshair.innerLineOffset = value;
        }
      }
    });
  });
  
  const normalized = normalizeProConfig(game, raw);
  
  return {
    name,
    game,
    team: team || undefined,
    sourceUrl: url,
    sourceName: 'ProSettings.net',
    normalized,
  };
}

/**
 * Fetch multiple pro configs with concurrency limiting
 */
export async function fetchProConfigs(urls: string[]): Promise<ProConfigData[]> {
  await ensureCacheDir();
  
  const limit = pLimit(CONCURRENCY_LIMIT);
  const results: ProConfigData[] = [];
  
  const tasks = urls.map(url => limit(async () => {
    try {
      const data = await parseProsettings(url);
      results.push(data);
      console.log(`✅ Fetched: ${data.name} (${data.game})`);
    } catch (err: any) {
      console.error(`❌ Failed to fetch ${url}:`, err.message);
    }
  }));
  
  await Promise.all(tasks);
  
  return results;
}
