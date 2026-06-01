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
  description: "Mon outil d'organisation",
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
      <body className="h-full flex bg-white text-[#1D1D1F] overflow-hidden selection:bg-blue-200">
        
        {/* Sidebar (Gauche) - Style macOS */}
        <aside className="w-[260px] bg-[#F5F5F7] border-r border-[#E5E5EA] flex flex-col shrink-0 h-full pt-12 pb-6 px-4">
          <div className="px-3 mb-6">
            <h2 className="font-semibold text-[11px] text-[#86868B] uppercase tracking-wider">Organisation</h2>
          </div>
          
          <nav className="flex-1 space-y-1">
            <Link 
              href="/" 
              className="flex items-center px-3 py-2 text-[14px] font-medium rounded-md transition-colors text-[#1D1D1F] hover:bg-[#E8E8ED]"
            >
              Dashboard
            </Link>
            <Link 
              href="/comptes" 
              className="flex items-center px-3 py-2 text-[14px] font-medium rounded-md bg-[#E8E8ED] text-[#1D1D1F] transition-colors"
            >
              Comptes
            </Link>
          </nav>
        </aside>

        {/* Contenu principal (Droite) */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          
          {/* Header flottant pour placer le bouton + dans le coin supérieur droit */}
          <header className="h-16 flex items-center justify-end px-8 w-full absolute top-0 right-0 z-10 pointer-events-none">
            {/* Note: Ce bouton sera plus tard remplacé par un composant interactif pour le menu Créer */}
            <button className="pointer-events-auto bg-[#007AFF] text-white w-7 h-7 rounded-full flex items-center justify-center text-xl font-light hover:bg-[#0071E3] transition-all active:scale-95 shadow-sm">
              +
            </button>
          </header>
          
          {/* Zone où les pages s'affichent */}
          <main className="flex-1 overflow-y-auto px-12 pt-20 pb-12">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
        </div>

      </body>
    </html>
  );
}