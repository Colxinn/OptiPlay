export const runtime = 'nodejs';

import prisma from '@/lib/prisma';

function presence(v) {
  return typeof v === 'string' ? v.length > 0 : !!v;
}

async function checkDb(timeoutMs = 2500) {
  const start = Date.now();
  try {
    const p = prisma.$queryRaw`SELECT 1`;
    await Promise.race([
      p,
      new Promise((_, rej) => setTimeout(() => rej(new Error('DBTimeout')), timeoutMs)),
    ]);
    return { ok: true, pingMs: Date.now() - start };
  } catch (e) {
    return { ok: false, error: String(e?.message || e), pingMs: Date.now() - start };
  }
}

export async function GET() {
  const env = {
    VERCEL: presence(process.env.VERCEL),
    VERCEL_ENV: process.env.VERCEL_ENV || null,
    NEXTAUTH_URL: presence(process.env.NEXTAUTH_URL),
    NEXTAUTH_SECRET: presence(process.env.NEXTAUTH_SECRET),
    AUTH_EMAIL_FROM: presence(process.env.AUTH_EMAIL_FROM),
    AUTH_EMAIL_SERVER: presence(process.env.AUTH_EMAIL_SERVER),
    MAILERSEND_API_TOKEN: presence(process.env.MAILERSEND_API_TOKEN),
    DATABASE_URL: presence(process.env.DATABASE_URL),
  };

  const db = await checkDb();

  const body = {
    ok: env.DATABASE_URL && db.ok,
    timestamp: new Date().toISOString(),
    env,
    db,
  };

  const status = body.ok ? 200 : 503;
  return Response.json(body, { status });
}

