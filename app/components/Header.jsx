'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header(){ 
  const [user, setUser] = useState(null);
  useEffect(()=>{
    if (process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true') {
      const u = localStorage.getItem('dev_user');
      if (u) setUser(JSON.parse(u));
    }
  },[])

  function devLogin(){ 
    const owner = { id: 'dev-owner', name: 'bigob', email: 'owner@local.dev', isOwner:true };
    localStorage.setItem('dev_user', JSON.stringify(owner));
    setUser(owner);
    alert('Simulated owner login set (dev). Refresh if needed.');
  }
  function devLogout(){ localStorage.removeItem('dev_user'); setUser(null); alert('Logged out (dev)'); }

  return (
    <header className="border-b border-white/6">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-36 h-8 bg-gradient-to-r from-optiPurple-600 to-optiPurple-400 rounded flex items-center justify-center font-bold tracking-wide text-black">OptiPlay</div>
          <nav className="hidden md:flex gap-3 text-sm text-slate-300">
            <a className="px-3 py-1 rounded hover:bg-white/5">Home</a>
            <a className="px-3 py-1 rounded hover:bg-white/5">Tools</a>
            <a className="px-3 py-1 rounded hover:bg-white/5">Guides</a>
            <a className="px-3 py-1 rounded hover:bg-white/5">News</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <input placeholder="Search..." className="hidden sm:inline-block bg-[#0f0f10] px-3 py-2 rounded-md text-sm border border-white/5 w-80" />
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
