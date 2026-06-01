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
  
  // Récupération des comptes et des deals pour alimenter les compteurs du menu
  const { data: comptes } = await supabase
    .from("comptes")
    .select("id, name, deals(id, status)");

  const totalActiveDeals = comptes?.reduce((acc, c) => {
    const active = c.deals?.filter((d: any) => d.status !== 'done').length || 0;
    return acc + active;
  }, 0) || 0;

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden selection:bg-[#0071e3]/20">
        
        {/* Sidebar immersive - Design Premium Groupe Reej */}
        <aside className="w-[250px] bg-[#f5f5f7] border-r border-black/[0.04] flex flex-col shrink-0 h-full pt-14 pb-6 px-4 justify-between">
          <div className="space-y-8">
            <div className="px-3">
              <h1 className="text-[18px] font-black text-[#1d1d1f] tracking-tight">Groupe Reej</h1>
              <p className="text-[11px] text-[#86868b] font-bold uppercase tracking-widest mt-0.5">Focus Deals</p>
            </div>
            
            <nav className="space-y-1">
              <Link 
                href="/" 
                className="group flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-xl text-[#1d1d1f] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[16px] group-hover:rotate-12 transition-transform duration-200">📊</span>
                  <span>Tableau de bord</span>
                </div>
              </Link>
              
              <Link 
                href="/comptes" 
                className="group flex items-center justify-between px-4 py-3 text-[13px] font-bold rounded-xl text-[#1d1d1f] hover:bg-[#0071e3]/5 hover:text-[#0071e3] transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[16px] group-hover:scale-110 transition-transform duration-200">🏢</span>
                  <span>Comptes clients</span>
                </div>
                {totalActiveDeals > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#0071e3]/10 text-[#0071e3] group-hover:bg-[#0071e3] group-hover:text-white transition-colors duration-200">
                    {totalActiveDeals}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          <div className="px-3 text-[11px] font-semibold text-[#86868b] border-t border-black/[0.04] pt-4">
            Pipeline Commerciale v1.2
          </div>
        </aside>

        {/* Espace de rendu principal */}
        <div className="flex-1 flex flex-col h-full bg-white relative rounded-l-3xl shadow-2xl border-l border-black/[0.02] mt-2 mb-2 mr-2 overflow-hidden">
          <Header comptes={comptes || []} />
          
          <main className="flex-1 overflow-y-auto px-16 pt-24 pb-16 bg-[#fafafa]">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>

      </body>
    </html>
  );
}