import { prisma } from "@/lib/prisma";

export async function GET() {
  const env = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    MAILERSEND_API_TOKEN: !!process.env.MAILERSEND_API_TOKEN,
    AUTH_EMAIL_FROM: !!process.env.AUTH_EMAIL_FROM,
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
