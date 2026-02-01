import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import PresetApplier from '../PresetApplier';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getPreset(id) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'presets', `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to load preset:', error);
    return null;
  }
}

export async function generateStaticParams() {
  const presetsDir = path.join(process.cwd(), 'data', 'presets');
  
  if (!fs.existsSync(presetsDir)) {
    return [];
  }

  const files = fs.readdirSync(presetsDir).filter(f => f.endsWith('.json'));
  
  return files.map(file => ({
    id: file.replace('.json', '')
  }));
}

export async function generateMetadata({ params }) {
  const preset = await getPreset(params.id);
  if (!preset) return { title: 'Preset Not Found' };
  
  return {
    title: `${preset.name} - OptiPlay Presets`,
    description: preset.notes
  };
}

export default async function PresetDetailPage({ params }) {
  const preset = await getPreset(params.id);

  if (!preset) {
    notFound();
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/presets" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Presets
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {preset.name}
          </h1>
          <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getRiskColor(preset.risk_level)}`}>
            {preset.risk_level} Risk
          </span>
        </div>

        <p className="text-gray-300 text-lg mb-6">{preset.notes}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 hover:scale-105 transition-transform">
            <div className="text-xs text-gray-400 mb-1">FPS Gain</div>
            <div className="text-xl font-bold text-green-400 flex items-center gap-2">
              📈 {preset.estimated_gain.fps}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 hover:scale-105 transition-transform">
            <div className="text-xs text-gray-400 mb-1">Latency</div>
            <div className="text-xl font-bold text-blue-400 flex items-center gap-2">
              ⚡ {preset.estimated_gain.latency}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 hover:scale-105 transition-transform">
            <div className="text-xs text-gray-400 mb-1">Target</div>
            <div className="text-sm font-semibold text-white">🎮 {preset.target.join(', ')}</div>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/30 hover:scale-105 transition-transform">
            <div className="text-xs text-gray-400 mb-1">Hardware</div>
            <div className="text-sm font-semibold text-white">💻 {preset.hardware_tier.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* Interactive Step-by-Step Applier */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
          <span className="text-3xl animate-pulse">🎯</span>
          Step-by-Step Application Guide
        </h2>
        <PresetApplier preset={preset} />
      </section>

      {/* What It Changes (Summary) */}
      <section className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-2xl font-bold mb-4 text-white">⚙️ What This Preset Changes (Summary)</h2>
        
        {preset.applies.game_settings?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Game Settings</h3>
            <ul className="space-y-2">
              {preset.applies.game_settings.map((setting, i) => (
                <li key={i} className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>{setting}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {preset.applies.os_settings?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Windows Settings</h3>
            <ul className="space-y-2">
              {preset.applies.os_settings.map((setting, i) => (
                <li key={i} className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>{setting}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {preset.applies.driver_settings?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-orange-400">GPU/Driver Settings</h3>
            <ul className="space-y-2">
              {preset.applies.driver_settings.map((setting, i) => (
                <li key={i} className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>{setting}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {preset.applies.background_processes?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-pink-400">Background Processes</h3>
            <ul className="space-y-2">
              {preset.applies.background_processes.map((setting, i) => (
                <li key={i} className="flex items-start text-gray-300">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>{setting}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {preset.applies.optiplay_tools?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-400">OptiPlay Tools Used</h3>
            <ul className="space-y-2">
              {preset.applies.optiplay_tools.map((tool, i) => (
                <li key={i} className="flex items-start text-gray-300">
                  <span className="text-purple-400 mr-2">→</span>
                  <span>{tool}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* What It Does NOT Modify */}
      <section className="mb-8 p-6 rounded-xl bg-green-500/5 border border-green-500/30">
        <h2 className="text-2xl font-bold mb-4 text-green-400">🛡️ Safety: What This Does NOT Touch</h2>
        <ul className="space-y-2">
          {preset.does_not_modify.map((item, i) => (
            <li key={i} className="flex items-start text-gray-300">
              <span className="text-green-400 mr-2">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Revert Steps */}
      {preset.revert_supported && preset.revert_steps && (
        <section className="mb-8 p-6 rounded-xl bg-blue-500/5 border border-blue-500/30">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">↩️ How to Revert (Undo)</h2>
          <ol className="space-y-3">
            {preset.revert_steps.map((step, i) => (
              <li key={i} className="flex items-start text-gray-300">
                <span className="text-blue-400 font-bold mr-3">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Warnings */}
      {preset.warnings && preset.warnings.length > 0 && (
        <section className="mb-8 p-6 rounded-xl bg-yellow-500/5 border border-yellow-500/30">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">⚠️ Important Warnings</h2>
          <ul className="space-y-2">
            {preset.warnings.map((warning, i) => (
              <li key={i} className="flex items-start text-gray-300">
                <span className="text-yellow-400 mr-2">!</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Additional Info */}
      {preset.anti_cheat_safe && (
        <div className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
          <span className="text-green-400 font-semibold">✓ Anti-Cheat Safe (Vanguard, VAC, EAC)</span>
        </div>
      )}
    </div>
  );
}
