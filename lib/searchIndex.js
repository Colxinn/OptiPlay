import fs from 'fs';
import path from 'path';

let cachedIndex = null;

export function loadSearchIndex() {
  if (cachedIndex) return cachedIndex;
  const file = path.join(process.cwd(), 'data', 'site', 'search-index.json');
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    cachedIndex = [];
    return cachedIndex;
  }
  cachedIndex = parsed;
  return cachedIndex;
}

export function searchIndex(query) {
  const index = loadSearchIndex();
  const q = (query || '').trim().toLowerCase();
  if (!q) return index;
  return index.filter((item) => {
    const haystack = [item.title, item.description, item.category, ...(item.keywords || [])]
      .filter(Boolean)
      .join(' ') .toLowerCase();
    return haystack.includes(q);
  });
}

