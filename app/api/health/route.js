export const runtime = 'nodejs';

// Simple health check - responds immediately without DB calls
export async function GET() {
  return Response.json({ status: 'healthy' }, { status: 200 });
}
  return Response.json(body, { status });
}

