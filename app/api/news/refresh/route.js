import { auth } from '@/lib/auth';
import { clearNewsCache } from '@/lib/news';

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.isOwner) return new Response(JSON.stringify({ error: 'Owner only' }), { status: 403 });
  const { game } = await req.json().catch(() => ({}));
  clearNewsCache(game);
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

