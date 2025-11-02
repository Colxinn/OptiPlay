import { NextResponse } from 'next/server';
import { getTwitchToken } from '@/lib/esportsAggregator';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;

/**
 * Check if a specific stream is live
 * Usage: GET /api/esports/stream-status?url=https://twitch.tv/channelname
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const streamUrl = searchParams.get('url');

    if (!streamUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Parse channel name from URL
    let channelName;
    let platform;

    if (streamUrl.includes('twitch.tv')) {
      platform = 'twitch';
      const url = new URL(streamUrl);
      channelName = url.pathname.split('/').filter(Boolean).pop();
    } else if (streamUrl.includes('youtube.com')) {
      platform = 'youtube';
      // YouTube requires different handling
      return NextResponse.json({
        success: true,
        platform: 'youtube',
        isLive: null,
        message: 'YouTube status check requires YouTube API (not implemented yet)'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported platform' },
        { status: 400 }
      );
    }

    if (platform === 'twitch') {
      const token = await getTwitchToken();
      
      if (!token) {
        return NextResponse.json({
          success: false,
          error: 'Twitch API not configured'
        }, { status: 503 });
      }

      // Check if channel is live
      const response = await fetch(
        `https://api.twitch.tv/helix/streams?user_login=${channelName}`,
        {
          headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      const stream = data.data?.[0];

      if (stream) {
        return NextResponse.json({
          success: true,
          platform: 'twitch',
          channel: channelName,
          isLive: true,
          viewers: stream.viewer_count,
          title: stream.title,
          game: stream.game_name,
          thumbnail: stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
          startedAt: stream.started_at,
          language: stream.language
        });
      } else {
        return NextResponse.json({
          success: true,
          platform: 'twitch',
          channel: channelName,
          isLive: false
        });
      }
    }

  } catch (error) {
    console.error('Error checking stream status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check stream status' },
      { status: 500 }
    );
  }
}
