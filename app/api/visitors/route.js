import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SALT = process.env.PING_HASH_SALT || 'default-salt-change-me';
const MAX_VISITORS = 100;

/**
 * Hash IP address for privacy
 */
function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + SALT).digest('hex').slice(0, 16);
}

/**
 * Get client IP from request
 */
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Track a visitor and maintain the last 100 unique IPs
 */
export async function POST(request) {
  try {
    const ip = getClientIP(request);
    const ipHash = hashIP(ip);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Get geo data if available from Vercel/Cloudflare headers
    const country = request.headers.get('x-vercel-ip-country') || 
                    request.headers.get('cf-ipcountry') || null;
    const city = request.headers.get('x-vercel-ip-city') || null;

    // Check if this IP already exists
    const existingVisitor = await prisma.uniqueVisitor.findUnique({
      where: { ipHash }
    });

    if (existingVisitor) {
      // Update existing visitor
      await prisma.uniqueVisitor.update({
        where: { ipHash },
        data: {
          lastSeen: new Date(),
          visitCount: { increment: 1 },
          userAgent,
          country,
          city
        }
      });

      return NextResponse.json({
        success: true,
        returning: true,
        visitCount: existingVisitor.visitCount + 1
      });
    }

    // New visitor - check if we need to remove old ones
    const totalVisitors = await prisma.uniqueVisitor.count();

    if (totalVisitors >= MAX_VISITORS) {
      // Remove the oldest visitor(s) to make room
      const oldestVisitor = await prisma.uniqueVisitor.findFirst({
        orderBy: { firstSeen: 'asc' }
      });

      if (oldestVisitor) {
        await prisma.uniqueVisitor.delete({
          where: { id: oldestVisitor.id }
        });
      }
    }

    // Add new visitor
    await prisma.uniqueVisitor.create({
      data: {
        ipHash,
        userAgent,
        country,
        city
      }
    });

    return NextResponse.json({
      success: true,
      returning: false,
      visitCount: 1
    });

  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}

/**
 * Get visitor statistics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeList = searchParams.get('list') === 'true';

    const total = await prisma.uniqueVisitor.count();
    const totalVisits = await prisma.uniqueVisitor.aggregate({
      _sum: { visitCount: true }
    });

    const stats = {
      uniqueVisitors: total,
      totalVisits: totalVisits._sum.visitCount || 0,
      maxCapacity: MAX_VISITORS,
      percentFull: Math.round((total / MAX_VISITORS) * 100)
    };

    if (includeList) {
      const visitors = await prisma.uniqueVisitor.findMany({
        orderBy: { lastSeen: 'desc' },
        select: {
          id: true,
          country: true,
          city: true,
          firstSeen: true,
          lastSeen: true,
          visitCount: true
        }
      });

      // Group by country
      const byCountry = visitors.reduce((acc, v) => {
        const country = v.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      stats.visitors = visitors;
      stats.byCountry = byCountry;
      stats.topCountries = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([country, count]) => ({ country, count }));
    }

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get visitor stats' },
      { status: 500 }
    );
  }
}
