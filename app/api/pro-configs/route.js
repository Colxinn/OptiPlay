import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/pro-configs
 * Query params:
 *   - game: 'cs2' | 'valorant' (optional, filter by game)
 *   - limit: number (default 50, max 100)
 *   - offset: number (default 0, for pagination)
 *   - sort: 'popularity' | 'votes' | 'recent' (default 'popularity')
 *   - search: string (optional, search by player name)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const game = searchParams.get('game');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'popularity';
    const search = searchParams.get('search');
    
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
    
    return NextResponse.json({
      data: configs,
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
 * POST /api/pro-configs/vote
 * Body: { id: string, vote: 1 | -1 }
 */
export async function POST(request) {
  try {
    const { id, vote } = await request.json();
    
    if (!id || (vote !== 1 && vote !== -1)) {
      return NextResponse.json(
        { error: 'Invalid vote parameters' },
        { status: 400 }
      );
    }
    
    const updated = await prisma.proConfig.update({
      where: { id },
      data: {
        votes: {
          increment: vote,
        },
      },
    });
    
    return NextResponse.json({ success: true, votes: updated.votes });
  } catch (error) {
    console.error('Error voting on config:', error);
    return NextResponse.json(
      { error: 'Failed to register vote' },
      { status: 500 }
    );
  }
}
