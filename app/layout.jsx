import "./globals.css";
import { auth } from "@/lib/auth";
import AuthButtons from "./components/AuthButtons.jsx";
import Link from "next/link";
import SessionProvider from "./components/SessionProvider.jsx";
import AccountTracker from "./components/AccountTracker.jsx";
import VisitorTracker from "./components/VisitorTracker.jsx";
import SearchBox from "./components/SearchBox.jsx";
import TopNavClient from "./components/TopNavClient.jsx";
import Script from "next/script";
import OGWelcomeBanner from "./components/OGWelcomeBanner.jsx";

export const metadata = { title: "OptiPlay", description: "Play smarter, run faster, stay updated." };

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        {/* Google AdSense Verification Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-2863890623382272" />
        
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2863890623382272"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#0f0b18] text-gray-200">
        <SessionProvider session={session}>
          <OGWelcomeBanner />
          <AccountTracker />
          <VisitorTracker />
          <header className="border-b border-white/10">
            <div className="max-w-7xl mx-auto flex items-center gap-6 px-4 py-3">
              <Link href="/" className="font-bold text-xl text-purple-300 px-2 py-1 rounded-lg bg-white/5 whitespace-nowrap">OptiPlay</Link>
              <TopNavClient session={session} />
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
