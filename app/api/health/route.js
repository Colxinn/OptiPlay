import { prisma } from "@/lib/prisma";

export async function GET() {
  const env = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === 'true' || process.env.AUTH_TRUST_HOST === '1',
    DATABASE_URL: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {}

  return new Response(
    JSON.stringify({ ok: true, env, dbOk }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}

