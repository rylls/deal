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
        <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f]">Comptes</h1>
        <p className="text-[17px] text-[#86868b]">Suivez l'état global de vos relations clients.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {comptes?.map((compte: any) => {
          const activeDealsCount = compte.deals?.filter((d: any) => d.status !== "done").length || 0;

          return (
            <Link href={`/comptes/${compte.id}`} key={compte.id} className="group">
              <div className="bg-white p-6 rounded-2xl border border-[#d2d2d7]/60 hover:border-[#1d1d1f] flex flex-col justify-between h-36 apple-transition group-hover:shadow-sm">
                <h2 className="font-semibold text-[19px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] apple-transition">
                  {compte.name}
                </h2>
                <span className={`text-[12px] px-2.5 py-1 rounded-full self-start font-medium tracking-tight ${
                  activeDealsCount > 0 ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-[#f5f5f7] text-[#86868b]'
                }`}>
                  {activeDealsCount} deal{activeDealsCount > 1 ? 's' : ''} actif{activeDealsCount > 1 ? 's' : ''}
                </span>
              </div>
            </Link>
          );
        })}

        {(!comptes || comptes.length === 0) && (
          <div className="col-span-full bg-[#f5f5f7] rounded-2xl p-12 text-center border border-[#d2d2d7]/30">
            <p className="text-[15px] text-[#86868b]">Aucun compte pour le moment. Cliquez sur le bouton "+" pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}