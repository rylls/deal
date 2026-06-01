import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { deleteCompteAction } from "@/app/actions";

export default async function ComptesPage() {
  const supabase = await createClient();
  
  // Récupération des données complètes incluant la priorité des deals
  const { data: comptes } = await supabase
    .from("comptes")
    .select(`
      id,
      name,
      revenue,
      sector,
      primary_contact,
      deals(id, status, priority)
    `)
    .order("name");

  // Matrice de poids des priorités commerciales pour le tri algorithmique
  const priorityWeights: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  // Tri automatique : Les comptes avec les deals actifs les plus prioritaires montent en haut
  comptes?.sort((a: any, b: any) => {
    const aMaxPriority = a.deals?.filter((d: any) => d.status !== "done").reduce((max: number, d: any) => Math.max(max, priorityWeights[d.priority] || 0), 0) || 0;
    const bMaxPriority = b.deals?.filter((d: any) => d.status !== "done").reduce((max: number, d: any) => Math.max(max, priorityWeights[d.priority] || 0), 0) || 0;
    return bMaxPriority - aMaxPriority;
  });

  const getPriorityBadge = (compte: any) => {
    const activeDeals = compte.deals?.filter((d: any) => d.status !== "done") || [];
    if (activeDeals.length === 0) return null;

    // Trouver la priorité la plus haute du compte
    const priorities = activeDeals.map((d: any) => d.priority);
    if (priorities.includes('Critical')) return <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-500 text-white shadow-sm animate-pulse">CRITICAL</span>;
    if (priorities.includes('High')) return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500 text-white shadow-sm">HIGH</span>;
    return null;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">Comptes clients</h1>
        <p className="text-[17px] font-medium text-[#86868b]">Pilotez vos portefeuilles et vos priorités d'action.</p>
      </header>

      {/* Grille optimisée à 3 colonnes pour écrans larges (lg:grid-cols-3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comptes?.map((compte: any) => {
          const activeDealsCount = compte.deals?.filter((d: any) => d.status !== "done").length || 0;

          return (
            <div key={compte.id} className="group relative bg-white rounded-2xl border border-black/[0.05] hover:border-[#0071e3] p-6 flex flex-col justify-between min-h-56 apple-curve hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-b from-white to-[#fafafa]/30">
              
              {/* Suppression discrète */}
              <form 
                action={async () => {
                  "use server";
                  await deleteCompteAction(compte.id);
                }}
                className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 apple-curve"
              >
                <button type="submit" className="text-xs text-red-500 hover:bg-red-50 p-1.5 rounded-xl cursor-pointer font-bold border border-red-100">
                  🗑️
                </button>
              </form>

              <Link href={`/comptes/${compte.id}`} className="space-y-4 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2 pr-6">
                    <h2 className="font-bold text-[20px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] apple-curve leading-snug">
                      {compte.name}
                    </h2>
                    <div className="shrink-0">
                      {getPriorityBadge(compte)}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[12px] border-t border-black/[0.03] pt-3">
                    <div className="flex justify-between">
                      <span className="text-[#86868b] font-medium">Potentiel / CA :</span>
                      <span className="font-bold text-[#1d1d1f]">{compte.revenue || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b] font-medium">Secteur :</span>
                      <span className="font-bold text-[#1d1d1f] truncate max-w-[120px]">{compte.sector || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b] font-medium">Contact Clé :</span>
                      <span className="font-bold text-[#1d1d1f] truncate max-w-[120px]">{compte.primary_contact || "—"}</span>
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