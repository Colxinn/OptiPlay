import { searchIndex, loadSearchIndex } from '@/lib/searchIndex';

function buildRecommendations(matches) {
  const byCategory = new Map();
  for (const item of matches) {
    if (!byCategory.has(item.category)) byCategory.set(item.category, []);
    byCategory.get(item.category).push(item);
  }
  const recs = [];
  for (const [, items] of byCategory) {
    for (const entry of items.slice(0, 2)) {
      recs.push(entry);
    }
    if (recs.length >= 6) break;
  }
  if (recs.length < 4) {
    for (const entry of loadSearchIndex()) {
      if (!recs.find((r) => r.href === entry.href)) {
        recs.push(entry);
      }
      if (recs.length >= 6) break;
    }
  }
  return recs;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  const results = searchIndex(query);
  const matches = results.slice(0, 25);
  const recommendations = buildRecommendations(matches.length ? matches : loadSearchIndex().slice(0, 10));

  return new Response(
    JSON.stringify({
      query,
      count: results.length,
      matches,
      recommendations,
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}

