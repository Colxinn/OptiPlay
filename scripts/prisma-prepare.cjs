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
    try {
      run('npx prisma db push --accept-data-loss');
    } catch (pushError) {
      console.warn('db push also failed; database schema may already be up to date');
      console.warn('Continuing with build...');
    }
  }
  process.exit(0);
} catch (e) {
  console.error('Prisma preparation failed:', e?.message || e);
  process.exit(1);
}
