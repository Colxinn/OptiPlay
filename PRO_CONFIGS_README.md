# Pro Configs Feature

A comprehensive system for scraping, normalizing, and displaying professional player configurations for CS2 and Valorant.

## Features

- 🎯 Scrapes pro player settings from multiple sources
- 🔄 Normalizes data into a canonical format
- 📊 Stores configs in PostgreSQL with Prisma
- 🗳️ Voting system for popular configs
- 🔍 Search and filter by game/player
- 📋 One-click copy to clipboard
- 🎨 Crosshair visualization
- 📏 Sensitivity conversion (cm/360°)

## Architecture

```
/scripts/proConfigFetcher/
  ├── normalize.ts       - Normalization utilities
  ├── fetchProConfigs.ts - Web scraping with Cheerio
  └── seedProConfigs.ts  - Database seeding script

/app/api/pro-configs/
  └── route.js           - REST API endpoints

/app/components/
  └── ProConfigBrowser.jsx - Frontend component

/app/pro-configs/
  └── page.jsx           - Dedicated page

/cache/prosettings/      - 24hr HTML cache
```

## Data Sources

- **ProSettings.net** - Multi-game pro settings
- **CSGOProSettings.com** - CS2-specific configs
- **ValorantSettings.com** - Valorant-specific configs

## Database Schema

```prisma
model ProConfig {
  id           String   @id @default(cuid())
  name         String   // Player name
  game         String   // 'cs2' | 'valorant'
  team         String?  // Team name
  sourceUrl    String   // Original page URL
  sourceName   String   // Source site name
  fetchedAt    DateTime // Last scrape
  normalized   Json     // Canonical format
  verified     Boolean  @default(false)
  votes        Int      @default(0)
  popularity   Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([name, game])
  @@index([game, popularity, votes])
}
```

## Normalized Config Format

```typescript
interface NormalizedConfig {
  sensitivity?: {
    dpi: number;
    ingame: number;
    zoom?: number;
    cmPer360?: number;
  };
  crosshair?: {
    // CS2
    style?: number;
    color?: string;
    size?: number;
    gap?: number;
    thickness?: number;
    dot?: boolean;
    outline?: boolean;
    
    // Valorant
    innerLineOpacity?: number;
    innerLineLength?: number;
    innerLineThickness?: number;
    innerLineOffset?: number;
    outerLines?: boolean;
  };
  resolution?: string;
  aspectRatio?: string;
  videoSettings?: Record<string, any>;
  binds?: Record<string, string>;
  launchOptions?: string[];
}
```

## Usage

### 1. Run Database Migration

```bash
npx prisma migrate dev --name add-pro-configs
```

### 2. Fetch Pro Configs

```bash
npm run fetch:proconfigs
```

This will:
- Scrape player pages from configured sources
- Normalize settings into canonical format
- Cache HTML for 24 hours
- Insert/update configs in database

### 3. API Endpoints

**GET /api/pro-configs**

Query params:
- `game`: 'cs2' | 'valorant' (optional)
- `limit`: number (default 50, max 100)
- `offset`: number (default 0)
- `sort`: 'popularity' | 'votes' | 'recent'
- `search`: string (player name search)

Example:
```
GET /api/pro-configs?game=cs2&limit=20&sort=votes
```

Response:
```json
{
  "data": [
    {
      "id": "clx123...",
      "name": "s1mple",
      "game": "cs2",
      "team": "NAVI",
      "sourceUrl": "https://prosettings.net/cs2/s1mple/",
      "sourceName": "ProSettings.net",
      "normalized": {
        "sensitivity": {
          "dpi": 400,
          "ingame": 3.09,
          "cmPer360": 28.7
        },
        "crosshair": {
          "style": 4,
          "color": "cyan",
          "size": 2,
          "gap": -3,
          "thickness": 0,
          "dot": false
        }
      },
      "votes": 42,
      "fetchedAt": "2025-01-11T12:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**POST /api/pro-configs**

Vote on a config:
```json
{
  "id": "clx123...",
  "vote": 1  // or -1
}
```

### 4. Frontend Component

```jsx
import ProConfigBrowser from '@/app/components/ProConfigBrowser';

<ProConfigBrowser game="cs2" />
```

### 5. Add More Players

Edit `scripts/proConfigFetcher/seedProConfigs.ts`:

```typescript
const CS2_URLS = [
  'https://prosettings.net/cs2/s1mple/',
  'https://prosettings.net/cs2/zywoo/',
  // Add more URLs...
];
```

## Ethical Scraping

✅ **Compliance:**
- Respects robots.txt
- 24-hour caching to reduce load
- Rate limiting (1-2 second delays)
- User-Agent identifies our service
- Concurrency limit (3 simultaneous)
- Proper attribution on all displays

✅ **Attribution:**
Every display includes source credit:
- Source name (ProSettings.net, etc.)
- Direct link to original page
- Footer attribution on browse page

## Sensitivity Formulas

**CS2:**
```
counts = (360 / 0.022) / sensitivity
inches = counts / dpi
cm/360 = inches * 2.54
```

**Valorant:**
```
counts = (360 * 55.04) / (sensitivity * 0.07)
inches = counts / dpi
cm/360 = inches * 2.54
```

## Caching Strategy

- HTML cached for 24 hours in `/cache/prosettings/`
- Filename: base64(url).substring(0, 200) + '.html'
- Automatic expiration check before fetch
- Reduces load on source sites
- Faster subsequent fetches

## Future Enhancements

- [ ] Cron job for automatic weekly updates
- [ ] Crosshair visual preview renderer
- [ ] Advanced filtering (by team, role, region)
- [ ] Compare multiple configs side-by-side
- [ ] Export to game config files
- [ ] User-submitted configs
- [ ] Popularity tracking based on views
- [ ] Video settings comparison

## Troubleshooting

**"Cannot find module 'cheerio'"**
```bash
npm install
```

**"Property 'proConfig' does not exist"**
```bash
npx prisma generate
```

**Migration fails (shadow DB error)**
```bash
# Use db push instead for development
npx prisma db push
```

**No configs showing**
```bash
# Run the seeder
npm run fetch:proconfigs
```

## License

Educational use only with proper attribution to source sites. Do not abuse scraping capabilities.
