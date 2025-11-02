# Esports Live Matches Data

This directory contains live match data for the esports page.

## File Structure

### `live-matches.json`
Contains an array of match objects with the following structure:

```json
{
  "id": "unique-match-id",
  "game": "Full Game Name",
  "gameSlug": "game-slug",
  "tournament": "Tournament Name",
  "status": "live|upcoming|finished",
  "startTime": "ISO 8601 timestamp",
  "team1": {
    "name": "Team Name",
    "logo": "https://team-logo-url.png",
    "score": 0,
    "odds": -250
  },
  "team2": {
    "name": "Team Name",
    "logo": "https://team-logo-url.png", 
    "score": 0,
    "odds": 200
  },
  "format": "BO3|BO5|BO1",
  "map": "Map name or null",
  "mapNumber": 0,
  "streamUrl": "https://twitch.tv/channel"
}
```

## Odds Format

Odds use American format (moneyline):
- **Negative odds** (e.g., -250): The team is favored
  - `-100 to -149`: Minor favorite
  - `-150 to -199`: Slight favorite  
  - `-200 to -299`: Moderate favorite
  - `-300 to -499`: Strong favorite
  - `-500 to -999`: Heavy favorite
  - `-1000+`: Extremely heavy favorite

- **Positive odds** (e.g., +200): The team is underdog
  - `+100 to +149`: Minor underdog
  - `+150 to +199`: Slight underdog
  - `+200 to +299`: Moderate underdog
  - `+300 to +499`: Strong underdog
  - `+500 to +999`: Heavy underdog
  - `+1000+`: Extreme underdog

## Supported Games

- Counter-Strike 2 (`cs2`)
- Valorant (`valorant`)
- League of Legends (`league-of-legends`)
- Dota 2 (`dota-2`)
- Rocket League (`rocket-league`)
- Rainbow Six Siege (`rainbow-six`)

## Match Status

- `live`: Match is currently in progress
- `upcoming`: Match hasn't started yet
- `finished`: Match has concluded

## API Integration

To integrate with a live API (e.g., PandaScore, Abios, etc.), modify:
- `/app/api/esports/live/route.js` - Replace file reading with API calls
- Consider caching responses to avoid rate limits
- Update match data every 30-60 seconds

## Adding Matches

1. Open `data/esports/live-matches.json`
2. Add new match object following the structure above
3. Ensure odds are in correct American format (negative for favorites)
4. Update `status` as matches progress
5. The page auto-refreshes every 30 seconds

## Future Enhancements

- [ ] Integrate with PandaScore API for real-time data
- [ ] Add historical match results
- [ ] Player statistics and lineups
- [ ] Betting trend indicators
- [ ] Social media integration for live tweets
- [ ] Push notifications for favorite teams

## Live Data Sources Integration

The esports system now pulls from multiple sources to verify match status:

### 1. Twitch API (Stream Verification)
Verifies if streams are actually live and shows viewer counts.

**Setup:**
1. Go to https://dev.twitch.tv/console/apps
2. Create a new application
3. Add to `.env.local`:
```
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
```

### 2. PandaScore (Match Data)
Provides real-time scores and match status for CS:GO, Valorant, LoL, Dota 2, etc.

**Setup:**
1. Sign up at https://pandascore.co/
2. Get free tier API key (5000 requests/month)
3. Add to `.env.local`:
```
PANDASCORE_API_KEY=your_api_key
```

### 3. Automated Scraping (Fallback)
- **HLTV.org** - CS2 matches
- **VLR.gg** - Valorant matches
- **Liquipedia** - All games (future)

No setup required, works automatically as fallback.

### How It Works

1. Base match data from `live-matches.json`
2. System queries Twitch API to verify streams are live
3. Cross-references with PandaScore for score updates
4. Checks HLTV/VLR for additional confirmation
5. If stream is offline and no other sources confirm, match status changes to "upcoming"
6. Shows "Verified: twitch, pandascore, hltv" badges for confirmed matches

### Data Source Priority

1. **Twitch Stream Status** - Primary indicator (if offline, match likely not live)
2. **PandaScore API** - Authoritative for scores and status
3. **HLTV/VLR Scraping** - Additional confirmation
4. **Manual JSON** - Fallback when APIs unavailable

### Without API Keys

The system works fine without API keys but will:
- Not verify stream status (assumes matches marked "live" are correct)
- Not update scores automatically
- Not show viewer counts
- Not validate match status

Recommended to add at least Twitch credentials for basic stream verification (it's free).

