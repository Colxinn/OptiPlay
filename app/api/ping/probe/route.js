const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

export const runtime = "edge";
export const preferredRegion = "auto";

export async function GET() {
  const region =
    process.env.VERCEL_REGION ||
    process.env.AWS_REGION ||
    process.env.FLY_REGION ||
    "unknown";
  return new Response(JSON.stringify({ ok: true, region }), {
    status: 200,
    headers,
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers,
  });
}
