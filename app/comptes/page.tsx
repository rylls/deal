import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ComptesPage() {
  const supabase = await createClient();
  
  const { data: comptes } = await supabase
    .from("comptes")
    .select(`
      id,
      name,
      deals(id, status)
    `)
    .order("name");

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">Comptes</h1>
        <p className="text-[17px] font-medium text-[#86868b]">Vue d'ensemble de vos comptes stratégiques.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comptes?.map((compte: any) => {
          const activeDealsCount = compte.deals?.filter((d: any) => d.status !== "done").length || 0;

          return (
            <Link href={`/comptes/${compte.id}`} key={compte.id} className="group block">
              <div className="bg-white p-6 rounded-2xl border border-black/[0.06] group-hover:border-[#0071e3] flex flex-col justify-between h-40 apple-curve group-hover:shadow-lg group-hover:-translate-y-0.5">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h2 className="font-bold text-[22px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] apple-curve">
                      {compte.name}
                    </h2>
                    <span className="text-xl opacity-0 group-hover:opacity-100 apple-curve">→</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[12px] px-3 py-1 rounded-full font-semibold tracking-tight ${
                    activeDealsCount > 0 ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-black/[0.04] text-[#86868b]'
                  }`}>
                    {activeDealsCount} deal{activeDealsCount > 1 ? 's' : ''} actif{activeDealsCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {(!comptes || comptes.length === 0) && (
          <div className="col-span-full bg-white rounded-2xl p-16 text-center border border-black/[0.05] shadow-sm">
            <span className="text-3xl block mb-3">📁</span>
            <p className="text-[15px] text-[#86868b] font-medium">Aucun compte actif. Utilisez le bouton d'ajout en haut à droite.</p>
          </div>
        )}
      </div>
    </div>
  );
}