import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Header from "@/app/components/Header";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Focus Workspace",
  description: "Système de pilotage de deals premium",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  
  // Récupération des comptes et calcul des comptes totaux pour le menu
  const { data: comptes } = await supabase
    .from("comptes")
    .select("id, name, deals(id, status)")
    .order("name");

  // Total des deals en cours dans toute l'application
  const totalActiveDeals = comptes?.reduce((acc, c) => {
    const active = c.deals?.filter((d: any) => d.status !== 'done').length || 0;
    return acc + active;
  }, 0) || 0;

  return (
    <html lang="fr" className="h-full antialiased">
      <body className="h-full flex bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden select-none">
        
        {/* Navigation latérale macOS Premium Immersive */}
        <aside className="w-[260px] bg-[#f5f5f7] flex flex-col shrink-0 h-full pt-16 pb-6 px-4 justify-between">
          <div className="space-y-8">
            {/* Logo / Header Workspace */}
            <div className="px-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] flex items-center justify-center text-white font-black text-xs shadow-sm">
                F
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-[#1d1d1f] tracking-tight">Focus Workspace</h2>
                <p className="text-[10px] font-medium text-[#86868b] uppercase tracking-widest mt-0.5">Commercial Hub</p>
              </div>
            </div>
            
            {/* Menu de navigation */}
            <nav className="space-y-1">
              <Link 
                href="/" 
                className="group flex items-center justify-between px-4 py-3 text-[13px] font-semibold rounded-xl text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.07] apple-curve relative"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[16px] group-hover:scale-110 apple-curve">📊</span>
                  <span>Dashboard</span>
                </div>
              </Link>
              
              <Link 
                href="/comptes" 
                className="group flex items-center justify-between px-4 py-3 text-[13px] font-semibold rounded-xl text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.07] apple-curve"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[16px] group-hover:scale-110 apple-curve">🏢</span>
                  <span>Comptes</span>
                </div>
                {totalActiveDeals > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0071e3]/10 text-[#0071e3] font-mono">
                    {totalActiveDeals}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Footer Sidebar / Profil utilisateur */}
          <div className="border-t border-black/[0.05] pt-4 px-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center font-bold text-xs text-zinc-700">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-[#1d1d1f]">Pipeline Commerciale</p>
              <p className="text-[10px] text-[#86868b] font-medium">Mode Planification</p>
            </div>
          </div>
        </aside>

        {/* Zone applicative centrale avec découpe incurvée premium */}
        <div className="flex-1 flex flex-col h-full bg-white relative rounded-l-3xl shadow-2xl border-l border-black/[0.04] mt-2 mb-2 mr-2 overflow-hidden">
          
          {/* Header flottant et bouton de déclenchement rapide */}
          <Header comptes={comptes || []} />
          
          <main className="flex-1 overflow-y-auto px-16 pt-24 pb-16 bg-[#fafafa]">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
        </div>

      </body>
    </html>
  );
}