'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBox({ className = '' }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((payload) => {
          if (Array.isArray(payload?.matches)) {
            setSuggestions(payload.matches.slice(0, 6));
          } else {
            setSuggestions([]);
          }
        })
        .catch(() => setSuggestions([]));
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  function handleSubmit(event) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
    setOpen(false);
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full rounded-lg border border-white/10 bg-[#0b0b10] px-3 py-1.5 text-sm text-gray-200"
          placeholder="Search tools, guides..."
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </form>
      {open && suggestions.length ? (
        <div className="absolute z-30 mt-2 w-full rounded-lg border border-white/10 bg-neutral-950/95 shadow-lg shadow-black/30">
          <ul className="divide-y divide-white/5 text-sm text-gray-200">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 hover:bg-purple-600/20"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-purple-300">
                    <span>{item.category}</span>
                    <span className="text-gray-500">{item.href}</span>
                  </div>
                  <div className="font-semibold text-white">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
