import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

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
    <div className="space-y-10">
      <header className="space-y-4">
        <div>
          <Link href="/comptes" className="text-[13px] font-semibold text-[#0071e3] hover:underline inline-flex items-center gap-1">
            ‹ Retour aux comptes
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">{compte.name}</h1>
      </header>

      <div className="space-y-6">
        <h2 className="text-lg font-bold text-[#1d1d1f]">Suivi des Deals en cours</h2>
        
        {deals?.map((deal: any) => (
          <Link href={`/comptes/deals/${deal.id}`} key={deal.id} className="block group">
            <div className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-sm space-y-4 group-hover:border-[#0071e3] apple-curve group-hover:shadow-md">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-[20px] tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] apple-curve">
                    {deal.subject}
                  </h3>
                  {deal.city && <span className="inline-flex text-[11px] text-[#86868b] font-medium">📍 {deal.city}</span>}
                </div>
                
                {/* Badge de priorité */}
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
                <span className="text-xs text-[#0071e3] font-medium opacity-0 group-hover:opacity-100 apple-curve">
                  Ouvrir l'espace de travail interactif →
                </span>
              </div>
            </div>
          </Link>
        ))}

        {(!deals || deals.length === 0) && (
          <div className="bg-white rounded-2xl p-12 text-center text-[#86868b] border border-dashed">
            Aucun deal en cours pour ce compte client.
          </div>
        )}
      </div>
    </div>
  );
}