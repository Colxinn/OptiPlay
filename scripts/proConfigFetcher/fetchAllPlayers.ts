/**
 * Fetch ALL pro players from ProSettings.net
 * This will scrape the list pages to get all player URLs, then fetch their configs
 */

import * as cheerio from 'cheerio';
import { fetchProConfigs } from './fetchProConfigs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PlayerLink {
  name: string;
  url: string;
  game: string;
}

/**
 * Scrape the CS2 or Valorant list page to get all player URLs
 */
async function getPlayerLinks(game: 'cs2' | 'valorant'): Promise<PlayerLink[]> {
  const listUrl = game === 'cs2' 
    ? 'https://prosettings.net/lists/cs2/'
    : 'https://prosettings.net/lists/valorant/';
  
  console.log(`🌐 Fetching ${game.toUpperCase()} player list from ${listUrl}...`);
  
  const response = await fetch(listUrl, {
    headers: {
      'User-Agent': 'OptiPlay Config Aggregator (https://optiplay.gg) - Educational use with attribution',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${listUrl}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const players: PlayerLink[] = [];
  
  // The table contains links to player pages
  // Look for links in the format /players/PLAYERNAME/
  $('a[href*="/players/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('/players/') && !href.includes('#')) {
      const fullUrl = href.startsWith('http') ? href : `https://prosettings.net${href}`;
      const name = $(el).text().trim();
      
      // Avoid duplicates
      if (name && !players.some(p => p.url === fullUrl)) {
        players.push({
          name,
          url: fullUrl,
          game,
        });
      }
    }
  });
  
  console.log(`✅ Found ${players.length} ${game.toUpperCase()} players`);
  return players;
}

/**
 * Main function to fetch all players
 */
async function fetchAllPlayers() {
  console.log('🚀 Starting FULL pro config scrape...\n');
  
  try {
    // Get all player links
    const cs2Players = await getPlayerLinks('cs2');
    const valorantPlayers = await getPlayerLinks('valorant');
    
    const allPlayers = [...cs2Players, ...valorantPlayers];
    console.log(`\n📊 Total players to fetch: ${allPlayers.length}`);
    console.log(`   CS2: ${cs2Players.length}`);
    console.log(`   Valorant: ${valorantPlayers.length}\n`);
    
    // Extract just URLs
    const urls = allPlayers.map(p => p.url);
    
    // Fetch all configs (with concurrency limiting and caching)
    console.log('📥 Starting fetch process (this will take a while)...\n');
    const configs = await fetchProConfigs(urls);
    
    console.log(`\n✅ Successfully fetched ${configs.length} configs`);
    console.log(`❌ Failed: ${urls.length - configs.length}\n`);
    
    // Insert into database
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    
    console.log('💾 Saving to database...\n');
    
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
          if (updated % 50 === 0) {
            console.log(`🔄 Updated ${updated} configs...`);
          }
        } else {
          inserted++;
          if (inserted % 50 === 0) {
            console.log(`✨ Inserted ${inserted} configs...`);
          }
        }
      } catch (err: any) {
        failed++;
        console.error(`❌ Failed to save ${config.name}:`, err.message);
      }
    }
    
    console.log('\n📊 Final Summary:');
    console.log(`   ✨ Inserted: ${inserted}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📦 Total in DB: ${inserted + updated}`);
    console.log(`\n🎉 ALL DONE!`);
    
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fetchAllPlayers()
    .then(() => {
      console.log('\n✅ Complete!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Fatal error:', err);
      process.exit(1);
    });
}

export { fetchAllPlayers, getPlayerLinks };
