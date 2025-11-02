import { getGameNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const { game: gameParam } = await params;
  const game = (gameParam || '').toLowerCase();
  const items = await getGameNews(game, 20);
  return new Response(JSON.stringify({ items }), { status: 200, headers: { 'cache-control': 'no-store' } });
}
