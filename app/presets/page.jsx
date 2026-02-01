import PresetsList from './PresetsList';

export const metadata = {
  title: 'Performance Presets - OptiPlay',
  description: 'Safe, proven performance preset packs for gaming optimization. Non-destructive and fully reversible.'
};

export default function PresetsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Performance Preset Packs
        </h1>
        <p className="text-gray-300 text-lg">
          Battle-tested optimization profiles. Each preset is safe, reversible, and anti-cheat compliant.
        </p>
      </div>

      <div className="mb-8 p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">🛡️ Safety Guarantees</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>✅ No unsafe registry modifications</li>
          <li>✅ No system service tampering</li>
          <li>✅ All changes are fully reversible</li>
          <li>✅ Anti-cheat safe (Vanguard, VAC, Easy Anti-Cheat)</li>
          <li>✅ No third-party "booster" software required</li>
        </ul>
      </div>

      <PresetsList />
    </div>
  );
}
