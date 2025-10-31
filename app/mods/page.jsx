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
      { name: "Starlight", desc: "Lighting engine rewrite for FPS.", trust: "Verified", action: "link", href: "https://modrinth.com/mod/starlight" },
      { name: "FerriteCore", desc: "RAM usage reductions.", trust: "Verified", action: "link", href: "https://modrinth.com/mod/ferrite-core" },
      { name: "Krypton", desc: "Network stack optimizations.", trust: "Verified", action: "link", href: "https://modrinth.com/mod/krypton" },
      { name: "EntityCulling", desc: "Skip rendering hidden entities.", trust: "Verified", action: "link", href: "https://modrinth.com/mod/entityculling" },
      { name: "Modrinth (browse)", desc: "Find more Fabric/Quilt mods.", trust: "Verified", action: "link", href: "https://modrinth.com/" },
      { name: "CurseForge (browse)", desc: "Large Minecraft mod portal.", trust: "Caution", action: "link", href: "https://www.curseforge.com/minecraft/mc-mods" },
    ],
  },
  {
    game: "Skyrim Special Edition",
    slug: "skyrim-se",
    mods: [
      { name: "SKSE64", desc: "Script extender required by many mods.", trust: "Verified", action: "link", href: "https://skse.silverlock.org/" },
      { name: "SkyUI", desc: "Modern UI overhaul (requires SKSE).", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition/mods/12604" },
      { name: "Unofficial Patch", desc: "Community bugfix megapatch.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition/mods/266" },
      { name: "SSE Engine Fixes", desc: "Native engine bugfixes.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition/mods/17230" },
      { name: "Address Library", desc: "Offsets for AE/SE plugins.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition/mods/32444" },
      { name: "BethINI", desc: "Tweak INI for quality/perf.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition/mods/4875" },
      { name: "Nexus Mods (browse)", desc: "Search Skyrim SE mods.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/skyrimspecialedition" },
    ],
  },
  {
    game: "Stardew Valley",
    slug: "stardew",
    mods: [
      { name: "SMAPI", desc: "The mod loader for Stardew.", trust: "Verified", action: "link", href: "https://smapi.io/" },
      { name: "Content Patcher", desc: "Load content packs without altering the game files.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/stardewvalley/mods/1915" },
      { name: "UI Info Suite 2", desc: "Helpful HUD and info.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/stardewvalley/mods/1150" },
      { name: "Stardew Valley Expanded", desc: "Huge content expansion.", trust: "Caution", action: "link", href: "https://www.nexusmods.com/stardewvalley/mods/3753" },
    ],
  },
  {
    game: "Roblox",
    slug: "roblox",
    mods: [
      {
        name: "Bloxstrap Launcher",
        desc: "Community-supported Roblox bootstrapper with built-in FPS unlocker. Steps: open Bloxstrap Settings > raise the FPS cap (120-240) > enable the FPS Unlocker toggle. Afterwards tweak Roblox graphics: lower quality, disable shadows/effects, reduce resolution, and switch to DirectX 11 for smoother gameplay.",
        trust: "Verified",
        action: "link",
        href: "https://github.com/pizzaboxer/bloxstrap/releases",
      },
      {
        name: "Simple Auto Clicker",
        desc: "Desktop auto clicker with configurable CPS. Use responsibly and follow game/experience rules.",
        trust: "Caution",
        action: "link",
        href: "https://sourceforge.net/projects/orphamielautoclicker/",
      },
      {
        name: "AutoHotkey Click Toggle Script",
        desc: "Toggleable AutoHotkey script that rapidly clicks while you hold LMB. Requires AutoHotkey installed.",
        trust: "Caution",
        action: "script",
        script: `; AutoHotkey v1 simple toggle autoclicker\n; Toggle with F6; hold LMB to click\nF6::Toggle := !Toggle\n$LButton::\nWhile GetKeyState("LButton", "P") && Toggle\n{\n  Click\n  Sleep 20 ; ~50 CPS\n}\nreturn`,
      },
    ],
  },
  {
    game: "CS 1.6",
    slug: "cs16",
    mods: [
      { name: "Userconfig.cfg (High FPS)", desc: "Recommended rates, FPS, and mouse settings.", trust: "Verified", action: "script", script: `// Place in cstrike/userconfig.cfg\ncl_cmdrate 101\ncl_updaterate 101\nrate 25000\nex_interp 0.01\nfps_max 200\nzoom_sensitivity_ratio 1.0\ncl_dynamiccrosshair 0\nhud_fastswitch 1\nvoice_enable 1\n// Bind quick buys or aliases as desired` },
      { name: "Classic HUD/Crosshair pack", desc: "Cosmetic HUD assets.", trust: "Caution", action: "link", href: "https://gamebanana.com/mods/cats/532" },
      { name: "GameBanana (browse)", desc: "Find CS 1.6 skins & HUDs.", trust: "Caution", action: "link", href: "https://gamebanana.com/games/2" },
    ],
  },
  {
    game: "DOOM (classic)",
    slug: "doom-classic",
    mods: [
      { name: "GZDoom", desc: "Modern source port with QoL.", trust: "Verified", action: "link", href: "https://www.zdoom.org/downloads" },
      { name: "Brutal Doom", desc: "Combat overhaul; single‑player only.", trust: "Caution", action: "link", href: "https://www.moddb.com/mods/brutal-doom" },
      { name: "Project Brutality", desc: "Advanced gameplay mod.", trust: "Caution", action: "link", href: "https://www.moddb.com/mods/project-brutality" },
    ],
  },
  {
    game: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    mods: [
      { name: "Cyber Engine Tweaks", desc: "Scripting and fixes.", trust: "Verified", action: "link", href: "https://github.com/yamashi/CyberEngineTweaks" },
      { name: "REDmod", desc: "Official modding tools.", trust: "Verified", action: "link", href: "https://www.cyberpunk.net/en/modding-support" },
      { name: "Appearance Menu Mod", desc: "Spawn & customize (CET).", trust: "Caution", action: "link", href: "https://www.nexusmods.com/cyberpunk2077/mods/790" },
      { name: "Nexus Mods (browse)", desc: "Search Cyberpunk mods.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/cyberpunk2077" },
    ],
  },
  {
    game: "GTA V (Singleplayer)",
    slug: "gtav-sp",
    mods: [
      { name: "ScriptHookV", desc: "ASI loader for SP scripts.", trust: "Verified", action: "link", href: "https://www.dev-c.com/gtav/scripthookv/" },
      { name: "OpenIV", desc: "Modding tool/archiver for SP.", trust: "Caution", action: "link", href: "https://openiv.com/" },
      { name: "Enhanced Native Trainer", desc: "Trainer for single‑player.", trust: "Caution", action: "link", href: "https://www.gta5-mods.com/scripts/enhanced-native-trainer-zemanez-and-others" },
      { name: "NaturalVision Evolved", desc: "Graphics overhaul (paid).", trust: "Caution", action: "link", href: "https://www.razedmods.com/nve" },
      { name: "gta5-mods (browse)", desc: "Largest GTA V mod hub.", trust: "Caution", action: "link", href: "https://www.gta5-mods.com/" },
    ],
  },
  {
    game: "The Witcher 3",
    slug: "witcher3",
    mods: [
      { name: "HD Reworked Project", desc: "Texture overhaul.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/witcher3/mods/1021" },
      { name: "Friendly HUD", desc: "Better HUD customization.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/witcher3/mods/365" },
    ],
  },
  {
    game: "Elden Ring",
    slug: "elden-ring",
    mods: [
      { name: "Mod Engine 2", desc: "Safely load mods (offline).", trust: "Verified", action: "link", href: "https://github.com/soulsmods/ModEngine2" },
      { name: "Seamless Co-op", desc: "Co-op overhaul; offline.", trust: "Caution", action: "link", href: "https://www.nexusmods.com/eldenring/mods/510" },
    ],
  },
  {
    game: "Baldur's Gate 3",
    slug: "bg3",
    mods: [
      { name: "BG3 Mod Manager", desc: "Manage/load .pak mods.", trust: "Verified", action: "link", href: "https://github.com/LaughingLeader/BG3ModManager" },
      { name: "ImprovedUI", desc: "UI fixes and QoL.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/baldursgate3/mods/366" },
    ],
  },
  {
    game: "Terraria",
    slug: "terraria",
    mods: [
      { name: "tModLoader", desc: "Official mod loader.", trust: "Verified", action: "link", href: "https://www.tmodloader.net/" },
      { name: "Calamity Mod", desc: "Large content expansion.", trust: "Caution", action: "link", href: "https://calamitymod.wiki.gg/wiki/Calamity_Mod_Wiki" },
    ],
  },
  {
    game: "Factorio",
    slug: "factorio",
    mods: [
      { name: "Mod Portal (browse)", desc: "Official Factorio mods.", trust: "Verified", action: "link", href: "https://mods.factorio.com/" },
      { name: "Krastorio 2", desc: "Full game overhaul.", trust: "Verified", action: "link", href: "https://mods.factorio.com/mod/Krastorio2" },
    ],
  },
  {
    game: "RimWorld",
    slug: "rimworld",
    mods: [
      { name: "Harmony", desc: "Required library for many mods.", trust: "Verified", action: "link", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=2009463077" },
      { name: "HugsLib", desc: "Shared library for mods.", trust: "Verified", action: "link", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=818773962" },
      { name: "Performance Optimizer", desc: "FPS & sim improvements.", trust: "Verified", action: "link", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=2633434756" },
      { name: "Steam Workshop (browse)", desc: "Find thousands of mods.", trust: "Verified", action: "link", href: "https://steamcommunity.com/app/294100/workshop/" },
    ],
  },
  {
    game: "Cities: Skylines",
    slug: "cities-skylines",
    mods: [
      { name: "Harmony 2", desc: "Library dependency.", trust: "Verified", action: "link", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=2040656402" },
      { name: "Move It!", desc: "Precise object placement.", trust: "Verified", action: "link", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=1619685021" },
      { name: "Network Anarchy", desc: "Advanced road tools.", trust: "Verified", action: "link", href: "https://steamcommunity.com/sharedfiles/filedetails/?id=2862881785" },
      { name: "Thunderstore (browse)", desc: "Mods for Skylines II too.", trust: "Caution", action: "link", href: "https://thunderstore.io/" },
    ],
  },
  {
    game: "Kerbal Space Program",
    slug: "ksp",
    mods: [
      { name: "CKAN", desc: "Community mod manager.", trust: "Verified", action: "link", href: "https://github.com/KSP-CKAN/CKAN" },
      { name: "MechJeb 2", desc: "Autopilot/assistance suite.", trust: "Verified", action: "link", href: "https://forum.kerbalspaceprogram.com/topic/154834-" },
    ],
  },
  {
    game: "No Man's Sky",
    slug: "nms",
    mods: [
      { name: "AMUMSS", desc: "Modding Station & PAK tools.", trust: "Caution", action: "link", href: "https://www.nexusmods.com/nomanssky/mods/957" },
      { name: "Nexus Mods (browse)", desc: "Popular NMS mods.", trust: "Verified", action: "link", href: "https://www.nexusmods.com/nomanssky" },
    ],
  },
  {
    game: "Hades",
    slug: "hades",
    mods: [
      { name: "Mod Importer", desc: "Base tool for Hades mods.", trust: "Verified", action: "link", href: "https://github.com/SGG-Modding/ModImporter" },
      { name: "Olympus", desc: "Mod loader and API.", trust: "Verified", action: "link", href: "https://github.com/SGG-Modding/Olympus" },
    ],
  },
  {
    game: "Valheim",
    slug: "valheim",
    mods: [
      { name: "BepInExPack", desc: "Framework required for most mods.", trust: "Verified", action: "link", href: "https://thunderstore.io/c/valheim/p/denikson/BepInExPack_Valheim/" },
      { name: "Valheim Plus", desc: "QoL & server tweaks.", trust: "Caution", action: "link", href: "https://www.nexusmods.com/valheim/mods/4" },
    ],
  },
  {
    game: "Satisfactory",
    slug: "satisfactory",
    mods: [
      { name: "SMM", desc: "Satisfactory Mod Manager.", trust: "Verified", action: "link", href: "https://ficsit.app/" },
      { name: "Factory Game (browse)", desc: "Ficsit mod portal.", trust: "Verified", action: "link", href: "https://ficsit.app/mods" },
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

      <div className="text-[11px] text-gray-500 pt-2">Build: Mods v2025-10-30-1</div>
    </div>
  );
}
