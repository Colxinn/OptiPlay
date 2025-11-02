# 🎯 Unique Visitor Tracking System

Tracks the last 100 unique IP addresses that visit the site. Automatically removes the oldest visitor when the 101st arrives, maintaining a constant rolling window.

## 📊 Features

### 1. **Automatic Tracking**
- Tracks every page load via `VisitorTracker` component in root layout
- Hashes IP addresses for privacy (SHA-256 with salt)
- Captures geo data from Vercel/Cloudflare headers (country, city)
- Stores user agent for analytics

### 2. **Rolling Window (100 visitors)**
- Maintains exactly 100 unique IPs
- When 101st visitor arrives → oldest is automatically removed
- Ensures database doesn't grow indefinitely
- Constant stream of recent visitor data

### 3. **Return Visitor Detection**
- Identifies returning visitors by IP hash
- Increments visit count on each return
- Updates last seen timestamp
- Useful for engagement metrics

### 4. **Admin Dashboard**
- Real-time visitor statistics
- Country breakdown with flags
- Individual visitor details
- Visit frequency analytics

## 🗃️ Database Schema

```sql
CREATE TABLE "UniqueVisitor" (
    "id" TEXT PRIMARY KEY,
    "ipHash" TEXT UNIQUE NOT NULL,
    "userAgent" TEXT,
    "country" TEXT,
    "city" TEXT,
    "firstSeen" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "visitCount" INTEGER DEFAULT 1
);
```

## 🔒 Privacy

- **IP Hashing**: IPs are SHA-256 hashed with a salt before storage
- **No Raw IPs**: Never stores actual IP addresses
- **Configurable Salt**: Set `PING_HASH_SALT` in `.env.local`
- **Auto-Cleanup**: Old data automatically removed
- **GDPR Friendly**: No personal data stored, only hashed identifiers

## 📡 API Endpoints

### `POST /api/visitors`
Track a visitor (called automatically on page load)

**Response:**
```json
{
  "success": true,
  "returning": false,
  "visitCount": 1
}
```

### `GET /api/visitors`
Get basic visitor statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "uniqueVisitors": 87,
    "totalVisits": 234,
    "maxCapacity": 100,
    "percentFull": 87
  }
}
```

### `GET /api/visitors?list=true`
Get detailed visitor list with country breakdown

**Response:**
```json
{
  "success": true,
  "stats": {
    "uniqueVisitors": 87,
    "totalVisits": 234,
    "maxCapacity": 100,
    "percentFull": 87,
    "visitors": [...],
    "byCountry": {
      "US": 32,
      "GB": 18,
      "CA": 12
    },
    "topCountries": [
      { "country": "US", "count": 32 },
      { "country": "GB", "count": 18 }
    ]
  }
}
```

## 🎨 Admin Panel Features

### Stats Overview
- **Unique Visitors**: Current count of tracked IPs
- **Total Visits**: Sum of all visit counts
- **Capacity Used**: Percentage of 100-slot limit
- **Avg Visits/User**: Return rate metric

### Progress Bar
- Visual indicator of capacity usage
- Warning when at 100% capacity
- Shows remaining slots

### Top Countries
- Bar chart of visitor distribution
- Flag emojis for visual identification
- Percentage breakdown

### Visitor List Table
- Location (city, country with flag)
- First seen timestamp
- Last seen with "time ago" format
- Visit count badges

## 🔧 Implementation

### 1. Database Migration
```bash
# Migration already created at:
prisma/migrations/20241101_add_unique_visitor_tracking/migration.sql

# Apply to production database via Vercel:
# It will auto-apply on next deployment

# Or manually apply:
npx prisma migrate deploy
```

### 2. Components

**Root Layout** (`app/layout.jsx`)
```jsx
import VisitorTracker from './components/VisitorTracker.jsx';

// Inside <SessionProvider>:
<VisitorTracker />
```

**Admin Panel** (`app/admin/page.jsx`)
```jsx
import VisitorStats from '../components/VisitorStats.jsx';

// In admin page:
<VisitorStats />
```

### 3. Environment Variables

Add to `.env.local`:
```bash
PING_HASH_SALT="your-random-secret-salt-here"
```

Generate a random salt:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📈 Use Cases

### 1. **Traffic Monitoring**
- See real-time unique visitor count
- Track growth trends
- Identify peak traffic times

### 2. **Geographic Analytics**
- Understand audience distribution
- Identify top countries
- Plan localization efforts

### 3. **Engagement Metrics**
- Track return visitor rate
- Average visits per user
- User retention insights

### 4. **Capacity Planning**
- Monitor database growth
- Ensure rolling window works
- Prevent data bloat

## 🚀 How It Works

### Visitor Flow
```
User visits page
    ↓
VisitorTracker component mounts
    ↓
POST /api/visitors
    ↓
Get IP from headers (x-forwarded-for, x-real-ip)
    ↓
Hash IP with SHA-256 + salt
    ↓
Check if IP hash exists in database
    ↓
If exists:
  - Update lastSeen timestamp
  - Increment visitCount
  - Return { returning: true, visitCount: N }
    ↓
If new:
  - Check total visitor count
  - If >= 100: Delete oldest visitor (by firstSeen)
  - Insert new visitor record
  - Return { returning: false, visitCount: 1 }
```

### Auto-Cleanup Algorithm
```javascript
if (totalVisitors >= MAX_VISITORS) {
  const oldest = await prisma.uniqueVisitor.findFirst({
    orderBy: { firstSeen: 'asc' }
  });
  await prisma.uniqueVisitor.delete({ where: { id: oldest.id } });
}
```

## 🎯 Example Admin View

```
┌─────────────────────────────────────────┐
│ Unique Visitors: 87                     │
│ Total Visits: 234                       │
│ Capacity: 87%                           │
│ Avg Visits/User: 2.7                    │
└─────────────────────────────────────────┘

Progress: ██████████████████░░ 87/100

Top Countries:
1. 🇺🇸 United States    ████████░░ 32
2. 🇬🇧 United Kingdom   █████░░░░░ 18
3. 🇨🇦 Canada          ███░░░░░░░ 12

Recent Visitors:
┌──────────────┬───────────────┬─────────────┬────────┐
│ Location     │ First Seen    │ Last Seen   │ Visits │
├──────────────┼───────────────┼─────────────┼────────┤
│ 🇺🇸 New York │ Nov 1, 2:30pm │ 2m ago      │ 5      │
│ 🇬🇧 London   │ Nov 1, 1:15pm │ 15m ago     │ 3      │
│ 🇨🇦 Toronto  │ Oct 31, 8:00pm│ 1h ago      │ 12     │
└──────────────┴───────────────┴─────────────┴────────┘
```

## ⚠️ Notes

- IP hashing is one-way - cannot recover original IPs
- Geo data depends on proxy headers (Vercel/Cloudflare)
- Visitor count resets if IP changes (dynamic IPs, VPN)
- Max 100 visitors maintained at all times
- Database size stays constant (auto-cleanup)

## 🔮 Future Enhancements

- [ ] Export visitor data to CSV
- [ ] Real-time WebSocket updates
- [ ] Visitor heatmap on world map
- [ ] Hourly traffic graphs
- [ ] Browser/OS statistics from user agent
- [ ] Referrer tracking
- [ ] Session duration estimates
- [ ] Bot detection and filtering
