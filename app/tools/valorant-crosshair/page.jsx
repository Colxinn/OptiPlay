import ValorantCrosshairClient from './CrosshairClient.jsx';

export const metadata = {
  title: 'Valorant Crosshair Generator — OptiPlay',
  description: 'Mirror Valorant crosshair controls with a 512px preview and shareable settings summary.'
};

export default function ValorantCrosshairPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Valorant Crosshair Generator</h1>
        <p className="text-sm text-slate-300 mt-2">
          Adjust in-game sliders for inner/outer lines, gaps, and center dot to preview a pixel-snapped tactical reticle.
        </p>
      </div>
      <ValorantCrosshairClient />
    </div>
  );
}
