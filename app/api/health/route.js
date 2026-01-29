export const runtime = 'nodejs';

function makeHealthyResponse() {
  return Response.json({ status: 'healthy' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

// Simple health check - responds immediately without DB calls
export async function GET() {
  console.log('[health] probe received (GET)');
  return makeHealthyResponse();
}

export async function HEAD() {
  console.log('[health] probe received (HEAD)');
  return new Response(null, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}

