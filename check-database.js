require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...\n');
    
    // Check all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('Tables in database:');
    console.log(tables);
    
    // Check User table specifically
    const userTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nUser table columns:');
    console.log(userTableInfo);
    
    // Try to select all users directly
    const users = await prisma.$queryRaw`SELECT * FROM "User" LIMIT 5;`;
    console.log('\nDirect query - Users:');
    console.log(users);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
