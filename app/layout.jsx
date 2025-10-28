<<<<<<< HEAD
import "./globals.css";
import { auth } from "@/lib/auth";
import AuthButtons from "./components/AuthButtons.jsx";
import Link from "next/link";

export const metadata = { title: "OptiPlay", description: "Play smarter, run faster, stay updated." };

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0b18] text-gray-200">
        <header className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            <Link href="/" className="font-bold text-xl text-purple-300 px-2 py-1 rounded-lg bg-white/5">OptiPlay</Link>
            <nav className="hidden md:flex gap-4 text-sm">
              <Link href="/tools">Tools</Link>
              <Link href="/mods">Mods</Link>
              <Link href="/heatmap">Heatmap</Link>
              <Link href="/benchmarks">Benchmarks</Link>
              <Link href="/esports">Esports</Link>
              <Link href="/pc-checker">PC Checker</Link>
              <Link href="/forum">Forum</Link>
              <Link href="/news">News</Link>
              {session?.user?.isOwner ? (
                <Link href="/admin" className="text-purple-400 hover:text-purple-300">Admin</Link>
              ) : null}
            </nav>
            <div className="flex-1" />
            <div className="hidden md:block w-80">
              <input
                placeholder="Search tools, guides..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#0b0b10] border border-white/10 text-sm"
              />
            </div>
            <Link href="/contribute" className="ml-2 hidden sm:inline-block px-3 py-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-sm">Contribute</Link>
            <div className="ml-2"><AuthButtons session={session} /></div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
=======
import './globals.css'

export const metadata = {
  title: 'OptiPlay',
  description: 'Play smarter, run faster, stay updated.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-[#050306] to-[#0b0320] text-slate-100">
        {children}
      </body>
    </html>
  )
>>>>>>> origin/main
}
