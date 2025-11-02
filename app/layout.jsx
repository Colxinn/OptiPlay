import "./globals.css";
import { auth } from "@/lib/auth";
import AuthButtons from "./components/AuthButtons.jsx";
import Link from "next/link";
import SessionProvider from "./components/SessionProvider.jsx";
import AccountTracker from "./components/AccountTracker.jsx";
import VisitorTracker from "./components/VisitorTracker.jsx";
import SearchBox from "./components/SearchBox.jsx";
import Script from "next/script";

export const metadata = { title: "OptiPlay", description: "Play smarter, run faster, stay updated." };

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        {/* Google AdSense - Always loaded for verification */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2863890623382272"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#0f0b18] text-gray-200">
        <SessionProvider session={session}>
          <AccountTracker />
          <VisitorTracker />
          <header className="border-b border-white/10">
            <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 py-3">
              <Link href="/" className="font-bold text-xl text-purple-300 px-2 py-1 rounded-lg bg-white/5 whitespace-nowrap">OptiPlay</Link>
              <nav className="hidden md:flex items-center gap-5 text-sm text-purple-200 whitespace-nowrap">
                <Link className="transition hover:text-purple-100" href="/tools">Tools</Link>
                <Link className="transition hover:text-purple-100" href="/mods">Mods</Link>
                <Link className="transition hover:text-purple-100" href="/heatmap">Heatmap</Link>
                <Link className="transition hover:text-purple-100" href="/benchmarks">Benchmarks</Link>
                <Link className="transition hover:text-purple-100" href="/esports">Esports</Link>
                <Link className="transition hover:text-purple-100 whitespace-nowrap" href="/pc-checker">PC Checker</Link>
                <Link className="transition hover:text-purple-100" href="/forum">Forum</Link>
                <Link className="transition hover:text-purple-100" href="/news">News</Link>
                {session?.user?.isOwner ? (
                  <Link href="/admin" className="text-purple-300 hover:text-purple-100">Admin</Link>
                ) : null}
              </nav>
              <div className="flex-1" />
              <SearchBox className="hidden md:block w-80" />
              <Link href="/contribute" className="ml-2 hidden sm:inline-block rounded-lg bg-purple-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-purple-500">Contribute</Link>
              <div className="ml-2 whitespace-nowrap"><AuthButtons session={session} /></div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
