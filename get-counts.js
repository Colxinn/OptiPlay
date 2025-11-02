require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCounts() {
  const cpuCount = await prisma.cPU.count();
  const gpuCount = await prisma.gPU.count();
  const gameCount = await prisma.game.count();
  const benchmarkCount = await prisma.gameBenchmark.count();
  
  console.log('📊 Database Stats:');
  console.log(`   CPUs: ${cpuCount}`);
  console.log(`   GPUs: ${gpuCount}`);
  console.log(`   Games: ${gameCount}`);
  console.log(`   Benchmarks: ${benchmarkCount}`);
  console.log(`\n💡 Potential Combinations: ${cpuCount} × ${gpuCount} × ${gameCount} × 3 = ${cpuCount * gpuCount * gameCount * 3}`);
  
  await prisma.$disconnect();
}

getCounts();
