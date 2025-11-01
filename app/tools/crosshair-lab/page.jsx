import CrosshairEngine, { DEFAULT_CROSSHAIR_CONFIG } from '../../components/CrosshairEngine';

export const metadata = {
  title: 'Crosshair Lab — OptiPlay',
  description: 'Design, preview, and export OptiPlay crosshair payloads for Valorant, CS2, and Apex Legends.'
};

export default function CrosshairLabPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crosshair Lab</h1>
        <p className="text-sm text-slate-300 mt-2">
          Paste JSON, tweak values, and instantly preview the rendered crosshair on a 512×512 canvas. OptiPlay outputs ready-to-use
          scripts for Counter-Strike 2, Valorant, and Apex Legends.
        </p>
      </div>
      <CrosshairEngine initialConfig={DEFAULT_CROSSHAIR_CONFIG} />
    </div>
  );
}
