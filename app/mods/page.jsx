import ModCard from "@/app/components/ModCard.jsx";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const catalog = [
  {
    game: "Minecraft (Java)",
    slug: "minecraft-java",
    mods: [
      { name: "Fabric Loader", desc: "Lightweight mod loader.", trust: "Verified", action: "link", href: "https://fabricmc.net/" },
      { name: "Sodium", desc: "Massive performance boost renderer.", trust: "Verified", action: "link", href: "https://modrinth.com/mod/sodium" },
      { name: "Iris Shaders", desc: "Shaders mod built for Sodium.", trust: "Verified", action: "link", href: "https://modrinth.com/mod/iris" },
      { name: "Lithium", desc: "Optimizes game logic.", trust: "Verified", action: "link", href: "https://modrinth.com/mod/lithium" },
    ],
  },
  {
    game: "Skyrim Special Edition",
    slug: "skyrim-se",
    mods: [
      { name: "SKSE64", desc: "Script extender required by many mods.", trust: "Verified", action: "link", href: "https://skse.silverlock.org/" },
      { name: "SkyUI", desc: "Modern UI overhaul (requires SKSE).", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition/mods/12604" },
      { name: "Unofficial Patch", desc: "Community bugfix megapatch.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition/mods/266" },
    ],
  },
  {
    game: "Stardew Valley",
    slug: "stardew",
    mods: [
      { name: "SMAPI", desc: "The mod loader for Stardew.", trust: "Verified", action: "link", href: "https://smapi.io/" },
      { name: "Content Patcher", desc: "Load content packs without altering the game files.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/stardewvalley/mods/1915" },
    ],
  },
  {
    game: "CS 1.6",
    slug: "cs16",
    mods: [
      { name: "Userconfig.cfg (High FPS)", desc: "Recommended rates, FPS, and mouse settings.", trust: "Verified", action: "script", script: `// Place in cstrike/userconfig.cfg\ncl_cmdrate 101\ncl_updaterate 101\nrate 25000\nex_interp 0.01\nfps_max 200\nzoom_sensitivity_ratio 1.0\ncl_dynamiccrosshair 0\nhud_fastswitch 1\nvoice_enable 1\n// Bind quick buys or aliases as desired` },
      { name: "Classic HUD/Crosshair pack", desc: "Cosmetic HUD assets.", trust: "Caution", action: "link", href: "https://gamebanana.com/mods/cats/532" },
    ],
  },
  {
    game: "DOOM (classic)",
    slug: "doom-classic",
    mods: [
      { name: "GZDoom", desc: "Modern source port with QoL.", trust: "Verified", action: "link", href: "https://www.zdoom.org/downloads" },
    ],
  },
  {
    game: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    mods: [
      { name: "Cyber Engine Tweaks", desc: "Scripting and fixes.", trust: "Verified", action: "link", href: "https://github.com/yamashi/CyberEngineTweaks" },
    ],
  },
  {
    game: "GTA V (Singleplayer)",
    slug: "gtav-sp",
    mods: [
      { name: "ScriptHookV", desc: "ASI loader for SP scripts.", trust: "Verified", action: "link", href: "https://www.dev-c.com/gtav/scripthookv/" },
      { name: "OpenIV", desc: "Modding tool/archiver for SP.", trust: "Caution", action: "link", href: "https://openiv.com/" },
    ],
  },
];

export default function ModsPage() {
  return (
    <div className="space-y-8">
      <header className="max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold">Mods Catalog</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Curated, ToS‑friendly mods and utilities. Focus on single‑player or cosmetic/QoL changes. Always follow each game’s EULA and server rules.
        </p>
      </header>

      {catalog.map((section) => (
        <section key={section.slug} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">{section.game}</div>
            <div className="text-[11px] text-gray-500">{section.mods.length} mods</div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.mods.map((m, i) => (
              <ModCard key={i} {...m} />
            ))}
          </div>
        </section>
      ))}

      <div className="text-[11px] text-gray-500 pt-2">Build: Mods v2025-10-27-1</div>
    </div>
  );
}

