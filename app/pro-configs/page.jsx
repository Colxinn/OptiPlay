import ProConfigBrowser from '../components/ProConfigBrowser';

export const metadata = {
  title: 'Pro Configs - CS2 & Valorant | OptiPlay',
  description: 'Browse professional player configurations for CS2 and Valorant. Copy crosshair settings, sensitivity, and more from top esports players.',
};

export default function ProConfigsPage() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-6">
        <h1 className="text-purple-300 font-bold text-2xl mb-2">Pro Configs</h1>
        <p className="text-sm text-gray-300">
          Professional player settings for CS2 and Valorant. Copy their crosshairs, 
          sensitivity, and configurations to improve your gameplay.
        </p>
      </div>

      {/* Browser Component */}
      <ProConfigBrowser game="cs2" />

      {/* Attribution Footer */}
      <div className="rounded-xl bg-[#0b0b10] border border-white/10 p-4">
        <p className="text-xs text-gray-500 text-center">
          Configuration data sourced from{' '}
          <a 
            href="https://prosettings.net" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition"
          >
            ProSettings.net
          </a>
          ,{' '}
          <a 
            href="https://csgoprosettings.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition"
          >
            CSGOProSettings.com
          </a>
          , and{' '}
          <a 
            href="https://valorantsettings.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition"
          >
            ValorantSettings.com
          </a>
          . All credit to the original sources.
        </p>
      </div>
    </div>
  );
}
