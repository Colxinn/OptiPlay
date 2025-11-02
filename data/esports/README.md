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
