import { searchRequirements } from "@/lib/requirements";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return new Response(JSON.stringify({ ok: false, error: 'q required' }), { status: 400 });
  const results = await searchRequirements(q);
  return new Response(JSON.stringify({ ok: true, results }), { status: 200 });
}

