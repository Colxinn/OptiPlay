
import ToolCard from '../components/ToolCard.jsx';

const ESSENTIAL_TOOLS = [
  { slug: '/tools/fps-booster', title: 'FPS Booster', desc: 'One-click presets to squeeze more FPS.' },
  { slug: '/tools/sense-converter', title: 'Sensitivity Converter', desc: 'Convert sens between CS2, Valorant, SiegeX, Fortnite, Roblox, Minecraft, Rust, Apex.' },
  { slug: '/tools/windows-gamemode', title: 'Input/Display Optimizer', desc: 'Reduce input lag and auto-calibrate display.' },
  { slug: '/tools/roblox-optimizer', title: 'Roblox Optimizer', desc: 'Optimized configs for Roblox.' },
  { slug: '/tools/dpi-calculator', title: 'DPI Calculator', desc: 'Find the perfect DPI.' },
  { slug: '/tools/latency-tuner', title: 'Latency Tuner', desc: 'Simple network tweaks to reduce ping.' }
];

const LAB_TOOLS = [
  { slug: '/tools/cs2-crosshair', title: 'CS2 Crosshair Generator', desc: 'Live Counter-Strike 2 preview with console command export.' },
  { slug: '/tools/valorant-crosshair', title: 'Valorant Crosshair Generator', desc: 'Pixel-accurate Valorant preview with slider-driven tuning.' },
  { slug: '/tools/crosshair-lab', title: 'Crosshair Lab', desc: 'Render 512px previews and export OptiPlay crosshair payloads.' }
];

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">OptiPlay Tools</h1>
        <p className="text-sm text-slate-300 mt-2">Core utilities to tune performance, peripherals, and connections.</p>
      </div>

      <section className="space-y-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ESSENTIAL_TOOLS.map(tool => (
            <ToolCard key={tool.slug} title={tool.title} slug={tool.slug} desc={tool.desc} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">OptiPlay Lab</h2>
          <p className="text-sm text-slate-300 mt-1">
            Experimental builders for precision crosshairs and visual tuning. Perfect for CS2, Valorant, and tactical shooters.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB_TOOLS.map(tool => (
            <ToolCard key={tool.slug} title={tool.title} slug={tool.slug} desc={tool.desc} />
          ))}
        </div>
      </section>
    </div>
  );
}
