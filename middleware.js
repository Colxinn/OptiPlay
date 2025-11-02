import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = { 
  matcher: [
    "/admin/:path*",
    "/api/auth/register",
    "/api/posts",
    "/api/comments",
    "/api/:path*", // Protect all API routes
  ] 
};

// Simple in-memory rate limit tracking
const requestCounts = new Map();
const blacklistedIPs = new Set();
const ipRequests = new Map(); // Track requests per IP

function isBlacklistedIP(ip) {
  return blacklistedIPs.has(ip);
}

function blacklistIP(ip) {
  blacklistedIPs.add(ip);
  console.log(`⚠️ IP ${ip} blacklisted by middleware`);
  
  // Auto-unblacklist after 1 hour
  setTimeout(() => {
    blacklistedIPs.delete(ip);
    console.log(`✓ IP ${ip} removed from middleware blacklist`);
  }, 3600000);
}

function trackRequest(ip) {
  const now = Date.now();
  
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }
  
  const requests = ipRequests.get(ip);
  requests.push(now);
  
  // Keep only last 5 minutes
  const recentRequests = requests.filter(time => now - time < 300000);
  ipRequests.set(ip, recentRequests);
  
  // If more than 200 requests in 5 minutes, blacklist
  if (recentRequests.length > 200) {
    blacklistIP(ip);
    return false;
  }
  
  return true;
}

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
  
  // Cleanup IP requests older than 5 minutes
  for (const [ip, requests] of ipRequests.entries()) {
    const recentRequests = requests.filter(time => now - time < 300000);
    if (recentRequests.length === 0) {
      ipRequests.delete(ip);
    } else {
      ipRequests.set(ip, recentRequests);
    }
  }
}, 60000);

export async function middleware(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  // Check if IP is blacklisted
  if (isBlacklistedIP(ip)) {
    return new NextResponse(
      JSON.stringify({ error: 'Access denied. Your IP has been blocked.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Track this request
  if (!trackRequest(ip)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. You have been temporarily blocked.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Global rate limit: 100 requests per minute per IP
  if (!checkRateLimit(ip, 100, 60000)) {
    blacklistIP(ip); // Blacklist if rate limit exceeded
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
