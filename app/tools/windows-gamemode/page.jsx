"use client";

import CopyBlock from "@/app/components/CopyBlock.jsx";
import { useState } from "react";

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-xl bg-neutral-900 border border-white/10 p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 grid place-items-center rounded-md bg-neutral-800 border border-white/10 text-purple-300">
          {/* spark icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11 3l1.5 5H18l-4 3 1.5 5L11 13 7 16l1.5-5-4-3h5.5L11 3z"/></svg>
        </div>
        <div>
          <div className="font-semibold leading-tight">{title}</div>
          {subtitle ? <div className="text-sm text-gray-400">{subtitle}</div> : null}
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-300 space-y-3">{children}</div>
    </div>
  );
}

export default function Page() {
  const [appliedUsb, setAppliedUsb] = useState(false);

  const usbPowerCfg = `powercfg /SETACVALUEINDEX SCHEME_CURRENT SUB_USB USBSELECTIVESUSPEND 0\npowercfg /SETDCVALUEINDEX SCHEME_CURRENT SUB_USB USBSELECTIVESUSPEND 0\npowercfg /SETACTIVE SCHEME_CURRENT`;

  const hagsDeepLink = `ms-settings:display-advancedgraphics`;
  const refreshDeepLink = `ms-settings:display-advanced`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold">Input Lag Reducer + Display Optimizer</h1>
      <p className="text-gray-400 mt-2">
        Safe one‑click-ish steps to cut input latency and dial in your display for gaming. Nothing invasive; everything is reversible.
      </p>

      <div className="mt-6 grid gap-4">
        <Card title="Input Lag Reducer" subtitle="USB power, polling, and driver priority hints">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Disable USB selective suspend (prevents mouse/keyboard from sleeping):
              <CopyBlock className="mt-2" label="Copy"
                code={usbPowerCfg}
              />
            </li>
            <li>
              Mouse software: set polling rate to your device’s max stable value (generally 1000 Hz; some pro mice support 2K–8K).
            </li>
            <li>
              Device Manager → Universal Serial Bus controllers → for each USB Root Hub (USB 3.0+): Properties → Power Management → uncheck “Allow the computer to turn off this device to save power”.
            </li>
            <li>
              GPU panel: enable low‑latency modes.
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>NVIDIA: Low Latency Mode = On/Ultra per game; set Max Frame Rate to your monitor’s refresh or slightly below.</li>
                <li>AMD: Anti‑Lag/Anti‑Lag+ On; set FRTC cap if available.</li>
                <li>Intel Arc: Low Latency toggle On; set FPS limit.</li>
              </ul>
            </li>
          </ol>
        </Card>

        <Card title="Display Optimizer" subtitle="Resolution, refresh rate, HDR/SDR, color profile">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Set highest refresh: Open Advanced display settings then pick the max refresh rate for your gaming monitor.
              <div className="mt-2">
                <a href={refreshDeepLink} className="inline-block text-xs px-2 py-1 rounded bg-neutral-800 border border-white/10">Open advanced display</a>
              </div>
            </li>
            <li>
              GPU control panel → set scaling to display (or GPU if needed) and ensure your desktop uses native resolution.
            </li>
            <li>
              Color profile: Install the monitor ICC from the manufacturer when available. Then apply via Color Management → Devices → Add… → Set as Default Profile.
            </li>
            <li>
              Optional: Hardware‑accelerated GPU scheduling (HAGS)
              <div className="text-gray-400">Settings → System → Display → Graphics → Default settings → toggle “Hardware‑accelerated GPU scheduling”.</div>
              <div className="mt-2"><a href={hagsDeepLink} className="inline-block text-xs px-2 py-1 rounded bg-neutral-800 border border-white/10">Open graphics settings</a></div>
            </li>
          </ol>
        </Card>

        <div className="text-[11px] text-gray-500">Build: Input/Display Optimizer v2025-10-27-1</div>
      </div>
    </div>
  );
}
