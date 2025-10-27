'use client';

import CopyBlock from './CopyBlock.jsx';

export default function ModCard({ name, desc, trust = 'Caution', action = 'link', href, script }) {
  const trustStyle =
    trust === 'Verified'
      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40'
      : trust === 'Caution'
      ? 'bg-amber-900/30 text-amber-300 border-amber-700/30'
      : 'bg-red-900/30 text-red-300 border-red-700/30';

  const onCopy = async () => {
    try { await navigator.clipboard.writeText(script || ''); } catch {}
  };

  return (
    <div className="p-4 rounded-xl bg-neutral-900 border border-white/10">
      <div className="flex items-center gap-2">
        <div className={`text-[11px] px-2 py-0.5 rounded border ${trustStyle}`}>{trust}</div>
        <div className="text-[11px] text-gray-500 ml-auto">Mod</div>
      </div>
      <div className="mt-1 font-semibold">{name}</div>
      <p className="text-sm text-gray-400 mt-1">{desc}</p>
      <div className="mt-3 flex gap-2">
        {action === 'link' ? (
          <a href={href} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm">Install</a>
        ) : (
          <button onClick={onCopy} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-sm">Copy Script</button>
        )}
        {action === 'link' && (
          <a href={href} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-neutral-900 border border-white/10 text-sm hover:bg-neutral-800">Info</a>
        )}
      </div>
      {action === 'script' && script ? (
        <CopyBlock className="mt-3" code={script} label="Copy" />
      ) : null}
    </div>
  );
}

