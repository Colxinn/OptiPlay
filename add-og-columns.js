require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addOGColumns() {
  try {
    console.log('Adding isOG column...');
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isOG" BOOLEAN NOT NULL DEFAULT false`;
    
    console.log('Adding ogGrantedAt column...');
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ogGrantedAt" TIMESTAMP`;
    
    console.log('✅ OG columns added successfully!');
    
    // Verify
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, isOwner: true, isOG: true },
      take: 5,
    });
    
    console.log('\nVerified users:');
    users.forEach(u => console.log(`- ${u.name || u.email} (Owner: ${u.isOwner}, OG: ${u.isOG})`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addOGColumns();
