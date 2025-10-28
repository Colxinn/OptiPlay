const { execSync } = require('node:child_process');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  run('npx prisma generate');
  try {
    run('npx prisma migrate deploy');
  } catch (e) {
    console.warn('migrate deploy failed or no migrations; falling back to db push');
    run('npx prisma db push');
  }
  process.exit(0);
} catch (e) {
  console.error('Prisma preparation failed:', e?.message || e);
  process.exit(1);
}

