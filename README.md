# OptiPlay — Full (Forum, Polls, Auth placeholders)

This project includes:
- Next.js (app router)
- Tailwind styling (purple theme)
- Prisma + SQLite schema for Users, Posts, Comments, Votes
- NextAuth route with Google + Discord providers (placeholders)
- Dev-simulated auth for local testing (set NEXT_PUBLIC_USE_DEV_AUTH=true)

## Quick local run (Windows / macOS / Linux)

1. Unzip into a folder, open in VS Code.
2. Copy `.env.example` to `.env.local` and edit if desired. For local testing you can leave Google/Discord blank, but set:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXT_PUBLIC_USE_DEV_AUTH=true
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=dev-secret
   ```
3. Install dependencies:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```
   This will create `dev.db` SQLite file and run migrations.
4. Run the app:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000. Use the **Dev Login (owner)** button in the header to simulate logging in as the owner for testing.

## How auth works locally vs deployed
- **Local (dev):** The project uses a simple simulated auth. Click **Dev Login (owner)** in the header to set a dev user in `localStorage`. API routes expect an `x-dev-user` header which the client sends automatically in dev-mode fetches.
- **Production:** When you deploy to Vercel, set `NEXT_PUBLIC_USE_DEV_AUTH=false` and provide real Google and Discord client IDs/secrets in Vercel environment variables. Also set `NEXTAUTH_URL` to your production URL and `NEXTAUTH_SECRET`.

## Deploying to Vercel
1. Create a GitHub repo and push this project.
2. Create an account at https://vercel.com and import the GitHub repo.
3. Set environment variables in Vercel dashboard (DATABASE_URL for production, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, DISCORD_CLIENT_ID/SECRET, NEXT_PUBLIC_USE_DEV_AUTH=false).
4. Vercel will run `npx prisma generate` during build. For migrations, you can use Vercel's CLI or run migrations manually and upload a managed Postgres for production (recommended).

## Making yourself the owner after deploy
- After first real login via NextAuth, the app will mark the first user as `isOwner=true`. Alternatively, you can update the `isOwner` field for your user directly via Prisma/Database admin tools.

If you want, I can now:
- Zip this and give it to you,
- Or push it to a GitHub repo and walk you through Vercel deploy step-by-step.
