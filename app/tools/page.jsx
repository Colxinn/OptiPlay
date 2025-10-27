
import Link from 'next/link';
export default function ToolsPage(){ const tools=[
  {slug:'sense-converter',name:'Sensitivity Converter',desc:'Convert sens between CS2, Valorant, SiegeX, Fortnite, Roblox, Minecraft, Rust, Apex.'},
  {slug:'dpi-calculator',name:'DPI Calculator',desc:'Find the perfect DPI.'},
  {slug:'fps-booster',name:'FPS Booster',desc:'One-click FPS presets.'},
  {slug:'latency-tuner',name:'Latency Tuner',desc:'Network tweaks for lower ping.'},
  {slug:'roblox-optimizer',name:'Roblox Optimizer',desc:'Optimized configs for Roblox.'},
  {slug:'windows-gamemode',name:'Windows Game Mode',desc:'Low-latency Windows settings.'},
]; return (<div className="max-w-6xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold mb-6">OptiPlay Tools</h1>
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{tools.map(t=>(<Link key={t.slug} href={`/tools/${t.slug}`} className="block bg-[#0b0b10] border border-white/10 rounded p-4 hover:border-optiPurple-500"><div className="font-semibold">{t.name}</div><div className="text-sm text-slate-300 mt-1">{t.desc}</div></Link>))}</div></div>) }