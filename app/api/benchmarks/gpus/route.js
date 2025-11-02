import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const gpus = await prisma.gPU.findMany({
      select: {
        slug: true,
        name: true,
        family: true,
        avgScore: true,
      },
      orderBy: [
        { family: 'asc' },
        { avgScore: 'desc' },
      ],
    });

    return NextResponse.json({ gpus });
  } catch (error) {
    console.error('Failed to fetch GPUs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GPUs', gpus: [] },
      { status: 500 }
    );
  }
}
