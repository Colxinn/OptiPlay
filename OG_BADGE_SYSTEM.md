# OG Badge System Documentation

## Overview
The OG (Original Gangster) badge system rewards early adopters who sign up between **November 2-26, 2025** with lifetime premium features and a distinctive shimmering yellow-orange badge next to their username.

## Features

### 1. **Automatic OG Status Grant**
- Users who register during the eligibility period (Nov 2-26, 2025) automatically receive OG status
- Database fields: `isOG` (boolean) and `ogGrantedAt` (timestamp)

### 2. **Welcome Notification**
- Full-screen celebration modal appears once for new OG users
- Shows 4 key benefits:
  - 🎖️ Exclusive OG Badge
  - 💎 Lifetime Premium Features (features TBD)
  - 🚀 Priority Support Access
  - ⭐ Early Access to New Features
- Uses sessionStorage to prevent re-showing
- Email-style gradient design with animated effects

### 3. **Shimmering OG Badge**
- Small "OG" badge displayed next to username throughout the site
- Yellow-orange gradient animation (amber → orange → yellow)
- Dual animation effects:
  - Diagonal shimmer sweep (3s loop)
  - Text gradient shift (2s loop)
- Less flashy than admin badge (purple) but still distinctive

### 4. **Site-wide Integration**
- Badge appears on:
  - Forum posts
  - Comments
  - User profiles
  - Admin panel user lists
  - Any location where usernames are displayed

## Technical Implementation

### Database Schema
```sql
-- Add to User model in schema.prisma
isOG Boolean @default(false)
ogGrantedAt DateTime?
```

### Core Files

#### `lib/ogBadge.js`
Utility functions for OG eligibility:
- `isOGEligibleNow()` - Check if current date is within program window
- `getOGBadgeData()` - Get OG data for new user creation
- `userQualifiesForOG(createdAt)` - Validate historical eligibility

#### `app/components/OGBadge.jsx`
Visual badge component with:
- Inline display (works in flex layouts)
- CSS-in-JS shimmer animations
- Yellow-orange gradient styling
- Accessibility title tooltip

#### `app/components/OGWelcomeBanner.jsx`
Full-screen celebration modal:
- Session-based display control
- Animated gradient backgrounds
- Benefit list with emoji bullets
- Program end date countdown

#### `app/api/auth/register/route.js`
Auto-grants OG status during registration:
```javascript
const ogData = getOGBadgeData();
const user = await prisma.user.create({
  data: {
    ...ogData,
    // other user fields
  }
});
```

#### `lib/auth.js`
Propagates OG status through auth system:
- Added to user select queries
- Included in JWT token
- Available in session object

### Database Queries Updated
All forum and comment queries now include:
```javascript
author: {
  select: {
    // ...other fields
    isOG: true,
  }
}
```

Updated files:
- `app/forum/page.jsx` - Forum list
- `app/forum/[id]/page.jsx` - Post detail and comments
- `app/forum/ForumList.jsx` - UI component
- `app/forum/[id]/ForumPostClient.jsx` - UI component

## Deployment Steps

### 1. Database Migration
Run the SQL migration to add OG fields:
```bash
# Option A: Use the SQL file directly
psql $DATABASE_URL < OG_BADGE_SETUP.sql

# Option B: Run SQL manually
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isOG" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ogGrantedAt" TIMESTAMP;
```

### 2. Regenerate Prisma Client
```bash
npx prisma generate
```

### 3. Deploy Code
Push all changes to production. The system will automatically:
- Grant OG status to new signups during Nov 2-26
- Show welcome banner to new OG users
- Display badges next to OG usernames

### 4. (Optional) Grant OG to Existing Users
If you want to reward users who signed up before the system was implemented:
```sql
-- Grant OG to all users created before Nov 26, 2025
UPDATE "User"
SET "isOG" = true,
    "ogGrantedAt" = "createdAt"
WHERE "createdAt" >= '2025-11-02T00:00:00Z'
  AND "createdAt" <= '2025-11-26T23:59:59Z'
  AND "isOG" = false;
```

## Testing Checklist

- [ ] Database columns exist (`isOG`, `ogGrantedAt`)
- [ ] Prisma client regenerated
- [ ] New user registration during Nov 2-26 grants OG status
- [ ] OG welcome banner appears for new OG users (once only)
- [ ] OG badge displays next to usernames in forum posts
- [ ] OG badge displays next to usernames in comments
- [ ] Badge animations work (shimmer effect visible)
- [ ] Session includes `isOG` field
- [ ] JWT token includes `isOG` field

## Future Premium Features
The OG badge currently grants:
- Visual prestige (shimmering badge)
- Welcome celebration
- **Lifetime premium access** (specific features TBD)

Potential premium features to implement:
- Ad-free experience
- Custom profile themes
- Early access to new tools
- Enhanced upload limits
- Priority customer support
- Exclusive Discord channel
- Beta feature access

## Configuration

### Modify Program Dates
Edit `lib/ogBadge.js`:
```javascript
const OG_PROGRAM_START = new Date('2025-11-02T00:00:00Z');
const OG_PROGRAM_END = new Date('2025-11-26T23:59:59Z');
```

### Adjust Badge Styling
Edit `app/components/OGBadge.jsx`:
- Colors: Change gradient colors in `from-amber-500` etc.
- Animation speed: Modify `animation: shimmer 3s infinite`
- Size: Adjust `text-[10px]` and padding values

### Customize Welcome Banner
Edit `app/components/OGWelcomeBanner.jsx`:
- Benefits list: Modify the 4 bullet points
- Styling: Change gradient colors and effects
- Timing: Adjust animation durations

## Troubleshooting

### OG Badge Not Showing
1. Check database has `isOG` column
2. Verify user has `isOG = true` in database
3. Ensure queries include `isOG: true` in select
4. Check browser console for errors

### Welcome Banner Not Appearing
1. Check `sessionStorage.getItem('og_banner_seen')` - clear if needed
2. Verify session includes `isOG` field
3. Check user signed up during eligibility window
4. Ensure `OGWelcomeBanner` is in layout.jsx

### Shimmer Animation Not Working
1. Verify CSS-in-JS styles are loading
2. Check browser supports backdrop-filter
3. Test in different browsers (may need prefixes)
4. Inspect element to see if styles are applied

## Notes

- OG status is **permanent** - never expires
- Badge color intentionally less flashy than admin (purple) badge
- Program creates urgency for signups during 24-day window
- Welcome banner only shows once per browser (sessionStorage)
- System is future-proof - can add premium features later without code changes
