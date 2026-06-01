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
  
  const { data: comptes } = await supabase
    .from("comptes")
    .select("id, name")
    .order("name");

  return (
    <html lang="fr" className="h-full antialiased">
      <body className="h-full flex bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden">
        
        {/* Navigation latérale immersive macOS */}
        <aside className="w-[250px] bg-[#f5f5f7] border-r border-black/[0.06] flex flex-col shrink-0 h-full pt-16 pb-6 px-4">
          <div className="px-3 mb-8 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
            <h2 className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Workspace</h2>
          </div>
          
          <nav className="flex-1 space-y-1">
            <Link 
              href="/" 
              className="flex items-center px-4 py-2.5 text-[13px] font-medium rounded-xl text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] apple-curve"
            >
              <span className="mr-3 text-base">📊</span> Dashboard
            </Link>
            <Link 
              href="/comptes" 
              className="flex items-center px-4 py-2.5 text-[13px] font-medium rounded-xl text-[#1d1d1f] hover:bg-black/[0.04] active:bg-black/[0.08] apple-curve"
            >
              <span className="mr-3 text-base">🏢</span> Comptes
            </Link>
          </nav>
        </aside>

        {/* Zone applicative centrale */}
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