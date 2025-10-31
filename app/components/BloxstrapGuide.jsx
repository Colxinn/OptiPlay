"use client";

import { useState } from "react";

function Step({ index, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/60 overflow-hidden">
      <button
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-900/80"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-neutral-800 border border-white/10 text-purple-300">
          <span className="text-sm font-semibold">S{index}</span>
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
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-300 border-t border-white/10 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

export default function BloxstrapGuide() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Bloxstrap FPS Unlocker Setup</h1>
        <p className="text-sm text-gray-400">
          Follow these focused steps to install Bloxstrap, raise Roblox&apos;s frame cap, and tune graphics for smooth gameplay.
        </p>
      </header>

      <Step index={1} title="Install and launch Bloxstrap">
        <ul className="list-disc pl-5 space-y-1">
          <li>Download Bloxstrap from the official releases page and run the installer.</li>
          <li>Launch Bloxstrap and sign in with your Roblox account if prompted.</li>
          <li>Open the settings menu (gear icon in the upper right of the Bloxstrap window).</li>
        </ul>
      </Step>

      <Step index={2} title="Unlock the FPS cap">
        <p className="text-gray-300">
          Roblox ships with a 60 FPS limit. Bloxstrap removes that ceiling so high-refresh monitors can shine.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Inside Bloxstrap Settings, locate the <strong>FPS Cap</strong> control.</li>
          <li>Raise the cap to 120, 144, or 240 FPS (pick the highest value your display supports).</li>
          <li>Toggle on <strong>FPS Unlocker</strong> to remove Roblox&apos;s default limit.</li>
          <li>Click <em>Save</em> and restart any running Roblox sessions to apply the change.</li>
        </ul>
        <p className="text-xs text-gray-500">
          Even increasing the cap to 120 FPS provides a noticeable improvement if your hardware can keep up.
        </p>
      </Step>

      <Step index={3} title="Adjust Roblox graphics settings">
        <p className="text-gray-300">
          Fine-tune Roblox&apos;s in-game video options after unlocking the frame cap for consistent performance.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Lower Graphics Quality:</strong> Set Roblox&apos;s graphics slider to a lower level to free up GPU headroom.
          </li>
          <li>
            <strong>Disable Shadows &amp; Effects:</strong> Turn off shadows, textures, and other heavy effects to avoid sudden frame drops.
          </li>
          <li>
            <strong>Reduce Resolution:</strong> Lower the game resolution or play in windowed mode to improve FPS on lower-end rigs.
          </li>
          <li>
            <strong>Use DirectX 11:</strong> If available, switch the rendering API to DirectX 11 inside Roblox for better performance.
          </li>
        </ul>
        <p className="text-xs text-gray-500">
          These changes mirror the optimization playbook from our Roblox performance guide, so apply them and test in your favorite experiences.
        </p>
      </Step>
    </div>
  );
}
