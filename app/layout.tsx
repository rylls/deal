// uploaded:rylls/deal/deal-main/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Header from "@/app/components/Header";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update metadata to reflect the new brand
export const metadata: Metadata = {
  title: "Groupe Reej - Focus Deals",
  description: "Outil interne de gestion de deals",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  const { data: comptes } = await supabase
    .from("comptes")
    .select("id, name")
    .order("name");

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-white text-[#1d1d1f] overflow-hidden selection:bg-[#0071e3]/20">
        
        {/* Sidebar branding updated from 'Focus Workspace' to 'Groupe Reej' */}
        <aside className="w-[240px] bg-[#f5f5f7] border-r border-[#d2d2d7]/50 flex flex-col shrink-0 h-full pt-14 pb-6 px-4">
          <div className="px-3 mb-8">
            <h1 className="text-[17px] font-bold text-[#1d1d1f]">Groupe Reej</h1>
            <p className="text-[12px] text-[#86868b] font-medium">Focus Deals</p>
          </div>
          
          <nav className="flex-1 space-y-1">
            {/* Nav links updated with new brand name where applicable */}
            <Link 
              href="/" 
              className="flex items-center px-3 py-2 text-[13px] font-semibold rounded-lg text-[#1d1d1f] hover:bg-[#e8e8ed] apple-transition"
            >
              Tableau de bord
            </Link>
            <Link 
              href="/comptes" 
              className="flex items-center px-3 py-2 text-[13px] font-semibold rounded-lg text-[#1d1d1f] hover:bg-[#e8e8ed] apple-transition"
            >
              Comptes clients
            </Link>
          </nav>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          
          {/* Bouton Plus flottant */}
          <Header comptes={comptes || []} />
          
          <main className="flex-1 overflow-y-auto px-16 pt-24 pb-16">
            <div className="max-w-3xl mx-auto">
              {children}
            </div>
          </main>
        </div>

      </body>
    </html>
  );
}