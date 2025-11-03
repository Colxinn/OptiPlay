import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { rateLimit } from '@/lib/rateLimit';

const prisma = new PrismaClient();

// Rate limiter: 10 votes per IP per hour
const voteLimiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

/**
 * Get client IP address from request
 */
function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * GET /api/pro-configs
 * Query params:
 *   - game: 'cs2' | 'valorant' (optional, filter by game)
 *   - limit: number (default 50, max 100)
 *   - offset: number (default 0, for pagination)
 *   - sort: 'popularity' | 'votes' | 'recent' (default 'popularity')
 *   - search: string (optional, search by player name)
 *   - checkVotes: boolean (optional, include user's vote status)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const game = searchParams.get('game');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'popularity';
    const search = searchParams.get('search');
    const checkVotes = searchParams.get('checkVotes') === 'true';
    
    // Build where clause
    const where = {};
    
    if (game) {
      where.game = game;
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    // Build orderBy
    let orderBy = {};
    switch (sort) {
      case 'votes':
        orderBy = { votes: 'desc' };
        break;
      case 'recent':
        orderBy = { fetchedAt: 'desc' };
        break;
      case 'popularity':
      default:
        orderBy = { popularity: 'desc' };
        break;
    }
    
    // Fetch configs
    const [configs, totalCount] = await Promise.all([
      prisma.proConfig.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.proConfig.count({ where }),
    ]);
    
    // Optionally check user's votes
    let userVotes = {};
    if (checkVotes) {
      const ipAddress = getClientIp(request);
      const configIds = configs.map(c => c.id);
      
      const votes = await prisma.proConfigVote.findMany({
        where: {
          configId: { in: configIds },
          ipAddress: ipAddress,
        },
        select: {
          configId: true,
          vote: true,
        },
      });
      
      userVotes = votes.reduce((acc, v) => {
        acc[v.configId] = v.vote;
        return acc;
      }, {});
    }
    
    // Add user vote info to configs if requested
    const dataWithVotes = checkVotes 
      ? configs.map(config => ({
          ...config,
          userVote: userVotes[config.id] || null,
        }))
      : configs;
    
    return NextResponse.json({
      data: dataWithVotes,
      meta: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching pro configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pro configs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pro-configs
 * Body: { id: string, vote: 1 | -1 }
 * 
 * Features:
 * - One vote per user (tracked by IP + optional userId)
 * - Rate limiting: 10 votes per hour per IP
 * - Vote changes allowed (upvote -> downvote or vice versa)
 */
export async function POST(request) {
  try {
    const { id, vote } = await request.json();
    
    // Validate input
    if (!id || (vote !== 1 && vote !== -1)) {
      return NextResponse.json(
        { error: 'Invalid vote parameters' },
        { status: 400 }
      );
    }
    
    // Get client IP
    const ipAddress = getClientIp(request);
    
    // Apply rate limiting
    try {
      await voteLimiter.check(10, ipAddress); // 10 votes per hour
    } catch (error) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Check if user has already voted
    const existingVote = await prisma.proConfigVote.findFirst({
      where: {
        configId: id,
        ipAddress: ipAddress,
      },
    });
    
    if (existingVote) {
      // User already voted
      if (existingVote.vote === vote) {
        // Same vote, return current state
        return NextResponse.json({
          success: false,
          message: 'You have already voted',
          alreadyVoted: true,
          currentVote: vote,
        });
      }
      
      // Different vote - change vote (remove old, add new)
      const voteChange = vote - existingVote.vote; // Will be +2 or -2
      
      await prisma.$transaction([
        // Update the vote record
        prisma.proConfigVote.update({
          where: { id: existingVote.id },
          data: { vote },
        }),
        // Update the config's vote count
        prisma.proConfig.update({
          where: { id },
          data: {
            votes: {
              increment: voteChange,
            },
          },
        }),
      ]);
      
      const updated = await prisma.proConfig.findUnique({
        where: { id },
        select: { votes: true },
      });
      
      return NextResponse.json({
        success: true,
        votes: updated.votes,
        message: 'Vote changed successfully',
        previousVote: existingVote.vote,
        newVote: vote,
      });
    }
    
    // New vote
    await prisma.$transaction([
      // Create vote record
      prisma.proConfigVote.create({
        data: {
          configId: id,
          ipAddress: ipAddress,
          vote: vote,
        },
      }),
      // Update config votes
      prisma.proConfig.update({
        where: { id },
        data: {
          votes: {
            increment: vote,
          },
        },
      }),
    ]);
    
    const updated = await prisma.proConfig.findUnique({
      where: { id },
      select: { votes: true },
    });
    
    return NextResponse.json({
      success: true,
      votes: updated.votes,
      message: 'Vote registered successfully',
    });
  } catch (error) {
    console.error('Error voting on config:', error);
    return NextResponse.json(
      { error: 'Failed to register vote' },
      { status: 500 }
    );
  }
}
