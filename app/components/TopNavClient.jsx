"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNavClient({ session }) {
  const pathname = usePathname() || "/";
  
  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + "/") || (path === "/" && pathname === "/");
  };

  return (
    <nav className="hidden md:flex items-center gap-5 text-sm text-purple-200 whitespace-nowrap">
      <Link href="/tools" className={`px-3 py-1 rounded transition ${isActive("/tools") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>Tools</Link>
      <Link href="/pro-configs" className={`px-3 py-1 rounded transition ${isActive("/pro-configs") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>Pro Configs</Link>
      <Link href="/mods" className={`px-3 py-1 rounded transition ${isActive("/mods") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>Mods</Link>
      <Link href="/heatmap" className={`px-3 py-1 rounded transition ${isActive("/heatmap") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>Heatmap</Link>
      <Link href="/benchmarks" className={`px-3 py-1 rounded transition ${isActive("/benchmarks") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>Benchmarks</Link>
      <Link href="/esports" className={`px-3 py-1 rounded transition ${isActive("/esports") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>Esports</Link>
      <Link href="/forum" className={`px-3 py-1 rounded transition ${isActive("/forum") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>Forum</Link>
      <Link href="/news" className={`px-3 py-1 rounded transition ${isActive("/news") ? "bg-white/5 ring-1 ring-white/10" : "hover:text-purple-100"}`}>News</Link>
      {session?.user?.isOwner ? (
        <Link href="/admin" className={`px-3 py-1 rounded transition ${isActive("/admin") ? "bg-white/5 ring-1 ring-white/10" : "text-purple-300 hover:text-purple-100"}`}>Admin</Link>
      ) : null}
    </nav>
  );
}
