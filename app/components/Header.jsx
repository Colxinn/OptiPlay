'use client'
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header(){ 
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const abortRef = useRef();

  useEffect(()=>{
    if (process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true') {
      const u = localStorage.getItem('dev_user');
      if (u) setUser(JSON.parse(u));
    }
  },[])

  useEffect(() => {
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
  }, [query]);

  function devLogin(){ 
    const owner = { id: 'dev-owner', name: 'bigob', email: 'owner@local.dev', isOwner:true };
    localStorage.setItem('dev_user', JSON.stringify(owner));
    setUser(owner);
    alert('Simulated owner login set (dev). Refresh if needed.');
  }
  function devLogout(){ localStorage.removeItem('dev_user'); setUser(null); alert('Logged out (dev)'); }

  function handleSubmit(e){
    e.preventDefault();
    const term = query.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
    setOpen(false);
  }

  return (
    <header className="border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-36 h-8 bg-gradient-to-r from-optiPurple-600 to-optiPurple-400 rounded flex items-center justify-center font-bold tracking-wide text-black">OptiPlay</div>
          <nav className="hidden md:flex gap-3 text-sm text-slate-300">
            <Link href="/" className="px-3 py-1 rounded hover:bg-white/5">Home</Link>
            <Link href="/tools" className="px-3 py-1 rounded hover:bg-white/5">Tools</Link>
            <Link href="/news" className="px-3 py-1 rounded hover:bg-white/5">News</Link>
            <Link href="/forum" className="px-3 py-1 rounded hover:bg-white/5">Community</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Search tools, guides, news..."
                className="bg-[#0f0f10] px-3 py-2 rounded-md text-sm border border-white/5 w-80 text-gray-200"
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                onFocus={()=>setOpen(true)}
                onBlur={()=>setTimeout(()=>setOpen(false), 150)}
              />
            </form>
            {open && suggestions.length ? (
              <div className="absolute z-20 mt-2 w-full rounded-lg border border-white/10 bg-neutral-950/95 shadow-lg shadow-black/40">
                <ul className="divide-y divide-white/5 text-sm text-gray-200">
                  {suggestions.map((item) => (
                    <li key={item.href}>
                      <button
                        type="button"
                        onMouseDown={(e)=>e.preventDefault()}
                        onClick={()=>{
                          router.push(item.href);
                          setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-purple-600/20"
                      >
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-purple-300">
                          <span>{item.category}</span>
                          <span className="text-gray-500">{item.href}</span>
                        </div>
                        <div className="font-semibold text-white">{item.title}</div>
                        <div className="text-xs text-gray-400">{item.description}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          {process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true' ? (
            user ? <button onClick={devLogout} className="px-3 py-2 bg-optiPurple-600 rounded">Logout</button> :
            <button onClick={devLogin} className="px-3 py-2 bg-optiPurple-600 rounded">Dev Login (owner)</button>
          ) : (
            <div>
              <a href="/api/auth/signin" className="px-3 py-2 bg-optiPurple-600 rounded">Sign in</a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
