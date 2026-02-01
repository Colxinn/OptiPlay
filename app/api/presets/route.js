import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function loadPresets() {
  const presetsDir = path.join(process.cwd(), 'data', 'presets');
  
  if (!fs.existsSync(presetsDir)) {
    return [];
  }

  const files = fs.readdirSync(presetsDir).filter(f => f.endsWith('.json'));
  const presets = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(presetsDir, file), 'utf8');
      const preset = JSON.parse(content);
      presets.push(preset);
    } catch (error) {
      console.error(`Failed to load preset ${file}:`, error);
    }
  }

  return presets;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('target'); // Filter by game
    const hardwareTier = searchParams.get('hardware_tier'); // Filter by hardware
    const id = searchParams.get('id'); // Get specific preset

    let presets = loadPresets();

    // Filter by specific ID
    if (id) {
      const preset = presets.find(p => p.id === id);
      if (!preset) {
        return new Response(JSON.stringify({ error: 'Preset not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ preset }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
      });
    }

    // Filter by target game
    if (target) {
      presets = presets.filter(p => 
        p.target.includes(target) || p.target.includes('Universal')
      );
    }

    // Filter by hardware tier
    if (hardwareTier) {
      presets = presets.filter(p => p.hardware_tier.includes(hardwareTier));
    }

    return new Response(JSON.stringify({ presets, count: presets.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
    });

  } catch (error) {
    console.error('Presets API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load presets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
