import dynamic from 'next/dynamic';

const CS2CrosshairRenderer = dynamic(
  () => import('../../components/CS2CrosshairRenderer'),
  { ssr: false }
);

export const metadata = {
  title: 'CS2 Crosshair Generator — OptiPlay',
  description: 'Pixel-accurate Counter-Strike 2 crosshair preview with live console command export.'
};

export default function CS2CrosshairPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CS2 Crosshair Generator</h1>
        <p className="text-sm text-slate-300 mt-2">
          Dial in your Counter-Strike 2 crosshair with one-to-one console values. Preview at 512×512 with outline, dot, and gap tweaks,
          then copy the ready-to-paste command string.
        </p>
      </div>
      <CS2CrosshairRenderer />
    </div>
  );
}
