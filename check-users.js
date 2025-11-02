const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const totalUsers = await prisma.user.count();
    console.log('Total users in database:', totalUsers);
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isOwner: true,
        isOG: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    console.log('\nFirst 10 users:');
    users.forEach(user => {
      console.log(`- ${user.name || user.email} (Owner: ${user.isOwner}, OG: ${user.isOG}, Created: ${user.createdAt})`);
    });
    
    const owners = await prisma.user.count({ where: { isOwner: true } });
    console.log(`\nTotal owners: ${owners}`);
    
    const ogUsers = await prisma.user.count({ where: { isOG: true } });
    console.log(`Total OG users: ${ogUsers}`);
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
