import fs from 'fs';
import path from 'path';

export async function localRequirements() {
  const p = path.join(process.cwd(), 'data', 'games', 'requirements.json');
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

export async function searchLocal(q) {
  const data = await localRequirements();
  const query = q.toLowerCase();
  return data.filter((g) => g.title.toLowerCase().includes(query) || g.slug.includes(query));
}

// Placeholder for external providers (RAWG, PCGamingWiki, etc.)
export async function fetchExternal(q) {
  const out = [];
  // Examples (disabled unless you add keys in env):
  // RAWG API (optional key RAWG_API_KEY)
  // try {
  //   const key = process.env.RAWG_API_KEY;
  //   const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&key=${key}`);
  //   const js = await res.json();
  //   // Map results as needed...
  // } catch {}
  return out;
}

export async function searchRequirements(q) {
  const local = await searchLocal(q);
  const external = await fetchExternal(q);
  // Prefer local curated entries, then external
  return [...local, ...external];
}

