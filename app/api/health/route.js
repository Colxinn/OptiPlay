export const runtime = 'nodejs';

// Simple health check - responds immediately without DB calls
export async function GET() {
  console.log('[health] probe received');
  return Response.json({ status: 'healthy' }, { status: 200 });
}

