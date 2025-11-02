require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCPUs() {
  const i5_13400f = await prisma.cPU.findUnique({
    where: { slug: 'intel-i5-13400f' },
  });
  
  if (i5_13400f) {
    console.log('✅ Intel i5-13400F found!');
    console.log(`   Cores: ${i5_13400f.cores}, Threads: ${i5_13400f.threads}`);
    console.log(`   Benchmark Score: ${i5_13400f.benchmarkScore}`);
    console.log(`   TDP: ${i5_13400f.tdpWatts}W`);
  } else {
    console.log('❌ Intel i5-13400F not found');
  }
  
  const totalCPUs = await prisma.cPU.count();
  console.log(`\n📊 Total CPUs in database: ${totalCPUs}`);
  
  const recentIntel = await prisma.cPU.findMany({
    where: {
      family: { contains: '13th Gen' },
    },
    select: { name: true, cores: true, threads: true },
    orderBy: { benchmarkScore: 'desc' },
  });
  
  console.log('\n🔵 Intel 13th Gen CPUs:');
  recentIntel.forEach(cpu => console.log(`   - ${cpu.name} (${cpu.cores}C/${cpu.threads}T)`));
  
  await prisma.$disconnect();
}

verifyCPUs();
