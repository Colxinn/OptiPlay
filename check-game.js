require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGame() {
  const games = await prisma.game.findMany({
    where: {
      OR: [
        { name: { contains: 'Counter', mode: 'insensitive' } },
        { slug: { contains: 'counter', mode: 'insensitive' } }
      ]
    },
    select: { name: true, slug: true }
  });
  
  console.log('Games matching "Counter":');
  games.forEach(g => console.log(`  Name: "${g.name}"`));
  games.forEach(g => console.log(`  Slug: "${g.slug}"`));
  
  // Also check RTX 4060
  const gpus = await prisma.gPU.findMany({
    where: {
      OR: [
        { name: { contains: '4060', mode: 'insensitive' } },
        { slug: { contains: '4060', mode: 'insensitive' } }
      ]
    },
    select: { name: true, slug: true }
  });
  
  console.log('\nGPUs matching "4060":');
  gpus.forEach(g => console.log(`  Name: "${g.name}"`));
  gpus.forEach(g => console.log(`  Slug: "${g.slug}"`));
  
  // Check CPUs
  const cpus = await prisma.cPU.findMany({
    where: {
      OR: [
        { name: { contains: 'i5-13400', mode: 'insensitive' } },
        { slug: { contains: 'i5-13400', mode: 'insensitive' } }
      ]
    },
    select: { name: true, slug: true }
  });
  
  console.log('\nCPUs matching "i5-13400":');
  cpus.forEach(c => console.log(`  Name: "${c.name}"`));
  cpus.forEach(c => console.log(`  Slug: "${c.slug}"`));
  
  await prisma.$disconnect();
}

checkGame();
