const { execSync } = require('node:child_process');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // Always generate Prisma client
  run('npx prisma generate');
  
  // Only try migrations if DATABASE_URL is valid
  const rawDbUrl = process.env.DATABASE_URL || "";
  const sanitizedDbUrl = rawDbUrl.trim().replace(/^['\"](.*)['\"]$/, "$1");
  if (sanitizedDbUrl !== rawDbUrl) {
    process.env.DATABASE_URL = sanitizedDbUrl;
  }

  if (sanitizedDbUrl && (sanitizedDbUrl.startsWith('postgresql://') || sanitizedDbUrl.startsWith('postgres://'))) {
    try {
      run('npx prisma migrate deploy');
      console.log('✓ Migrations deployed successfully');
    } catch (e) {
      console.warn('⚠ Migrate deploy skipped (database likely already up to date)');
    }
  } else {
    console.warn('⚠ DATABASE_URL not set or invalid - skipping migrations during build');
  }
  
  console.log('✓ Prisma preparation complete');
  process.exit(0);
} catch (e) {
  console.error('✗ Prisma preparation failed:', e?.message || e);
  process.exit(1);
}
