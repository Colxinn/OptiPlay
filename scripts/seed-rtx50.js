// Seed RTX 50 series GPUs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const rtx50Series = [
  // RTX 5090 Ti
  { 
    name: 'NVIDIA GeForce RTX 5090 Ti', 
    slug: generateSlug('NVIDIA GeForce RTX 5090 Ti'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 98.0,
    powerDraw: 600,
    priceUsd: 2499
  },
  
  // RTX 5090
  { 
    name: 'NVIDIA GeForce RTX 5090', 
    slug: generateSlug('NVIDIA GeForce RTX 5090'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 95.0,
    powerDraw: 500,
    priceUsd: 1999
  },
  
  // RTX 5080 Ti
  { 
    name: 'NVIDIA GeForce RTX 5080 Ti', 
    slug: generateSlug('NVIDIA GeForce RTX 5080 Ti'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 88.0,
    powerDraw: 400,
    priceUsd: 1299
  },
  
  // RTX 5080
  { 
    name: 'NVIDIA GeForce RTX 5080', 
    slug: generateSlug('NVIDIA GeForce RTX 5080'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 83.0,
    powerDraw: 350,
    priceUsd: 999
  },
  
  // RTX 5070 Ti
  { 
    name: 'NVIDIA GeForce RTX 5070 Ti', 
    slug: generateSlug('NVIDIA GeForce RTX 5070 Ti'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 76.0,
    powerDraw: 300,
    priceUsd: 799
  },
  
  // RTX 5070
  { 
    name: 'NVIDIA GeForce RTX 5070', 
    slug: generateSlug('NVIDIA GeForce RTX 5070'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 70.0,
    powerDraw: 250,
    priceUsd: 599
  },
  
  // RTX 5060 Ti
  { 
    name: 'NVIDIA GeForce RTX 5060 Ti', 
    slug: generateSlug('NVIDIA GeForce RTX 5060 Ti'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 62.0,
    powerDraw: 220,
    priceUsd: 499
  },
  
  // RTX 5060
  { 
    name: 'NVIDIA GeForce RTX 5060', 
    slug: generateSlug('NVIDIA GeForce RTX 5060'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 55.0,
    powerDraw: 170,
    priceUsd: 349
  },
  
  // RTX 5050
  { 
    name: 'NVIDIA GeForce RTX 5050', 
    slug: generateSlug('NVIDIA GeForce RTX 5050'),
    family: 'GeForce RTX 50 Series',
    architecture: 'Blackwell',
    releaseYear: 2025,
    avgScore: 45.0,
    powerDraw: 130,
    priceUsd: 249
  },
];

async function seedRTX50Series() {
  console.log('🎮 Seeding RTX 50 Series GPUs...\n');

  let added = 0;
  let skipped = 0;

  for (const gpu of rtx50Series) {
    const existing = await prisma.gPU.findFirst({
      where: { name: gpu.name }
    });

    if (existing) {
      console.log(`⏭️  Skipped: ${gpu.name} (already exists)`);
      skipped++;
    } else {
      await prisma.gPU.create({ data: gpu });
      console.log(`✅ Added: ${gpu.name} - ${gpu.powerDraw}W TDP, $${gpu.priceUsd}`);
      added++;
    }
  }

  console.log(`\n🎉 Done! Added ${added} new GPUs, skipped ${skipped} existing.`);
  
  // Show total GPU count
  const totalGPUs = await prisma.gPU.count();
  console.log(`📊 Total GPUs in database: ${totalGPUs}`);

  await prisma.$disconnect();
}

seedRTX50Series().catch((err) => {
  console.error('Error seeding RTX 50 series:', err);
  process.exit(1);
});
