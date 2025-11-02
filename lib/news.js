// Server-side news aggregator: fetches RSS feeds and extracts thumbnails.
// No external deps; uses naive XML parsing and OG scraping as fallback.

const FEEDS = {
  cs2: [
    'https://blog.counter-strike.net/index.php/feed/',
    'https://dotesports.com/counter-strike/feed',
    'https://www.dexerto.com/cs2/feed/',
  ],
  valorant: [
    'https://dotesports.com/valorant/feed',
    'https://www.dexerto.com/valorant/feed/',
  ],
  fortnite: [
    'https://dotesports.com/fortnite/feed',
    'https://www.dexerto.com/fortnite/feed/',
  ],
  siegex: [
    'https://dotesports.com/rainbow-6/feed',
    'https://www.dexerto.com/rainbow-six-siege/feed/',
  ],
  roblox: [
    'https://blog.roblox.com/feed/',
    'https://www.dexerto.com/roblox/feed/',
  ],
  minecraft: [
    'https://dotesports.com/minecraft/feed',
    'https://www.dexerto.com/minecraft/feed/',
  ],
  rust: [
    'https://rust.facepunch.com/rss',
    'https://www.dexerto.com/rust/feed/',
  ],
  apex: [
    'https://www.ea.com/games/apex-legends/news/rss',
    'https://dotesports.com/apex-legends/feed',
    'https://www.dexerto.com/apex-legends/feed/',
  ],
};

const CACHE = new Map(); // key -> { at, items }
const TTL_MS = 5 * 60 * 1000;

function textBetween(str, startTag, endTag) {
  const s = str.indexOf(startTag);
  if (s === -1) return '';
  const e = str.indexOf(endTag, s + startTag.length);
  if (e === -1) return '';
  return str.slice(s + startTag.length, e);
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractImageFromItemXml(xml) {
  // media:content / media:thumbnail / enclosure
  let m = xml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (m) return m[1];
  m = xml.match(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (m) return m[1];
  m = xml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image\//i);
  if (m) return m[1];
  // try first <img src> in description/content
  const desc = textBetween(xml, '<description>', '</description>') || textBetween(xml, '<content:encoded>', '</content:encoded>');
  if (desc) {
    const im = desc.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    if (im) return im[1];
  }
  return '';
}

function absoluteUrl(url, base) {
  try { return new URL(url, base).toString(); } catch { return url; }
}

async function fetchWithTimeout(url, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const res = await fetch(url, { signal: c.signal, headers: { 'user-agent': 'OptiPlayBot/1.0 (+https://example.com)' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function fetchOgImage(articleUrl) {
  try {
    const html = await fetchWithTimeout(articleUrl, 7000);
    let m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (m) return absoluteUrl(m[1], articleUrl);
    m = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    if (m) return absoluteUrl(m[1], articleUrl);
  } catch {}
  return '';
}

function parseRss(xml, baseUrl) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = decodeEntities(textBetween(block, '<title>', '</title>').trim());
    const link = decodeEntities(
      (textBetween(block, '<link>', '</link>') || (block.match(/<guid[^>]*>([^<]+)<\/guid>/i)?.[1] || '')).trim()
    );
    const pub = (textBetween(block, '<pubDate>', '</pubDate>') || textBetween(block, '<dc:date>', '</dc:date>')).trim();
    const image = extractImageFromItemXml(block);
    if (!title || !link) continue;
    items.push({ title, url: absoluteUrl(link, baseUrl), publishedAt: pub ? new Date(pub).toISOString() : null, image: image ? absoluteUrl(image, baseUrl) : '' });
  }
  return items;
}

async function fetchFeed(url) {
  try {
    const xml = await fetchWithTimeout(url);
    const items = parseRss(xml, url);
    // Fill missing images using OG scraping for first few
    const enriched = await Promise.all(items.slice(0, 10).map(async (it) => {
      if (!it.image) {
        it.image = await fetchOgImage(it.url) || '';
      }
      return it;
    }));
    // merge back remainder
    if (items.length > enriched.length) enriched.push(...items.slice(enriched.length));
    return enriched;
  } catch {
    return [];
  }
}

export async function getGameNews(game, limit = 20) {
  const key = `news:${game}`;
  const now = Date.now();
  const cached = CACHE.get(key);
  if (cached && now - cached.at < TTL_MS) return cached.items.slice(0, limit);

  const feeds = FEEDS[game] || [];
  const lists = await Promise.all(feeds.map(fetchFeed));
  const merged = lists.flat();
  merged.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
  const items = dedupeByUrl(merged).slice(0, limit);
  CACHE.set(key, { at: now, items });
  return items;
}

function dedupeByUrl(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = it.url.split('#')[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export function clearNewsCache(game) {
  if (game) CACHE.delete(`news:${game}`);
  else Array.from(CACHE.keys()).filter(k=>k.startsWith('news:')).forEach(k=>CACHE.delete(k));
}

