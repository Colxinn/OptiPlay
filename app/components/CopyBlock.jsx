'use client';

import { useState } from 'react';

export default function CopyBlock({ code, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }
  return (
    <div className={`relative rounded-lg overflow-hidden bg-neutral-950 border border-white/10 animate-fade-in ${className}`}>
      <button onClick={onCopy} className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-white/10 transition-colors">
        {copied ? 'Copied' : label}
      </button>
      <pre className="text-sm p-3 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
