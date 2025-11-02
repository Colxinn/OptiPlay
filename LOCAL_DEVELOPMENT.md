# Local Development Guide

## Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Minimum Required Variables for Local Testing

For basic local development, you only need:

```env
# Database (use a free Neon/Supabase database)
DATABASE_URL="postgresql://..."

# Auth secret (generate with: npx auth secret)
NEXTAUTH_SECRET="your-secret-here"

# Optional: Site URL (defaults to localhost:3000 in dev)
NEXTAUTH_URL="http://localhost:3000"
```

**That's it!** You can leave email settings empty for local testing.

### 3. Email Authentication in Development

#### Option A: Console Logging (Easiest - No Setup)

**Leave `AUTH_EMAIL_SERVER` empty** in your `.env.local`:

```env
# Leave this commented out or empty
# AUTH_EMAIL_SERVER=""
# AUTH_EMAIL_FROM=""
```

When you try to sign in with email:
1. Enter your email on the signin page
2. Check your terminal/console
3. You'll see a magic link printed like this:

```
================================================================================
🔐 MAGIC LINK FOR LOCAL TESTING
================================================================================
Email: test@example.com
Login URL: http://localhost:3000/api/auth/callback/email?token=abc123...
================================================================================

💡 Copy the URL above and paste it in your browser to sign in
   Or check your terminal for MailHog/MailCatcher if running
```

4. Copy and paste the URL into your browser
5. You're signed in! ✅

#### Option B: MailHog (Real Email Testing - Optional)

If you want to test actual email sending locally:

1. **Install MailHog** (catches emails locally):

```bash
# macOS
brew install mailhog

# Windows (download from GitHub)
# https://github.com/mailhog/MailHog/releases

# Linux
go install github.com/mailhog/MailHog@latest
```

2. **Run MailHog**:

```bash
mailhog
```

3. **Configure your `.env.local`**:

```env
AUTH_EMAIL_SERVER="smtp://localhost:1025"
AUTH_EMAIL_FROM="OptiPlay <noreply@localhost>"
```

4. **View emails** at http://localhost:8025

#### Option C: Credentials Provider (Email + Password)

Use email and password instead of magic links:

1. Sign up through the app (it will create an account)
2. Set a password using the profile page
3. Sign in with email + password (no email needed)

### 4. Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed benchmark data
node scripts/generate-benchmarks.mjs
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Optional Features

### Admin Access

Add your email to `OWNER_EMAILS` in `.env.local`:

```env
OWNER_EMAILS="your-email@gmail.com"
```

After signing in, you'll have admin access at `/admin`.

### Google Ads (Testing)

```env
NEXT_PUBLIC_GOOGLE_ADS_ENABLED="false"  # Set to "true" to see placeholder ads
```

### Esports Live Data

Only needed if testing esports features:

```env
TWITCH_CLIENT_ID="your-id"
TWITCH_CLIENT_SECRET="your-secret"
PANDASCORE_API_KEY="your-key"
```

## Common Issues

### "Email configuration error"

**Solution**: Leave `AUTH_EMAIL_SERVER` empty or unset in `.env.local`. The app will print magic links to console instead.

### "Database connection error"

**Solution**: Make sure your `DATABASE_URL` is correct and the database is running.

### "Can't sign in"

**Solution**: 
1. Check your terminal for the magic link
2. Copy the entire URL and paste it in your browser
3. Make sure you're using the same browser that requested the link

### "Prisma schema out of sync"

**Solution**: Run `npx prisma db push` to sync your schema.

## Production Deployment

For production (Vercel), you'll need to set:

```env
# Production database
DATABASE_URL="postgresql://..."

# Auth config
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="strong-secret"

# Email (required in production)
AUTH_EMAIL_SERVER="smtp://user:pass@smtp.sendgrid.net:587"
AUTH_EMAIL_FROM="OptiPlay <noreply@yourdomain.com>"
```

## Tips

- **Use console logging** for quick local testing (no email setup needed)
- **Use MailHog** if you need to test email templates
- **Use credentials provider** if you prefer password-based auth
- Check `.env.example` for all available environment variables
- Never commit `.env.local` to git (it's in `.gitignore`)

## Need Help?

- Check terminal output for magic links
- Look at `.env.example` for reference
- Verify your database connection first
- Make sure port 3000 is available
