import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      select: {
        slug: true,
        name: true,
        genre: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games', games: [] },
      { status: 500 }
    );
  }
}
