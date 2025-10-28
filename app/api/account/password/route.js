export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function validPassword(pw) {
  if (typeof pw !== 'string') return false;
  if (pw.length < 8) return false;
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasNumber || hasSpecial;
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const password = body?.password || '';
  if (!validPassword(password)) {
    return NextResponse.json({ error: 'WeakPassword', message: 'Password must be at least 8 characters and include a number or special character.' }, { status: 400 });
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: hash } });
  return NextResponse.json({ ok: true });
}

