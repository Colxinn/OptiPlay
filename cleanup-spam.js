// Script to clean up spam users from database
// Run with: node cleanup-spam.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SPAM_PATTERNS = [
  /[a-z]{20,}/, // Too many random lowercase letters
  /(.)\1{5,}/, // Same character repeated 6+ times
  /^[a-z]+[0-9]+[a-z]+[0-9]+$/, // Alternating letters and numbers
];

const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
  'mailinator.com', 'trashmail.com', 'getnada.com', 'temp-mail.org',
  'yopmail.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.biz', 'guerrillamail.de',
];

function isSpamEmail(email) {
  if (!email) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  // Check disposable domains
  if (DISPOSABLE_DOMAINS.includes(domain)) return true;
  
  // Check for suspicious patterns in email
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(email)) return true;
  }
  
  return false;
}

function isSpamUsername(username) {
  if (!username) return false;
  
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(username)) return true;
  }
  
  return false;
}

async function cleanupSpam(dryRun = true) {
  console.log('🔍 Scanning for spam users...\n');
  
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isOwner: true,
      createdAt: true,
    }
  });
  
  const spamUsers = allUsers.filter(user => {
    // Never delete owners
    if (user.isOwner) return false;
    
    // Check for spam patterns
    const hasSpamEmail = isSpamEmail(user.email);
    const hasSpamUsername = isSpamUsername(user.name);
    
    return hasSpamEmail || hasSpamUsername;
  });
  
  console.log(`Found ${spamUsers.length} potential spam users out of ${allUsers.length} total users\n`);
  
  if (spamUsers.length > 0) {
    console.log('Spam users:');
    console.log('─'.repeat(80));
    spamUsers.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('─'.repeat(80));
    });
  }
  
  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No users were deleted');
    console.log('Run with "node cleanup-spam.js delete" to actually delete these users');
  } else {
    console.log('\n⚠️  DELETING SPAM USERS...');
    
    for (const user of spamUsers) {
      try {
        // Delete user's related data first
        await prisma.comment.deleteMany({ where: { authorId: user.id } });
        await prisma.post.deleteMany({ where: { authorId: user.id } });
        await prisma.vote.deleteMany({ where: { userId: user.id } });
        
        // Delete the user
        await prisma.user.delete({ where: { id: user.id } });
        
        console.log(`✓ Deleted user: ${user.name} (${user.email})`);
      } catch (err) {
        console.error(`✗ Error deleting user ${user.id}:`, err.message);
      }
    }
    
    console.log(`\n✅ Cleanup complete! Deleted ${spamUsers.length} spam users.`);
  }
  
  await prisma.$disconnect();
}

// Check if delete mode
const deleteMode = process.argv.includes('delete');
cleanupSpam(!deleteMode).catch(console.error);
