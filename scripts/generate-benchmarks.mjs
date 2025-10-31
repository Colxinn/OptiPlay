#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dataDir = join(root, "data", "benchmarks", "hardware");

function readJson(name) {
  const file = join(dataDir, name);
  return JSON.parse(readFileSync(file, "utf8"));
}

const gpus = readJson("gpus.json");
const cpus = readJson("cpus.json");
const games = readJson("games.json");

const cpuIndex = new Map(cpus.map((cpu) => [cpu.slug, cpu]));

const cpuChoices = {
  highIntel: "intel-core-i9-14900k",
  midIntel: "intel-core-i7-13700k",
  baseIntel: "intel-core-i5-13600k",
  entryIntel: "intel-core-i5-12600k",
  highAMD: "amd-ryzen-9-7950x3d",
  midAMD: "amd-ryzen-7-7800x3d",
  entryAMD: "amd-ryzen-5-7600",
};

const resolutionProfiles = [
  { key: "1080p", multiplier: 1.0 },
  { key: "1440p", multiplier: 0.74 },
  { key: "4k", multiplier: 0.55 },
];

const gameFactors = {
  "overwatch-2": 1.32,
  "rainbow-six-siege": 1.28,
  "rocket-league": 1.34,
  "league-of-legends": 1.52,
  "dota-2": 1.42,
  "destiny-2": 0.9,
  "pubg-battlegrounds": 0.84,
  "halo-infinite": 0.88,
  "starfield": 0.62,
  "cyberpunk-2077": 0.58,
  cs2: 1.25,
  valorant: 1.46,
  siegex: 1.18,
  roblox: 1.48,
  minecraft: 1.08,
  "minecraft-shaders": 0.78,
  "forza-horizon-5": 0.94,
  "elden-ring": 0.76,
  fortnite: 1.12,
  rust: 0.86,
  "apex-legends": 0.92,
};

function pickCpuSlug(gpu) {
  const isAMD = gpu.slug.startsWith("amd-");
  const score = Number(gpu.avgScore ?? 0);
  if (isAMD) {
    if (score >= 250) return cpuChoices.highAMD;
    if (score >= 190) return cpuChoices.midAMD;
    return cpuChoices.entryAMD;
  }
  if (score >= 260) return cpuChoices.highIntel;
  if (score >= 210) return cpuChoices.midIntel;
  if (score >= 170) return cpuChoices.baseIntel;
  return cpuChoices.entryIntel;
}

function clampFps(value) {
  return Math.max(30, Math.round(value));
}

function computePowerDraw(gpu, cpu) {
  const gpuPower = Number.isFinite(gpu.powerDraw) ? gpu.powerDraw : 220;
  const cpuPower = Number.isFinite(cpu.tdpWatts) ? cpu.tdpWatts : 150;
  return Math.round(gpuPower + cpuPower * 0.75 + 35);
}

function perGameFactor(gameSlug) {
  const fallback = 1.0;
  return gameFactors[gameSlug] ?? fallback;
}

function jitterFactor(gpu, game) {
  const base = (gpu.slug.length + game.slug.length) % 7;
  return 1 + (base - 3) * 0.015;
}

const benchmarks = [];

for (const game of games) {
  const factor = perGameFactor(game.slug);
  for (const gpu of gpus) {
    const cpuSlug = pickCpuSlug(gpu);
    const cpu = cpuIndex.get(cpuSlug);
    if (!cpu) {
      throw new Error(`CPU slug "${cpuSlug}" not found for GPU "${gpu.slug}"`);
    }

    const performanceBase =
      clampFps(gpu.avgScore * factor * jitterFactor(gpu, game)) || 60;

    for (const { key, multiplier } of resolutionProfiles) {
      const avgFps = clampFps(performanceBase * multiplier);
      benchmarks.push({
        gameSlug: game.slug,
        gpuSlug: gpu.slug,
        cpuSlug,
        resolution: key,
        avgFps,
        estimatedPowerDraw: computePowerDraw(gpu, cpu),
        source: "OptiPlay Synthetic 2025.10",
      });
    }
  }
}

const outputFile = join(dataDir, "game-benchmarks.json");
writeFileSync(outputFile, JSON.stringify(benchmarks, null, 2) + "\n", "utf8");

console.log(
  `Generated ${benchmarks.length} benchmark rows covering ${gpus.length} GPUs, ${games.length} games, and ${resolutionProfiles.length} resolutions.`
);
