/**
 * Seed Pro Configs Database
 * Fetches and stores professional player configs
 */

import { PrismaClient } from '@prisma/client';
import { fetchProConfigs } from './fetchProConfigs';

const prisma = new PrismaClient();

// Sample URLs to seed - Using CS2 and Valorant specific pages
const CS2_URLS = [
  'https://prosettings.net/players/s1mple/', // These are CS2 pros
  'https://prosettings.net/players/zywoo/',
  'https://prosettings.net/players/niko/',
  'https://prosettings.net/players/dev1ce/',
  'https://prosettings.net/players/m0nesy/',
  'https://prosettings.net/players/donk/',
];

const VALORANT_URLS = [
  'https://prosettings.net/players/tenz/', // These are Valorant pros  
  'https://prosettings.net/players/aspas/',
  'https://prosettings.net/players/demon1/',
  'https://prosettings.net/players/chronicle/',
];

async function seedProConfigs() {
  console.log('🌱 Starting Pro Config seed...\n');
  
  const allUrls = [...CS2_URLS, ...VALORANT_URLS];
  
  try {
    // Fetch all configs
    console.log(`📥 Fetching ${allUrls.length} pro configs...`);
    const configs = await fetchProConfigs(allUrls);
    
    console.log(`\n✅ Successfully fetched ${configs.length} configs`);
    console.log(`❌ Failed: ${allUrls.length - configs.length}\n`);
    
    // Insert into database
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    
    for (const config of configs) {
      try {
        const result = await prisma.proConfig.upsert({
          where: {
            name_game: {
              name: config.name,
              game: config.game,
            },
          },
          update: {
            team: config.team,
            sourceUrl: config.sourceUrl,
            sourceName: config.sourceName,
            normalized: config.normalized as any,
            fetchedAt: new Date(),
          },
          create: {
            name: config.name,
            game: config.game,
            team: config.team,
            sourceUrl: config.sourceUrl,
            sourceName: config.sourceName,
            normalized: config.normalized as any,
            fetchedAt: new Date(),
            verified: false,
            votes: 0,
            popularity: 0,
          },
        });
        
        if (result.updatedAt > result.createdAt) {
          updated++;
          console.log(`🔄 Updated: ${config.name} (${config.game})`);
        } else {
          inserted++;
          console.log(`✨ Inserted: ${config.name} (${config.game})`);
        }
      } catch (err) {
        failed++;
        console.error(`❌ Failed to save ${config.name}:`, err);
      }
    }
    
    console.log('\n📊 Seed Summary:');
    console.log(`   ✨ Inserted: ${inserted}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📦 Total in DB: ${inserted + updated}`);
    
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedProConfigs()
    .then(() => {
      console.log('\n✅ Seed complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Fatal error:', err);
      process.exit(1);
    });
}

export { seedProConfigs };
