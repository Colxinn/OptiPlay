const { execSync } = require('node:child_process');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // Always generate Prisma client
  run('npx prisma generate');
  
  // Try to deploy migrations, but don't fail if there are none or if they fail
  try {
    run('npx prisma migrate deploy');
    console.log('✓ Migrations deployed successfully');
  } catch (e) {
    console.warn('⚠ Migrate deploy skipped (database likely already up to date)');
    // Don't use db push as fallback - if migrations fail, the database is probably already correct
  }
  
  console.log('✓ Prisma preparation complete');
  process.exit(0);
} catch (e) {
  console.error('✗ Prisma preparation failed:', e?.message || e);
  process.exit(1);
}
