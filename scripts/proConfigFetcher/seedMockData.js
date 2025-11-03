/**
 * Seed Mock Pro Configs for testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockConfigs = [
  {
    name: 's1mple',
    game: 'cs2',
    team: 'NAVI',
    sourceUrl: 'https://prosettings.net/cs2/s1mple/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 400,
        ingame: 3.09,
        cmPer360: 28.7
      },
      crosshair: {
        style: 4,
        color: 'cyan',
        size: 2,
        gap: -3,
        thickness: 0,
        dot: false,
        outline: true
      },
      resolution: '1280x960',
      aspectRatio: '4:3'
    }
  },
  {
    name: 'ZywOo',
    game: 'cs2',
    team: 'Vitality',
    sourceUrl: 'https://prosettings.net/cs2/zywoo/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 400,
        ingame: 2.0,
        cmPer360: 44.3
      },
      crosshair: {
        style: 4,
        color: 'green',
        size: 3,
        gap: -2,
        thickness: 1,
        dot: false,
        outline: false
      },
      resolution: '1280x960',
      aspectRatio: '4:3'
    }
  },
  {
    name: 'NiKo',
    game: 'cs2',
    team: 'G2',
    sourceUrl: 'https://prosettings.net/cs2/niko/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 1600,
        ingame: 0.77,
        cmPer360: 27.9
      },
      crosshair: {
        style: 4,
        color: 'cyan',
        size: 2.5,
        gap: -3,
        thickness: 0.5,
        dot: false,
        outline: true
      },
      resolution: '1280x960',
      aspectRatio: '4:3'
    }
  },
  {
    name: 'device',
    game: 'cs2',
    team: 'Astralis',
    sourceUrl: 'https://prosettings.net/cs2/device/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 400,
        ingame: 1.9,
        cmPer360: 46.7
      },
      crosshair: {
        style: 5,
        color: 'yellow',
        size: 1,
        gap: -5,
        thickness: 0,
        dot: true,
        outline: false
      },
      resolution: '1920x1080',
      aspectRatio: '16:9'
    }
  },
  {
    name: 'TenZ',
    game: 'valorant',
    team: 'Sentinels',
    sourceUrl: 'https://prosettings.net/valorant/tenz/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 800,
        ingame: 0.35,
        cmPer360: 24.1
      },
      crosshair: {
        color: 'white',
        innerLineOpacity: 1,
        innerLineLength: 6,
        innerLineThickness: 2,
        innerLineOffset: 3,
        centerDot: true
      },
      resolution: '1920x1080',
      aspectRatio: '16:9'
    }
  },
  {
    name: 'aspas',
    game: 'valorant',
    team: 'LOUD',
    sourceUrl: 'https://prosettings.net/valorant/aspas/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 800,
        ingame: 0.336,
        cmPer360: 25.1
      },
      crosshair: {
        color: 'cyan',
        innerLineOpacity: 1,
        innerLineLength: 4,
        innerLineThickness: 2,
        innerLineOffset: 2,
        centerDot: false
      },
      resolution: '1920x1080',
      aspectRatio: '16:9'
    }
  },
  {
    name: 'Demon1',
    game: 'valorant',
    team: 'EG',
    sourceUrl: 'https://prosettings.net/valorant/demon1/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 800,
        ingame: 0.3,
        cmPer360: 28.1
      },
      crosshair: {
        color: 'white',
        innerLineOpacity: 0.8,
        innerLineLength: 6,
        innerLineThickness: 2,
        innerLineOffset: 4,
        centerDot: true
      },
      resolution: '1920x1080',
      aspectRatio: '16:9'
    }
  },
  {
    name: 'f0rest',
    game: 'cs2',
    team: 'Dignitas',
    sourceUrl: 'https://prosettings.net/cs2/f0rest/',
    sourceName: 'ProSettings.net',
    normalized: {
      sensitivity: {
        dpi: 400,
        ingame: 3.5,
        cmPer360: 25.3
      },
      crosshair: {
        style: 4,
        color: 'green',
        size: 2,
        gap: -1,
        thickness: 1,
        dot: true,
        outline: true
      },
      resolution: '1024x768',
      aspectRatio: '4:3'
    }
  }
];

async function seedMockData() {
  console.log('🌱 Seeding mock pro configs...\n');

  let inserted = 0;
  let updated = 0;

  for (const config of mockConfigs) {
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
          normalized: config.normalized,
          fetchedAt: new Date(),
        },
        create: {
          name: config.name,
          game: config.game,
          team: config.team,
          sourceUrl: config.sourceUrl,
          sourceName: config.sourceName,
          normalized: config.normalized,
          fetchedAt: new Date(),
          verified: true,
          votes: Math.floor(Math.random() * 50),
          popularity: Math.floor(Math.random() * 100),
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
      console.error(`❌ Failed to save ${config.name}:`, err.message);
    }
  }

  console.log('\n📊 Mock Seed Summary:');
  console.log(`   ✨ Inserted: ${inserted}`);
  console.log(`   🔄 Updated: ${updated}`);
  console.log(`   📦 Total: ${inserted + updated}`);

  await prisma.$disconnect();
}

seedMockData()
  .then(() => {
    console.log('\n✅ Mock data seeded successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
