import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = { 
  matcher: [
    "/admin/:path*",
    "/api/auth/register",
    "/api/posts",
    "/api/comments",
  ] 
};

// Simple in-memory rate limit tracking
const requestCounts = new Map();

function checkRateLimit(ip, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const key = `global:${ip}`;
  
  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = requestCounts.get(key);

  if (now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000);

export async function middleware(req) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Global rate limit: 100 requests per minute per IP
  if (!checkRateLimit(ip, 100, 60000)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Admin protection
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token && !token.isOwner) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  
  return NextResponse.next();
}
