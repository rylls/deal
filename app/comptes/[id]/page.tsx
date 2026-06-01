import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { deleteDealAction } from "@/app/actions";
// IMPORT DU NOUVEAU BOUTON CONTEXTUEL 👇
import CreateDealButtonLocal from "@/app/components/CreateDealButtonLocal";

export default async function CompteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const compteId = parseInt(resolvedParams.id, 10);

  if (isNaN(compteId)) notFound();

  const { data: compte } = await supabase.from("comptes").select("*").eq("id", compteId).single();
  if (!compte) notFound();

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("compte_id", compteId)
    .order("created_at", { ascending: false });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      <header className="space-y-4">
        <div>
          <Link href="/comptes" className="text-[13px] font-semibold text-[#0071e3] hover:underline inline-flex items-center gap-1">
            ‹ Retour aux comptes
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">{compte.name}</h1>
      </header>

      <div className="space-y-6">
        {/* Titre et Bouton alignés sur une ligne fluide parfaite à la Apple */}
        <div className="flex justify-between items-center border-b border-black/[0.04] pb-2">
          <h2 className="text-lg font-bold text-[#1d1d1f]">Suivi des Deals en cours</h2>
          <CreateDealButtonLocal compteId={compteId} />
        </div>
        
        {deals?.map((deal: any) => (
          <div key={deal.id} className="group relative bg-white p-6 rounded-2xl border border-black/[0.06] shadow-sm space-y-4 hover:border-[#0071e3] apple-curve hover:shadow-md">
            
            {/* Formulaire de suppression rapide du deal */}
            <form 
              action={async () => {
                "use server";
                await deleteDealAction(deal.id, compteId);
              }}
              className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 apple-curve"
            >
              <button type="submit" className="text-xs text-red-500 hover:bg-red-50 p-2 rounded-xl cursor-pointer font-bold border border-red-100">
                🗑️ Supprimer le deal
              </button>
            </form>

            <Link href={`/comptes/deals/${deal.id}`} className="block space-y-4">
              <div className="flex justify-between items-start gap-4 pr-32">
                <div className="space-y-1">
                  <h3 className="font-bold text-[20px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] apple-curve">
                    {deal.subject}
                  </h3>
                  {deal.city && <span className="inline-flex text-[11px] text-[#86868b] font-medium">📍 {deal.city}</span>}
                </div>
                
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${getPriorityColor(deal.priority)}`}>
                  {deal.priority || 'Medium'}
                </span>
              </div>
              
              <div className="bg-[#f5f5f7] p-4 rounded-xl border border-black/[0.01]">
                <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest block mb-1">
                  Prochaine étape
                </span>
                <p className="text-[#1d1d1f] text-[14px] font-semibold leading-relaxed">
                  {deal.next_action || "Aucune action définie"}
                </p>
              </div>
              
              <div className="text-right">
                <span className="text-xs text-[#0071e3] font-bold opacity-0 group-hover:opacity-100 apple-curve">
                  Ouvrir l'espace de travail interactif →
                </span>
              </div>
            </Link>
          </div>
        ))}

        {(!deals || deals.length === 0) && (
          /* Ajout du bouton d'appel à l'action directement centré au milieu du bloc vide */
          <div className="bg-white rounded-2xl p-12 text-center text-[#86868b] border border-dashed border-black/[0.08] flex flex-col items-center justify-center gap-5">
            <p className="text-[15px] text-[#86868b] font-medium">Aucun deal en cours pour ce compte client.</p>
            <CreateDealButtonLocal compteId={compteId} />
          </div>
        )}
      </div>
    </div>
  );
}