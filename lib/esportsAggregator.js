/**
 * Aggregates live esports data from multiple sources
 * Sources: Twitch API, PandaScore, Liquipedia, HLTV, VLR.gg
 */

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const PANDASCORE_API_KEY = process.env.PANDASCORE_API_KEY;

let twitchAccessToken = null;
let twitchTokenExpiry = 0;

/**
 * Get Twitch OAuth token
 */
export async function getTwitchToken() {
  if (twitchAccessToken && Date.now() < twitchTokenExpiry) {
    return twitchAccessToken;
  }

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    console.warn('Twitch credentials not configured');
    return null;
  }

  try {
    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      })
    });

    const data = await response.json();
    twitchAccessToken = data.access_token;
    twitchTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1min early
    return twitchAccessToken;
  } catch (error) {
    console.error('Failed to get Twitch token:', error);
    return null;
  }
}

/**
 * Check if Twitch streams are live
 */
async function getTwitchLiveStatus(channels) {
  const token = await getTwitchToken();
  if (!token) return {};

  try {
    const channelNames = channels.map(ch => {
      const url = new URL(ch);
      return url.pathname.split('/').filter(Boolean).pop();
    });

    const params = new URLSearchParams();
    channelNames.forEach(name => params.append('user_login', name));

    const response = await fetch(`https://api.twitch.tv/helix/streams?${params}`, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    const liveStatus = {};

    data.data?.forEach(stream => {
      liveStatus[stream.user_login.toLowerCase()] = {
        isLive: true,
        viewers: stream.viewer_count,
        title: stream.title,
        game: stream.game_name,
        thumbnail: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')
      };
    });

    return liveStatus;
  } catch (error) {
    console.error('Failed to check Twitch status:', error);
    return {};
  }
}

/**
 * Get live matches from PandaScore
 */
async function getPandaScoreMatches() {
  if (!PANDASCORE_API_KEY) {
    console.warn('PandaScore API key not configured');
    return [];
  }

  try {
    const games = ['csgo', 'valorant', 'lol', 'dota2', 'rl', 'r6siege'];
    const allMatches = [];

    for (const game of games) {
      const response = await fetch(
        `https://api.pandascore.co/${game}/matches/running?token=${PANDASCORE_API_KEY}`,
        { next: { revalidate: 30 } }
      );

      if (response.ok) {
        const matches = await response.json();
        allMatches.push(...matches.map(m => ({
          source: 'pandascore',
          game,
          ...m
        })));
      }
    }

    return allMatches;
  } catch (error) {
    console.error('Failed to fetch PandaScore matches:', error);
    return [];
  }
}

/**
 * Scrape HLTV for live CS2 matches
 */
async function getHLTVMatches() {
  try {
    const response = await fetch('https://www.hltv.org/matches', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) return [];

    const html = await response.text();
    
    // Parse live matches from HTML (basic extraction)
    const liveMatches = [];
    const liveMatchRegex = /data-zonedgrouping-entry-unix="(\d+)".*?<div class="teamName">(.*?)<\/div>/gs;
    let match;

    while ((match = liveMatchRegex.exec(html)) !== null) {
      liveMatches.push({
        source: 'hltv',
        game: 'cs2',
        timestamp: parseInt(match[1]),
        team: match[2]
      });
    }

    return liveMatches;
  } catch (error) {
    console.error('Failed to fetch HLTV matches:', error);
    return [];
  }
}

/**
 * Get Valorant matches from VLR.gg
 */
async function getVLRMatches() {
  try {
    const response = await fetch('https://www.vlr.gg/matches', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) return [];

    const html = await response.text();
    
    // Parse live matches (basic extraction)
    const liveMatches = [];
    const liveRegex = /match-item.*?mod-live/gs;
    
    if (liveRegex.test(html)) {
      liveMatches.push({
        source: 'vlr',
        game: 'valorant',
        isLive: true
      });
    }

    return liveMatches;
  } catch (error) {
    console.error('Failed to fetch VLR matches:', error);
    return [];
  }
}

/**
 * Merge match data with live status from multiple sources
 */
export async function enrichMatchesWithLiveData(matches) {
  try {
    // Get Twitch live status for all stream URLs
    const streamUrls = matches
      .filter(m => m.streamUrl)
      .map(m => m.streamUrl);

    const twitchStatus = await getTwitchLiveStatus(streamUrls);

    // Get data from other sources in parallel
    const [pandaScoreMatches, hltvMatches, vlrMatches] = await Promise.all([
      getPandaScoreMatches(),
      getHLTVMatches(),
      getVLRMatches()
    ]);

    // Enrich matches with live data
    const enrichedMatches = matches.map(match => {
      const enriched = { ...match };

      // Check Twitch status
      if (match.streamUrl) {
        try {
          const channelName = new URL(match.streamUrl).pathname.split('/').filter(Boolean).pop();
          const twitchData = twitchStatus[channelName?.toLowerCase()];

          if (twitchData) {
            enriched.streamLive = twitchData.isLive;
            enriched.streamViewers = twitchData.viewers;
            enriched.streamThumbnail = twitchData.thumbnail;
            
            // If Twitch shows as offline, mark match as not live
            if (!twitchData.isLive && match.status === 'live') {
              enriched.status = 'upcoming';
              enriched.statusReason = 'Stream offline';
            }
          }
        } catch (e) {
          console.error('Error parsing stream URL:', e);
        }
      }

      // Cross-reference with PandaScore
      const pandaMatch = pandaScoreMatches.find(pm => 
        pm.game === match.gameSlug &&
        (pm.opponents?.some(o => o.opponent?.name === match.team1.name) ||
         pm.opponents?.some(o => o.opponent?.name === match.team2.name))
      );

      if (pandaMatch) {
        enriched.confirmedLive = true;
        enriched.pandaScoreId = pandaMatch.id;
        
        // Update scores if available
        if (pandaMatch.results?.length > 0) {
          enriched.team1.score = pandaMatch.results[0]?.score || enriched.team1.score;
          enriched.team2.score = pandaMatch.results[1]?.score || enriched.team2.score;
        }
      }

      // Add source indicators
      enriched.dataSources = [];
      if (enriched.streamLive) enriched.dataSources.push('twitch');
      if (enriched.confirmedLive) enriched.dataSources.push('pandascore');
      if (hltvMatches.length > 0 && match.gameSlug === 'cs2') enriched.dataSources.push('hltv');
      if (vlrMatches.length > 0 && match.gameSlug === 'valorant') enriched.dataSources.push('vlr');

      return enriched;
    });

    // Filter out matches that are marked as live but have no confirming sources
    return enrichedMatches.map(match => {
      if (match.status === 'live' && match.dataSources.length === 0) {
        return {
          ...match,
          status: 'upcoming',
          statusReason: 'No live sources confirmed'
        };
      }
      return match;
    });

  } catch (error) {
    console.error('Failed to enrich matches:', error);
    return matches; // Return original matches if enrichment fails
  }
}

/**
 * Get alternative stream URLs from multiple platforms
 */
export async function getAlternativeStreams(game, tournament) {
  const streams = [];

  try {
    const token = await getTwitchToken();
    
    // Get Twitch streams
    if (token) {
      const gameMapping = {
        'cs2': 'Counter-Strike',
        'valorant': 'VALORANT',
        'league-of-legends': 'League of Legends',
        'dota-2': 'Dota 2',
        'rocket-league': 'Rocket League',
        'rainbow-six': 'Tom Clancy\'s Rainbow Six Siege'
      };

      const gameName = gameMapping[game] || game;
      
      const response = await fetch(
        `https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(gameName)}&first=5&live_only=true`,
        {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      
      data.data?.forEach(channel => {
        if (channel.is_live) {
          streams.push({
            platform: 'twitch',
            url: `https://www.twitch.tv/${channel.broadcaster_login}`,
            viewers: channel.viewer_count || 0,
            title: channel.title,
            thumbnail: channel.thumbnail_url
          });
        }
      });
    }

    // Add YouTube live streams (common esports channels)
    const youtubeChannels = {
      'cs2': ['@ESLCS', '@BLASTProSeries', '@pglofficial'],
      'valorant': ['@ValorantEsports', '@VCTPACIFIC', '@VCTAMERICAS'],
      'league-of-legends': ['@lolesports', '@lck', '@lec'],
      'dota-2': ['@dota2', '@pgl', '@ESLDota2'],
      'rocket-league': ['@RocketLeague', '@RLEsports']
    };

    if (youtubeChannels[game]) {
      youtubeChannels[game].forEach(channel => {
        streams.push({
          platform: 'youtube',
          url: `https://www.youtube.com/${channel}/live`,
          viewers: 0, // Would need YouTube API to get actual count
          title: `${channel} Live`,
          thumbnail: null
        });
      });
    }

    // Sort by viewer count (Twitch streams first since they have real counts)
    streams.sort((a, b) => b.viewers - a.viewers);

  } catch (error) {
    console.error('Failed to get alternative streams:', error);
  }

  return streams;
}
