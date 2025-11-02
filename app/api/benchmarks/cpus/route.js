import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cpus = await prisma.cPU.findMany({
      select: {
        slug: true,
        name: true,
        family: true,
        benchmarkScore: true,
      },
      orderBy: [
        { family: 'asc' },
        { benchmarkScore: 'desc' },
      ],
    });

    return NextResponse.json({ cpus });
  } catch (error) {
    console.error('Failed to fetch CPUs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CPUs', cpus: [] },
      { status: 500 }
    );
  }
}
