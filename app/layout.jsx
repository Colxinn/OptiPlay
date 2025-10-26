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
}
