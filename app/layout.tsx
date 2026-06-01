import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Focus Deals",
  description: "Mon outil d'organisation minimaliste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-zinc-50 text-zinc-900 overflow-hidden">
        
        {/* Zone de contenu principale (à gauche) */}
        <div className="flex-1 flex flex-col h-full">
          {/* En-tête avec le bouton + */}
          <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-8 shrink-0">
            <h1 className="font-semibold text-lg text-zinc-400">Focus</h1>
            
            {/* Le bouton Ajouter */}
            <button className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-xl hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer">
              +
            </button>
          </header>
          
          {/* Contenu de la page (ex: page.tsx) */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>

        {/* Sidebar / Menu (à droite) */}
        <aside className="w-64 bg-white border-l border-zinc-200 flex flex-col shrink-0 h-full">
          <div className="h-16 flex items-center px-6 border-b border-zinc-200">
            <h2 className="font-bold text-xl">Menu</h2>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link 
              href="/" 
              className="block px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-black"
            >
              Dashboard
            </Link>
            <Link 
              href="/deals" 
              className="block px-4 py-2 rounded-lg bg-zinc-100 font-medium text-black transition-colors"
            >
              Mes Deals
            </Link>
          </nav>
        </aside>

      </body>
    </html>
  );
}