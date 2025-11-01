'use client';

import dynamic from 'next/dynamic';
import ToolCard from './components/ToolCard.jsx';
import LeftSidebar from './components/LeftSidebar.jsx';
import FeaturedCard from './components/FeaturedCard.jsx';
const RightNews = dynamic(() => import('./components/RightNews.jsx'), { ssr: false });
const PingHeatmap = dynamic(() => import('./components/PingHeatmap.jsx'), { ssr: false });

export default function HomeClient() {
  const labTools = [
    { title: 'CS2 Crosshair Generator', slug: '/tools/cs2-crosshair', desc: 'Live Counter-Strike 2 preview with console command export.' },
    { title: 'Valorant Crosshair Generator', slug: '/tools/valorant-crosshair', desc: 'Pixel-accurate Valorant preview with slider-driven tuning.' },
    { title: 'Crosshair Lab', slug: '/tools/crosshair-lab', desc: 'Render 512px previews and export OptiPlay crosshair payloads.' },
  ];
  const tools = [
    { title: 'FPS Booster', slug: '/tools/fps-booster', desc: 'One-click presets to squeeze more FPS.' },
    { title: 'Sensitivity Converter', slug: '/tools/sense-converter', desc: 'Convert sens between games.' },
    { title: 'Input/Display Optimizer', slug: '/tools/windows-gamemode', desc: 'Reduce input lag and auto-calibrate display.' },
    { title: 'Roblox Optimizer', slug: '/tools/roblox-optimizer', desc: 'Optimized settings for Roblox.' },
    { title: 'DPI Calculator', slug: '/tools/dpi-calculator', desc: 'Find the perfect DPI for your mouse.' },
    { title: 'Latency Tuner', slug: '/tools/latency-tuner', desc: 'Simple network tweaks to reduce ping.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px,1fr,320px] gap-6">
      <aside className="order-2 md:order-1"><LeftSidebar /></aside>
      <section className="order-1 md:order-2 space-y-6">
        <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-6">
          <div className="text-purple-300 font-bold text-xl">Play smarter, run faster, stay updated.</div>
          <p className="text-sm text-gray-300 mt-2">OptiPlay bundles tools, guides, and daily esports news so you spend less time troubleshooting and more time fragging.</p>
          <div className="mt-4 flex gap-2">
            <a href="/tools" className="px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-sm">Get Tools</a>
            <a href="/news" className="px-3 py-1 rounded-lg bg-neutral-900 border border-white/10 text-sm hover:bg-neutral-800">Read Guides</a>
          </div>
        </div>
        <section className="rounded-xl border border-white/10 bg-[#0b0b10] p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">OptiPlay Lab</h2>
            <p className="text-sm text-slate-300 mt-1">Experimental builders for precision crosshairs and visual tuning. Perfect for CS2, Valorant, and tactical shooters.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {labTools.map(tool => (
              <ToolCard key={tool.slug} {...tool} />
            ))}
          </div>
        </section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {tools.map((t) => (<ToolCard key={t.slug} {...t} />))}
        </div>

        {/* Heatmap on homepage */}
        <PingHeatmap height={360} compact />
      </section>
      <aside className="order-3 space-y-4">
        <FeaturedCard />
        <RightNews />
      </aside>
    </div>
  );
}
