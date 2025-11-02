import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { cpuSlug, gpuSlug, gameSlug, resolution, ramGb, targetFps } = await request.json();

    // Fetch benchmark data
    const benchmark = await prisma.gameBenchmark.findFirst({
      where: {
        game: { slug: gameSlug },
        gpu: { slug: gpuSlug },
        cpu: { slug: cpuSlug },
        resolution: resolution,
      },
      include: {
        game: true,
        gpu: true,
        cpu: true,
      },
    });

    if (!benchmark) {
      // Try to find closest match
      const fallbackBenchmark = await prisma.gameBenchmark.findFirst({
        where: {
          game: { slug: gameSlug },
          OR: [
            { gpu: { slug: gpuSlug } },
            { cpu: { slug: cpuSlug } },
          ],
          resolution: resolution,
        },
        include: {
          game: true,
          gpu: true,
          cpu: true,
        },
      });

      if (fallbackBenchmark) {
        return NextResponse.json({
          expectedFps: Math.round(fallbackBenchmark.avgFps * 0.85),
          gameName: fallbackBenchmark.game.name,
          gpuName: fallbackBenchmark.gpu.name,
          cpuName: fallbackBenchmark.cpu.name,
          resolutionName: getResolutionName(resolution),
          bottlenecks: estimateBottlenecks(fallbackBenchmark, ramGb, targetFps),
          recommendations: generateRecommendations(fallbackBenchmark, ramGb, targetFps),
          isEstimate: true,
        });
      }

      return NextResponse.json(
        { error: 'No benchmark data available for this configuration' },
        { status: 404 }
      );
    }

    const bottlenecks = calculateBottlenecks(benchmark, ramGb, targetFps);
    const recommendations = generateRecommendations(benchmark, ramGb, targetFps, bottlenecks);

    return NextResponse.json({
      expectedFps: Math.round(benchmark.avgFps),
      gameName: benchmark.game.name,
      gpuName: benchmark.gpu.name,
      cpuName: benchmark.cpu.name,
      resolutionName: getResolutionName(resolution),
      bottlenecks,
      recommendations,
      isEstimate: false,
    });
  } catch (error) {
    console.error('Bottleneck analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

function calculateBottlenecks(benchmark, ramGb, targetFps) {
  const actualFps = benchmark.avgFps;
  const gpuScore = benchmark.gpu.avgScore || 50;
  const cpuScore = benchmark.cpu.benchmarkScore || 50;

  // GPU bottleneck calculation
  let gpuBottleneck = 0;
  if (actualFps < targetFps * 0.6) {
    gpuBottleneck = 90;
  } else if (actualFps < targetFps * 0.8) {
    gpuBottleneck = 60;
  } else if (actualFps < targetFps) {
    gpuBottleneck = 30;
  } else {
    gpuBottleneck = 10;
  }

  // Adjust GPU bottleneck based on resolution
  if (benchmark.resolution === 'R4K') {
    gpuBottleneck = Math.min(100, gpuBottleneck * 1.5);
  } else if (benchmark.resolution === 'R1080P') {
    gpuBottleneck = gpuBottleneck * 0.7;
  }

  // CPU bottleneck calculation
  let cpuBottleneck = 0;
  if (cpuScore < 30) {
    cpuBottleneck = 85;
  } else if (cpuScore < 50) {
    cpuBottleneck = 60;
  } else if (cpuScore < 70) {
    cpuBottleneck = 35;
  } else {
    cpuBottleneck = 15;
  }

  // High FPS targets stress CPU more
  if (targetFps >= 240) {
    cpuBottleneck = Math.min(100, cpuBottleneck * 1.4);
  }

  // RAM bottleneck calculation
  let ramBottleneck = 0;
  const gameRamRequirement = getGameRamRequirement(benchmark.game.name);
  
  if (ramGb < gameRamRequirement) {
    ramBottleneck = 80;
  } else if (ramGb < gameRamRequirement * 1.5) {
    ramBottleneck = 40;
  } else if (ramGb < gameRamRequirement * 2) {
    ramBottleneck = 20;
  } else {
    ramBottleneck = 5;
  }

  return {
    gpu: Math.round(gpuBottleneck),
    cpu: Math.round(cpuBottleneck),
    ram: Math.round(ramBottleneck),
  };
}

function estimateBottlenecks(benchmark, ramGb, targetFps) {
  // Fallback estimation when exact match isn't found
  return {
    gpu: 50,
    cpu: 45,
    ram: ramGb >= 16 ? 15 : 55,
  };
}

function generateRecommendations(benchmark, ramGb, targetFps, bottlenecks) {
  const recommendations = [];
  
  if (!bottlenecks) {
    bottlenecks = estimateBottlenecks(benchmark, ramGb, targetFps);
  }

  const mainBottleneck = Object.entries(bottlenecks).sort((a, b) => b[1] - a[1])[0];

  if (mainBottleneck[1] >= 70) {
    if (mainBottleneck[0] === 'gpu') {
      recommendations.push(`Your GPU is the primary bottleneck. Consider upgrading to a newer graphics card for significant FPS gains.`);
      recommendations.push(`Lower graphics settings (textures, shadows, anti-aliasing) to improve FPS with current hardware.`);
    } else if (mainBottleneck[0] === 'cpu') {
      recommendations.push(`Your CPU is limiting performance. Upgrading to a faster processor would help reach ${targetFps} FPS.`);
      recommendations.push(`Close background applications to free up CPU resources.`);
    } else if (mainBottleneck[0] === 'ram') {
      recommendations.push(`Upgrade to at least ${ramGb * 2} GB of RAM for better performance.`);
      recommendations.push(`Close memory-intensive background applications.`);
    }
  }

  if (benchmark.avgFps < targetFps) {
    const deficit = targetFps - benchmark.avgFps;
    recommendations.push(`You're ${Math.round(deficit)} FPS short of your ${targetFps} FPS target.`);
  }

  if (benchmark.resolution === 'R4K' && bottlenecks.gpu >= 50) {
    recommendations.push(`Consider dropping to 1440p for significantly better FPS with minimal visual difference.`);
  }

  if (bottlenecks.cpu < 30 && bottlenecks.gpu >= 60) {
    recommendations.push(`Your CPU can handle more - a GPU upgrade would be most effective.`);
  }

  if (bottlenecks.gpu < 30 && bottlenecks.cpu >= 60) {
    recommendations.push(`Your GPU is underutilized - a CPU upgrade would unlock more performance.`);
  }

  if (ramGb >= 32 && bottlenecks.ram < 20) {
    recommendations.push(`Your RAM is sufficient. Focus on CPU or GPU upgrades for better performance.`);
  }

  return recommendations;
}

function getGameRamRequirement(gameName) {
  const name = gameName.toLowerCase();
  
  // AAA titles
  if (name.includes('warzone') || name.includes('cyberpunk') || name.includes('starfield')) {
    return 16;
  }
  
  // Competitive games
  if (name.includes('valorant') || name.includes('cs') || name.includes('league')) {
    return 8;
  }
  
  // Battle royales
  if (name.includes('fortnite') || name.includes('apex') || name.includes('pubg')) {
    return 12;
  }
  
  // Default
  return 12;
}

function getResolutionName(resolution) {
  const map = {
    'R1080P': '1080p',
    'R1440P': '1440p',
    'R4K': '4K',
  };
  return map[resolution] || resolution;
}
