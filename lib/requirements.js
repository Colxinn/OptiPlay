import fs from 'fs';
import path from 'path';

// Load all hardware data
function loadJson(filename) {
  const p = path.join(process.cwd(), 'data', 'benchmarks', 'hardware', filename);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function loadGameRequirements() {
  const p = path.join(process.cwd(), 'data', 'games', 'requirements.json');
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

// Get all games from benchmark data
function getAllGames() {
  return loadJson('games.json');
}

// Get all GPUs and CPUs
function getAllGpus() {
  return loadJson('gpus.json');
}

function getAllCpus() {
  return loadJson('cpus.json');
}

// Get benchmark data
function getBenchmarks() {
  return loadJson('game-benchmarks.json');
}

export async function localRequirements() {
  return loadGameRequirements();
}

// Enhanced search with auto-generated requirements from benchmark data
export async function searchLocal(q) {
  const manualReqs = loadGameRequirements();
  const allGames = getAllGames();
  const benchmarks = getBenchmarks();
  const gpus = getAllGpus();
  
  const query = q.toLowerCase();
  
  // First get matching games
  const matchingGames = allGames.filter((g) => 
    g.name.toLowerCase().includes(query) || 
    g.slug.toLowerCase().includes(query)
  );
  
  const results = [];
  
  for (const game of matchingGames) {
    // Check if we have manual requirements
    const manual = manualReqs.find(r => r.slug === game.slug);
    
    if (manual) {
      // Use manual data if available
      results.push(manual);
    } else {
      // Auto-generate from benchmark data
      const gameBenchmarks = benchmarks.filter(b => b.gameSlug === game.slug);
      
      if (gameBenchmarks.length > 0) {
        // Find minimum viable GPU (60+ FPS) and recommended GPU (100+ FPS)
        const sorted = [...gameBenchmarks].sort((a, b) => b.avgFps - a.avgFps);
        
        const minViable = sorted.find(b => b.avgFps >= 60);
        const recommended = sorted.find(b => b.avgFps >= 100);
        
        const minGpu = minViable ? gpus.find(g => g.slug === minViable.gpuSlug) : null;
        const recGpu = recommended ? gpus.find(g => g.slug === recommended.gpuSlug) : null;
        
        results.push({
          slug: game.slug,
          title: game.name,
          min: {
            cpu: "4-core CPU",
            gpu: minGpu?.name || "GTX 1050",
            ram_gb: 8
          },
          rec: {
            cpu: "6-core CPU",
            gpu: recGpu?.name || "RTX 2060",
            ram_gb: 16
          },
          presets: {
            low: "1080p Low settings, 60 FPS",
            mid: "1080p Medium settings, 75 FPS",
            high: "1080p High settings, 100+ FPS"
          }
        });
      }
    }
  }
  
  return results;
}

// Placeholder for external providers (RAWG, PCGamingWiki, etc.)
export async function fetchExternal(q) {
  const out = [];
  // Examples (disabled unless you add keys in env):
  // RAWG API (optional key RAWG_API_KEY)
  // try {
  //   const key = process.env.RAWG_API_KEY;
  //   const res = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&key=${key}`);
  //   const js = await res.json();
  //   // Map results as needed...
  // } catch {}
  return out;
}

export async function searchRequirements(q) {
  const local = await searchLocal(q);
  const external = await fetchExternal(q);
  // Prefer local curated entries, then external
  return [...local, ...external];
}

// Export for PC Checker component
export async function getHardwareData() {
  return {
    gpus: getAllGpus(),
    cpus: getAllCpus(),
    games: getAllGames(),
    benchmarks: getBenchmarks()
  };
}

