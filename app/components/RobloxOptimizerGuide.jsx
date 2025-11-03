"use client";

import { useState } from "react";
import CopyBlock from "./CopyBlock.jsx";

const icons = {
  update: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6a6 6 0 1 1-6-6z" />
    </svg>
  ),
  performance: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 13a9 9 0 1 1 18 0v6h-2v-6a7 7 0 1 0-14 0v6H3v-6z" />
    </svg>
  ),
  vsync: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M4 6h16v2H4V6zm0 10h10v2H4v-2zm0-5h16v2H4v-2z" />
    </svg>
  ),
  windowed: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 5h18v14H3V5zm2 2v10h14V7H5z" />
    </svg>
  ),
  power: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M13 3h-2v10h2V3zm-6.24 2.76A8 8 0 1 0 19.24 5.76l-1.41 1.41A6 6 0 1 1 6.17 7.17L4.76 5.76z" />
    </svg>
  ),
  apps: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 8v-8h8v8h-8z" />
    </svg>
  ),
  args: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2l4 4-6 6H6V8l6-6zm-6 12h2v6H6v-6zm4 0h2v6H10v-6zm4 0h2v6h-2v-6z" />
    </svg>
  ),
  network: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 3a9 9 0 0 0-9 9h2a7 7 0 1 1 14 0h2a9 9 0 0 0-9-9zm-7 9a7 7 0 0 0 7 7v-2a5 5 0 0 1-5-5H5zm7 7a7 7 0 0 0 7-7h-2a5 5 0 0 1-5 5v2z" />
    </svg>
  ),
  ingame: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M4 4h16v12H4z" /><path d="M2 18h20v2H2z" />
    </svg>
  ),
  mods: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2l3 3-7 7-3-3 7-7zm-5 9l-3 9 9-3 9-9-6-6-9 9z" />
    </svg>
  ),
};

function Step({ index, title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-900/80"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-800 border border-white/10 text-purple-300">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-400">Step {index}</div>
          <div className="font-semibold leading-tight">{title}</div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-300 border-t border-white/10">
          {children}
        </div>
      )}
    </div>
  );
}

