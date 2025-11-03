/**
 * Create ProConfig table directly in Neon database
 * Run with: node scripts/create-proconfig-table.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProConfigTable() {
  console.log('🔧 Creating ProConfig table...\n');

  try {
    // Create table with raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProConfig" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "game" TEXT NOT NULL,
          "team" TEXT,
          "sourceUrl" TEXT NOT NULL,
          "sourceName" TEXT NOT NULL,
          "fetchedAt" TIMESTAMP(3) NOT NULL,
          "normalized" JSONB NOT NULL,
          "verified" BOOLEAN NOT NULL DEFAULT false,
          "votes" INTEGER NOT NULL DEFAULT 0,
          "popularity" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "ProConfig_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ ProConfig table created');

    // Create unique constraint
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProConfig_name_game_key" ON "ProConfig"("name", "game");
    `);
    console.log('✅ Unique constraint created (name, game)');

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ProConfig_game_idx" ON "ProConfig"("game");
    `);
    console.log('✅ Index created: game');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ProConfig_popularity_idx" ON "ProConfig"("popularity");
    `);
    console.log('✅ Index created: popularity');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ProConfig_votes_idx" ON "ProConfig"("votes");
    `);
    console.log('✅ Index created: votes');

    console.log('\n🎉 ProConfig table setup complete!');
    console.log('\nNext steps:');
    console.log('  1. Run: npx prisma generate');
    console.log('  2. Run: npm run fetch:proconfigs');

  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Table already exists, skipping creation');
    } else {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createProConfigTable();
