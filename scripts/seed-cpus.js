require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MODERN_CPUS = [
  // Intel 13th Gen (2022-2023)
  { name: 'Intel Core i9-13900K', slug: 'intel-i9-13900k', family: 'Intel Core 13th Gen', architecture: 'Raptor Lake', releaseYear: 2022, cores: 24, threads: 32, benchmarkScore: 95, tdpWatts: 125, priceUsd: 589 },
  { name: 'Intel Core i7-13700K', slug: 'intel-i7-13700k', family: 'Intel Core 13th Gen', architecture: 'Raptor Lake', releaseYear: 2022, cores: 16, threads: 24, benchmarkScore: 88, tdpWatts: 125, priceUsd: 419 },
  { name: 'Intel Core i5-13600K', slug: 'intel-i5-13600k', family: 'Intel Core 13th Gen', architecture: 'Raptor Lake', releaseYear: 2022, cores: 14, threads: 20, benchmarkScore: 82, tdpWatts: 125, priceUsd: 319 },
  { name: 'Intel Core i5-13400F', slug: 'intel-i5-13400f', family: 'Intel Core 13th Gen', architecture: 'Raptor Lake', releaseYear: 2023, cores: 10, threads: 16, benchmarkScore: 72, tdpWatts: 65, priceUsd: 196 },
  
  // Intel 12th Gen (2021-2022)
  { name: 'Intel Core i9-12900K', slug: 'intel-i9-12900k', family: 'Intel Core 12th Gen', architecture: 'Alder Lake', releaseYear: 2021, cores: 16, threads: 24, benchmarkScore: 90, tdpWatts: 125, priceUsd: 589 },
  { name: 'Intel Core i7-12700K', slug: 'intel-i7-12700k', family: 'Intel Core 12th Gen', architecture: 'Alder Lake', releaseYear: 2021, cores: 12, threads: 20, benchmarkScore: 85, tdpWatts: 125, priceUsd: 409 },
  { name: 'Intel Core i5-12600K', slug: 'intel-i5-12600k', family: 'Intel Core 12th Gen', architecture: 'Alder Lake', releaseYear: 2021, cores: 10, threads: 16, benchmarkScore: 78, tdpWatts: 125, priceUsd: 289 },
  { name: 'Intel Core i5-12400F', slug: 'intel-i5-12400f', family: 'Intel Core 12th Gen', architecture: 'Alder Lake', releaseYear: 2022, cores: 6, threads: 12, benchmarkScore: 68, tdpWatts: 65, priceUsd: 167 },
  
  // Intel 11th Gen (2021)
  { name: 'Intel Core i9-11900K', slug: 'intel-i9-11900k', family: 'Intel Core 11th Gen', architecture: 'Rocket Lake', releaseYear: 2021, cores: 8, threads: 16, benchmarkScore: 75, tdpWatts: 125, priceUsd: 539 },
  { name: 'Intel Core i7-11700K', slug: 'intel-i7-11700k', family: 'Intel Core 11th Gen', architecture: 'Rocket Lake', releaseYear: 2021, cores: 8, threads: 16, benchmarkScore: 72, tdpWatts: 125, priceUsd: 399 },
  { name: 'Intel Core i5-11600K', slug: 'intel-i5-11600k', family: 'Intel Core 11th Gen', architecture: 'Rocket Lake', releaseYear: 2021, cores: 6, threads: 12, benchmarkScore: 65, tdpWatts: 125, priceUsd: 262 },
  { name: 'Intel Core i5-11400F', slug: 'intel-i5-11400f', family: 'Intel Core 11th Gen', architecture: 'Rocket Lake', releaseYear: 2021, cores: 6, threads: 12, benchmarkScore: 62, tdpWatts: 65, priceUsd: 157 },
  
  // Intel 10th Gen (2020)
  { name: 'Intel Core i9-10900K', slug: 'intel-i9-10900k', family: 'Intel Core 10th Gen', architecture: 'Comet Lake', releaseYear: 2020, cores: 10, threads: 20, benchmarkScore: 70, tdpWatts: 125, priceUsd: 488 },
  { name: 'Intel Core i7-10700K', slug: 'intel-i7-10700k', family: 'Intel Core 10th Gen', architecture: 'Comet Lake', releaseYear: 2020, cores: 8, threads: 16, benchmarkScore: 68, tdpWatts: 125, priceUsd: 374 },
  { name: 'Intel Core i5-10600K', slug: 'intel-i5-10600k', family: 'Intel Core 10th Gen', architecture: 'Comet Lake', releaseYear: 2020, cores: 6, threads: 12, benchmarkScore: 60, tdpWatts: 125, priceUsd: 262 },
  { name: 'Intel Core i5-10400F', slug: 'intel-i5-10400f', family: 'Intel Core 10th Gen', architecture: 'Comet Lake', releaseYear: 2020, cores: 6, threads: 12, benchmarkScore: 58, tdpWatts: 65, priceUsd: 157 },

  // AMD Ryzen 7000 Series (2022-2023)
  { name: 'AMD Ryzen 9 7950X', slug: 'amd-ryzen-9-7950x', family: 'AMD Ryzen 7000', architecture: 'Zen 4', releaseYear: 2022, cores: 16, threads: 32, benchmarkScore: 98, tdpWatts: 170, priceUsd: 699 },
  { name: 'AMD Ryzen 9 7900X', slug: 'amd-ryzen-9-7900x', family: 'AMD Ryzen 7000', architecture: 'Zen 4', releaseYear: 2022, cores: 12, threads: 24, benchmarkScore: 92, tdpWatts: 170, priceUsd: 549 },
  { name: 'AMD Ryzen 7 7700X', slug: 'amd-ryzen-7-7700x', family: 'AMD Ryzen 7000', architecture: 'Zen 4', releaseYear: 2022, cores: 8, threads: 16, benchmarkScore: 85, tdpWatts: 105, priceUsd: 399 },
  { name: 'AMD Ryzen 5 7600X', slug: 'amd-ryzen-5-7600x', family: 'AMD Ryzen 7000', architecture: 'Zen 4', releaseYear: 2022, cores: 6, threads: 12, benchmarkScore: 78, tdpWatts: 105, priceUsd: 299 },
  
  // AMD Ryzen 5000 Series (2020-2022)
  { name: 'AMD Ryzen 9 5950X', slug: 'amd-ryzen-9-5950x', family: 'AMD Ryzen 5000', architecture: 'Zen 3', releaseYear: 2020, cores: 16, threads: 32, benchmarkScore: 92, tdpWatts: 105, priceUsd: 799 },
  { name: 'AMD Ryzen 9 5900X', slug: 'amd-ryzen-9-5900x', family: 'AMD Ryzen 5000', architecture: 'Zen 3', releaseYear: 2020, cores: 12, threads: 24, benchmarkScore: 88, tdpWatts: 105, priceUsd: 549 },
  { name: 'AMD Ryzen 7 5800X', slug: 'amd-ryzen-7-5800x', family: 'AMD Ryzen 5000', architecture: 'Zen 3', releaseYear: 2020, cores: 8, threads: 16, benchmarkScore: 82, tdpWatts: 105, priceUsd: 449 },
  { name: 'AMD Ryzen 7 5700X', slug: 'amd-ryzen-7-5700x', family: 'AMD Ryzen 5000', architecture: 'Zen 3', releaseYear: 2022, cores: 8, threads: 16, benchmarkScore: 78, tdpWatts: 65, priceUsd: 299 },
  { name: 'AMD Ryzen 5 5600X', slug: 'amd-ryzen-5-5600x', family: 'AMD Ryzen 5000', architecture: 'Zen 3', releaseYear: 2020, cores: 6, threads: 12, benchmarkScore: 75, tdpWatts: 65, priceUsd: 299 },
  { name: 'AMD Ryzen 5 5600', slug: 'amd-ryzen-5-5600', family: 'AMD Ryzen 5000', architecture: 'Zen 3', releaseYear: 2022, cores: 6, threads: 12, benchmarkScore: 72, tdpWatts: 65, priceUsd: 199 },
  
  // AMD Ryzen 3000 Series (2019)
  { name: 'AMD Ryzen 9 3950X', slug: 'amd-ryzen-9-3950x', family: 'AMD Ryzen 3000', architecture: 'Zen 2', releaseYear: 2019, cores: 16, threads: 32, benchmarkScore: 82, tdpWatts: 105, priceUsd: 749 },
  { name: 'AMD Ryzen 9 3900X', slug: 'amd-ryzen-9-3900x', family: 'AMD Ryzen 3000', architecture: 'Zen 2', releaseYear: 2019, cores: 12, threads: 24, benchmarkScore: 78, tdpWatts: 105, priceUsd: 499 },
  { name: 'AMD Ryzen 7 3700X', slug: 'amd-ryzen-7-3700x', family: 'AMD Ryzen 3000', architecture: 'Zen 2', releaseYear: 2019, cores: 8, threads: 16, benchmarkScore: 72, tdpWatts: 65, priceUsd: 329 },
  { name: 'AMD Ryzen 5 3600', slug: 'amd-ryzen-5-3600', family: 'AMD Ryzen 3000', architecture: 'Zen 2', releaseYear: 2019, cores: 6, threads: 12, benchmarkScore: 65, tdpWatts: 65, priceUsd: 199 },
  
  // Intel 9th Gen (2018-2019)
  { name: 'Intel Core i9-9900K', slug: 'intel-i9-9900k', family: 'Intel Core 9th Gen', architecture: 'Coffee Lake Refresh', releaseYear: 2018, cores: 8, threads: 16, benchmarkScore: 65, tdpWatts: 95, priceUsd: 488 },
  { name: 'Intel Core i7-9700K', slug: 'intel-i7-9700k', family: 'Intel Core 9th Gen', architecture: 'Coffee Lake Refresh', releaseYear: 2018, cores: 8, threads: 8, benchmarkScore: 62, tdpWatts: 95, priceUsd: 374 },
  { name: 'Intel Core i5-9600K', slug: 'intel-i5-9600k', family: 'Intel Core 9th Gen', architecture: 'Coffee Lake Refresh', releaseYear: 2018, cores: 6, threads: 6, benchmarkScore: 55, tdpWatts: 95, priceUsd: 262 },
  { name: 'Intel Core i5-9400F', slug: 'intel-i5-9400f', family: 'Intel Core 9th Gen', architecture: 'Coffee Lake Refresh', releaseYear: 2019, cores: 6, threads: 6, benchmarkScore: 52, tdpWatts: 65, priceUsd: 144 },
  
  // Intel 8th Gen (2017-2018)
  { name: 'Intel Core i7-8700K', slug: 'intel-i7-8700k', family: 'Intel Core 8th Gen', architecture: 'Coffee Lake', releaseYear: 2017, cores: 6, threads: 12, benchmarkScore: 58, tdpWatts: 95, priceUsd: 359 },
  { name: 'Intel Core i5-8600K', slug: 'intel-i5-8600k', family: 'Intel Core 8th Gen', architecture: 'Coffee Lake', releaseYear: 2017, cores: 6, threads: 6, benchmarkScore: 52, tdpWatts: 95, priceUsd: 257 },
  { name: 'Intel Core i5-8400', slug: 'intel-i5-8400', family: 'Intel Core 8th Gen', architecture: 'Coffee Lake', releaseYear: 2017, cores: 6, threads: 6, benchmarkScore: 48, tdpWatts: 65, priceUsd: 182 },
  
  // Intel 7th Gen (2017)
  { name: 'Intel Core i7-7700K', slug: 'intel-i7-7700k', family: 'Intel Core 7th Gen', architecture: 'Kaby Lake', releaseYear: 2017, cores: 4, threads: 8, benchmarkScore: 48, tdpWatts: 91, priceUsd: 339 },
  { name: 'Intel Core i5-7600K', slug: 'intel-i5-7600k', family: 'Intel Core 7th Gen', architecture: 'Kaby Lake', releaseYear: 2017, cores: 4, threads: 4, benchmarkScore: 42, tdpWatts: 91, priceUsd: 242 },
  
  // Intel 6th Gen (2015-2016)
  { name: 'Intel Core i7-6700K', slug: 'intel-i7-6700k', family: 'Intel Core 6th Gen', architecture: 'Skylake', releaseYear: 2015, cores: 4, threads: 8, benchmarkScore: 45, tdpWatts: 91, priceUsd: 339 },
  { name: 'Intel Core i5-6600K', slug: 'intel-i5-6600k', family: 'Intel Core 6th Gen', architecture: 'Skylake', releaseYear: 2015, cores: 4, threads: 4, benchmarkScore: 38, tdpWatts: 91, priceUsd: 243 },
  
  // Intel 4th Gen (2013-2014)
  { name: 'Intel Core i7-4790K', slug: 'intel-i7-4790k', family: 'Intel Core 4th Gen', architecture: 'Haswell Refresh', releaseYear: 2014, cores: 4, threads: 8, benchmarkScore: 42, tdpWatts: 88, priceUsd: 339 },
  { name: 'Intel Core i5-4690K', slug: 'intel-i5-4690k', family: 'Intel Core 4th Gen', architecture: 'Haswell Refresh', releaseYear: 2014, cores: 4, threads: 4, benchmarkScore: 35, tdpWatts: 88, priceUsd: 242 },
  
  // AMD Ryzen 2000 Series (2018)
  { name: 'AMD Ryzen 7 2700X', slug: 'amd-ryzen-7-2700x', family: 'AMD Ryzen 2000', architecture: 'Zen+', releaseYear: 2018, cores: 8, threads: 16, benchmarkScore: 62, tdpWatts: 105, priceUsd: 329 },
  { name: 'AMD Ryzen 5 2600X', slug: 'amd-ryzen-5-2600x', family: 'AMD Ryzen 2000', architecture: 'Zen+', releaseYear: 2018, cores: 6, threads: 12, benchmarkScore: 55, tdpWatts: 95, priceUsd: 229 },
  { name: 'AMD Ryzen 5 2600', slug: 'amd-ryzen-5-2600', family: 'AMD Ryzen 2000', architecture: 'Zen+', releaseYear: 2018, cores: 6, threads: 12, benchmarkScore: 52, tdpWatts: 65, priceUsd: 199 },
  
  // AMD Ryzen 1000 Series (2017)
  { name: 'AMD Ryzen 7 1700X', slug: 'amd-ryzen-7-1700x', family: 'AMD Ryzen 1000', architecture: 'Zen', releaseYear: 2017, cores: 8, threads: 16, benchmarkScore: 55, tdpWatts: 95, priceUsd: 399 },
  { name: 'AMD Ryzen 5 1600', slug: 'amd-ryzen-5-1600', family: 'AMD Ryzen 1000', architecture: 'Zen', releaseYear: 2017, cores: 6, threads: 12, benchmarkScore: 48, tdpWatts: 65, priceUsd: 219 },
];

async function seedCPUs() {
  console.log('Starting CPU seed...\n');
  
  let added = 0;
  let skipped = 0;
  
  for (const cpu of MODERN_CPUS) {
    try {
      const existing = await prisma.cPU.findUnique({
        where: { slug: cpu.slug },
      });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${cpu.name} (already exists)`);
        skipped++;
      } else {
        await prisma.cPU.create({ data: cpu });
        console.log(`✅ Added: ${cpu.name}`);
        added++;
      }
    } catch (error) {
      console.error(`❌ Error adding ${cpu.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Added: ${added} CPUs`);
  console.log(`   Skipped: ${skipped} CPUs (already existed)`);
  console.log(`   Total in database: ${await prisma.cPU.count()}`);
}

seedCPUs()
  .then(() => {
    console.log('\n✅ CPU seed completed!');
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    prisma.$disconnect();
    process.exit(1);
  });
