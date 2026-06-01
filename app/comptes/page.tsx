import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { deleteCompteAction } from "@/app/actions";

export default async function ComptesPage() {
  const supabase = await createClient();
  
  const { data: comptes } = await supabase
    .from("comptes")
    .select(`
      id,
      name,
      revenue,
      sector,
      primary_contact,
      deals(id, status)
    `)
    .order("name");

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">Comptes</h1>
        <p className="text-[17px] font-medium text-[#86868b]">Pilotez vos portefeuilles et les données stratégiques.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {comptes?.map((compte: any) => {
          const activeDealsCount = compte.deals?.filter((d: any) => d.status !== "done").length || 0;

          return (
            <div key={compte.id} className="group relative bg-white rounded-2xl border border-black/[0.06] hover:border-[#0071e3] p-6 flex flex-col justify-between min-h-52 apple-curve hover:shadow-xl hover:-translate-y-0.5">
              
              {/* Bouton de suppression absolute discret */}
              <form 
                action={async () => {
                  "use server";
                  await deleteCompteAction(compte.id);
                }}
                className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 apple-curve"
              >
                <button type="submit" className="text-xs text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer font-bold border border-red-100">
                  🗑️
                </button>
              </form>

              <Link href={`/comptes/${compte.id}`} className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pr-8">
                    <h2 className="font-bold text-[22px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] apple-curve">
                      {compte.name}
                    </h2>
                  </div>

                  <div className="space-y-2 text-[13px] border-t border-black/[0.03] pt-3">
                    <div className="flex justify-between">
                      <span className="text-[#86868b] font-medium">Potentiel / CA :</span>
                      <span className="font-semibold text-[#1d1d1f]">{compte.revenue || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b] font-medium">Secteur :</span>
                      <span className="font-semibold text-[#1d1d1f]">{compte.sector || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b] font-medium">Contact Clé :</span>
                      <span className="font-semibold text-[#1d1d1f] truncate max-w-[160px]">{compte.primary_contact || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold tracking-tight ${
                    activeDealsCount > 0 ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-black/[0.04] text-[#86868b]'
                  }`}>
                    {activeDealsCount} deal{activeDealsCount > 1 ? 's' : ''} actif{activeDealsCount > 1 ? 's' : ''}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}

        {(!comptes || comptes.length === 0) && (
          <div className="col-span-full bg-white rounded-2xl p-16 text-center border border-black/[0.05]">
            <p className="text-[15px] text-[#86868b] font-medium">Aucun compte actif. Utilisez le bouton d'ajout (+).</p>
          </div>
        )}
      </div>
    </div>
  );
}