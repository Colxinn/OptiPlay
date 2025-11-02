import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { enrichMatchesWithLiveData } from '@/lib/esportsAggregator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const status = searchParams.get('status'); // live, upcoming, finished

    // Read the live matches data
    const filePath = join(process.cwd(), 'data', 'esports', 'live-matches.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    let matches = JSON.parse(fileContent);

    // Enrich matches with real-time data from multiple sources
    matches = await enrichMatchesWithLiveData(matches);

    // Filter by game if specified
    if (game) {
      matches = matches.filter(match => match.gameSlug === game);
    }

    // Filter by status if specified
    if (status) {
      matches = matches.filter(match => match.status === status);
    }

    // Sort: live first, then upcoming, then finished
    const statusOrder = { live: 0, upcoming: 1, finished: 2 };
    matches.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Within same status, sort by start time
      return new Date(a.startTime) - new Date(b.startTime);
    });

    return NextResponse.json({
      success: true,
      matches,
      count: matches.length
    });
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live matches' },
      { status: 500 }
    );
  }
}
