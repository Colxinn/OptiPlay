const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createVoteTable() {
  try {
    console.log('Creating ProConfigVote table...');
    
    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProConfigVote" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "configId" TEXT NOT NULL,
        "userId" TEXT,
        "ipAddress" TEXT NOT NULL,
        "vote" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProConfigVote_configId_fkey" FOREIGN KEY ("configId") 
          REFERENCES "ProConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    
    console.log('✅ Table created');
    
    // Create unique constraint
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "ProConfigVote_configId_userId_ipAddress_key" 
        ON "ProConfigVote"("configId", "userId", "ipAddress")
    `);
    
    console.log('✅ Unique constraint created');
    
    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ProConfigVote_configId_idx" 
        ON "ProConfigVote"("configId")
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ProConfigVote_ipAddress_idx" 
        ON "ProConfigVote"("ipAddress")
    `);
    
    console.log('✅ Indexes created');
    console.log('🎉 ProConfigVote table is ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createVoteTable();