export default function RobloxOptimizerGuide() {
  const fflagsJson = `{
"FLogNetwork": "7",
"FFlagUseNewAnimationSystem": "False",
"FFlagDebugDisableTelemetryEventIngest": "True",
"FFlagTweenOptimizations": "True",
"DFIntCSGLevelOfDetailSwitchingDistance": "0",
"FFlagDebugSkyGray": "True",
"DFFlagDebugPerfMode": "False",
"DFFlagBrowserTrackerIdTelemetryEnabled": "False",
"DFStringTelemetryV2Url": "null",
"FFlagFixGraphicsQuality": "True",
"FFlagEnableNewHeapSnapshots": "False",
"FFlagNewNetworking": "False",
"FFlagPreloadAllFonts": "False",
"FStringGamesUrlPath": "/games/",
"DFFlagDisableFastLogTelemetry": "True",
"FFlagNewLightAttenuation": "True",
"FFlagDebugGraphicsPreferD3D11": "True",
"FFlagEnableTerrainFoliageOptimizations": "True",
"FFlagDebugDisableTelemetryPoint": "True",
"DFStringAltTelegrafHTTPTransportUrl": "null",
"FFlagEnableHumanoidLuaSideCaching": "False",
"DFFlagTextureQualityOverrideEnabled": "True",
"DFIntCSGLevelOfDetailSwitchingDistanceL34": "0",
"FFlagFastGPULightCulling3": "True",
"FFlagEnableNewInput": "True",
"FFlagCommitToGraphicsQualityFix": "True",
"FFlagAnimatePhysics": "False",
"FFlagSimIslandizerManager": "false",
"FFlagDebugDisableTelemetryEphemeralCounter": "True",
"FFlagDebugDisableTelemetryV2Stat": "True",
"FFlagUseUnifiedRenderStepped": "False",
"FFlagUseParticlesV2": "False",
"DFIntCSGLevelOfDetailSwitchingDistanceL12": "0",
"FFlagTaskSchedulerLimitTargetFpsTo2402": "False",
"FFlagUseDeferredContext": "False",
"FFlagOptimizeEmotes": "False",
"DFStringLightstepToken": "null",
"FFlagFixScalingModelRendering": "False",
"DFIntNewRunningBaseAltitudeD": "45",
"FFlagDebugDisableTelemetryV2Counter": "True",
"DFIntClientLightingTechnologyChangedTelemetryHundredthsPercent": "0",
"FFlagUseDynamicSun": "False",
"DFFlagDebugPauseVoxelizer": "True",
"DFStringTelegrafHTTPTransportUrl": "null",
"DFStringRobloxAnalyticsURL": "null",
"DFIntLightstepHTTPTransportHundredthsPercent2": "0",
"DFStringLightstepHTTPTransportUrlHost": "null",
"DFStringCrashUploadToBacktraceWindowsPlayerToken": "null",
"FFlagEnableTerrainOptimizations": "True",
"DFFlagDisableDPIScale": "True",
"FFlagLuaAppSystemBar": "False",
"FFlagFixMeshPartScaling": "False",
"DFStringCrashUploadToBacktraceBaseUrl": "null",
"DFStringCrashUploadToBacktraceMacPlayerToken": "null",
"DFIntS2PhysicsSenderRate": "250",
"DFIntTaskSchedulerTargetFps": "999999",
"FFlagEnableLightAttachToPart": "False",
"FFlagDebugDisableTelemetryEphemeralStat": "True",
"FFlagDebugDisableTelemetryV2Event": "True",
"FFlagAdServiceEnabled": "False",
"DFIntCSGLevelOfDetailSwitchingDistanceL23": "0",
"DFStringHttpPointsReporterUrl": "null",
"FIntRenderShadowIntensity": "0",
"FFlagDebugCrashReports": "False",
"FStringCoreScriptBacktraceErrorUploadToken": "null",
"FFlagDebugDisplayFPS": "False",
"DFFlagEnableLightstepReporting2": "False",
"DFStringAltHttpPointsReporterUrl": "null",
"DFStringLightstepHTTPTransportUrlPath": "null",
"DFIntRenderingThrottleDelayInMS": "1",
"DFIntRunningBaseOrientationP": "115",
"FFlagHandleAltEnterFullscreenManually": "False",
"DFFlagDebugRenderForceTechnologyVoxel": "True",
"DFFlagBaseNetworkMetrics": "False",
"FFlagDisablePostFx": "True",
"FIntTerrainArraySliceSize": "0",
"FIntDebugForceMSAASamples": "1"
}`;

  const steps = [
    {
      title: "Update Roblox and GPU drivers",
      icon: icons.update,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Update Roblox via Microsoft Store or the Roblox launcher.</li>
          <li>Install the latest GPU drivers: NVIDIA GeForce Experience, AMD Adrenalin, or Intel Arc Control.</li>
          <li>Perform a clean install if you've had issues; reboot after install.</li>
        </ul>
      ),
    },
    {
      title: "Set Roblox graphics mode to Performance",
      icon: icons.performance,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>In Roblox Settings → Graphics, set Graphics Mode to Manual.</li>
          <li>Lower the Graphics Quality slider to reduce GPU load.</li>
          <li>Disable Fullscreen anti-aliasing when available.</li>
        </ul>
      ),
    },
    {
      title: "Disable VSync and limit FPS in GPU panel",
      icon: icons.vsync,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>NVIDIA: Control Panel → Manage 3D Settings → Vertical sync: Off; Max Frame Rate: set to your target (e.g., 120).</li>
          <li>AMD: Radeon Settings → Graphics → Wait for Vertical Refresh: Off; Frame Rate Target Control: set limit.</li>
          <li>Intel: Arc Control → Gaming → Vertical Sync: Off; set a reasonable FPS cap to reduce stutter.</li>
        </ul>
      ),
    },
    {
      title: "Use Windowed Borderless for Roblox",
      icon: icons.windowed,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Use windowed or borderless window to reduce alt-tab hitches.</li>
          <li>Ensure desktop resolution and refresh rate match your display.</li>
          <li>Disable overlays (Steam, Discord, GeForce) if stuttering occurs.</li>
        </ul>
      ),
    },
    {
      title: "Set Windows power plan to High Performance",
      icon: icons.power,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Settings → System → Power → Power mode: Best performance.</li>
          <li>Laptops: Plug in for max performance; disable battery savers.</li>
          <li>Advanced: In Control Panel → Power Options, select High performance.</li>
        </ul>
      ),
    },
    {
      title: "Disable unnecessary background apps",
      icon: icons.apps,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Close browsers, launchers, and heavy apps before playing.</li>
          <li>Turn off startup apps: Task Manager → Startup apps.</li>
          <li>Temporarily disable heavy RGB/overlay utilities if needed.</li>
        </ul>
      ),
    },
    {
      title: "Bloxstrap setup and FastFlags (recommended)",
      icon: icons.performance,
      content: (
        <div className="space-y-2">
          <p className="text-gray-300">Bloxstrap is a custom Roblox launcher that lets you configure FastFlags safely.</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Install Bloxstrap and set it as your Roblox launcher.</li>
            <li>Open Bloxstrap → Fast Flags. Add the keys below with their values.</li>
            <li>Apply and launch Roblox from Bloxstrap to test stability and FPS.</li>
          </ol>
          <p className="text-gray-400 text-xs">Tip: You can toggle flags individually to A/B test. If you experience crashes after an update, temporarily disable experimental flags and try again.</p>
          <CopyBlock className="mt-2" label="Copy JSON" code={fflagsJson} />
        </div>
      ),
    },
    {
      title: "Optional: advanced Roblox client args",
      icon: icons.args,
      content: (
        <div className="space-y-2">
          <p>For advanced users. Launch parameters may change across updates:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Try disabling unnecessary overlays via command flags if supported.</li>
            <li>Keep backups and note changes; revert if stability issues appear.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Optimize network access and ping",
      icon: icons.network,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Prefer wired Ethernet over Wi-Fi for lower latency.</li>
          <li>Close downloads/streams on your network; enable QoS if available.</li>
          <li>Use nearest servers when selectable; avoid VPNs unless required.</li>
        </ul>
      ),
    },
    {
      title: "In-game graphics: shadows off, textures low, short view distance",
      icon: icons.ingame,
      content: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Shadows: Off; Ambient Occlusion: Off when possible.</li>
          <li>Textures: Low or Medium; disable motion blur.</li>
          <li>View distance: Short/Medium; turn down post-processing.</li>
        </ul>
      ),
    },
  ];

  const fpsRows = [
    { rig: "Low-end (iGPU)", before: 35, after: 75 },
    { rig: "Mid-range (GTX/RTX entry)", before: 60, after: 120 },
    { rig: "High-end (RTX)", before: 90, after: 165 },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold">Roblox Performance Optimizer</h1>
      <p className="text-gray-400 mt-2">
        Follow these focused steps to reduce stutter, lower input latency, and increase FPS in Roblox.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-neutral-900 animate-pop">
        <div className="px-4 py-3 border-b border-white/10 font-semibold">Before / After FPS (sample)</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-950/50 text-gray-300">
              <tr>
                <th className="text-left px-4 py-2 font-medium">System</th>
                <th className="text-left px-4 py-2 font-medium">Before</th>
                <th className="text-left px-4 py-2 font-medium">After</th>
                <th className="text-left px-4 py-2 font-medium">Gain</th>
              </tr>
            </thead>
            <tbody>
              {fpsRows.map((r, i) => {
                const gain = r.after - r.before;
                return (
                  <tr key={i} className="border-t border-white/10">
                    <td className="px-4 py-2">{r.rig}</td>
                    <td className="px-4 py-2">{r.before} FPS</td>
                    <td className="px-4 py-2">{r.after} FPS</td>
                    <td className="px-4 py-2 text-emerald-400">+{gain}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {steps.map((s, idx) => (
          <div className="animate-slide-up" key={idx}>
          <Step index={idx + 1} title={s.title} icon={s.icon}>
            {s.content}
          </Step>
          </div>
        ))}
      </div>

      {/* Advanced: Delete Textures Guide */}
      <div className="mt-10 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-400">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-amber-300">Advanced: Delete Textures for Maximum FPS</h3>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          <strong className="text-amber-200">⚠️ Warning:</strong> This will remove Roblox textures and make the game look worse. Only do this if you need absolute maximum FPS on a low-end PC. You can restore textures by reinstalling Roblox.
        </p>
        <div className="bg-neutral-900/50 rounded-lg p-4 border border-white/10">
          <div className="font-semibold text-white mb-3">Step-by-Step Guide:</div>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
            <li>
              <strong>Search for Roblox</strong> in Windows Start menu
            </li>
            <li>
              <strong>Right-click on Roblox</strong> → Select <span className="text-purple-300">"Open file location"</span>
            </li>
            <li>
              <strong>Right-click on the shortcut again</strong> → Select <span className="text-purple-300">"Open file location"</span> one more time
            </li>
            <li>
              Navigate to: <code className="px-2 py-0.5 bg-black/40 rounded text-purple-300">PlatformContent → pc → textures</code>
            </li>
            <li>
              <strong className="text-amber-300">Select all texture files</strong> in this folder
            </li>
            <li>
              <strong className="text-amber-300">Move them to a backup folder</strong> on your desktop (DON'T delete permanently!)
            </li>
            <li>
              Launch Roblox and enjoy the FPS boost (game will look plain/low-quality)
            </li>
          </ol>
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-sm text-blue-300 font-semibold mb-1">💡 To Restore Textures:</div>
            <p className="text-xs text-gray-300">
              Simply move the texture files back to the original folder, or reinstall Roblox from the Microsoft Store or Roblox website.
            </p>
          </div>
        </div>
      </div>

      {/* Mods / Scripts Browser */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 grid place-items-center rounded-md bg-neutral-800 border border-white/10 text-purple-300">
            {icons.mods}
          </div>
          <h2 className="text-xl font-semibold">Mod / Script Browser</h2>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Curated utilities. Use at your own risk and follow Roblox/servers' rules. Prefer open-source where possible.
        </p>

        {(() => {
          const trustColor = (t) =>
            t === "Verified" ? "bg-emerald-900/40 text-emerald-300 border-emerald-700/40" :
            t === "Caution" ? "bg-amber-900/30 text-amber-300 border-amber-700/30" :
            "bg-red-900/30 text-red-300 border-red-700/30";

          const mods = [
            {
              name: "Bloxstrap Launcher",
              desc: "Modern Roblox bootstrapper with a built-in FPS unlocker and graphics tweaks.",
              trust: "Verified",
              href: "https://github.com/pizzaboxer/bloxstrap/releases",
              infoHref: "/tools/roblox-optimizer/bloxstrap",
            },
          ];

          return (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {mods.map((m, i) => (
                  <div key={i} className="p-4 rounded-xl bg-neutral-900 border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className={`text-[11px] px-2 py-0.5 rounded border ${trustColor(m.trust)}`}>{m.trust}</div>
                      <div className="text-[11px] text-gray-500 ml-auto">Utility</div>
                    </div>
                    <div className="mt-1 font-semibold">{m.name}</div>
                    <p className="text-sm text-gray-400 mt-1">{m.desc}</p>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={m.href}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm"
                      >
                        Install
                      </a>
                      <a
                        href={m.infoHref ?? m.href}
                        target={m.infoHref ? "_self" : "_blank"}
                        rel={m.infoHref ? undefined : "noreferrer"}
                        className="px-3 py-1 rounded bg-neutral-900 border border-white/10 text-sm hover:bg-neutral-800"
                      >
                        Info
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <a
                  href="/mods"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-purple-200 hover:bg-neutral-800 transition-colors"
                >
                  Need Roblox mods? Browse the catalog
                </a>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}





