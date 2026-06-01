import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CompteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const resolvedParams = await params;
  const compteId = parseInt(resolvedParams.id, 10);

  if (isNaN(compteId)) {
    notFound();
  }

  const { data: compte } = await supabase
    .from("comptes")
    .select("*")
    .eq("id", compteId)
    .single();

  if (!compte) {
    notFound();
  }

  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("compte_id", compteId)
    .neq("status", "done")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <div>
          <Link href="/comptes" className="text-[13px] font-semibold text-[#0071e3] hover:underline inline-flex items-center gap-1">
            ‹ Retour aux comptes
          </Link>
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">{compte.name}</h1>
          <p className="text-[16px] font-medium text-[#86868b]">Suivi analytique des opportunités rattachées.</p>
        </div>
      </header>

      <div className="space-y-6">
        {deals?.map((deal: any) => (
          <div 
            key={deal.id} 
            className="bg-white p-6 rounded-2xl border border-black/[0.06] shadow-sm space-y-5 hover:shadow-md apple-curve"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <h2 className="font-bold text-[22px] tracking-tight text-[#1d1d1f] leading-snug">{deal.subject}</h2>
                
                {/* Badge de géolocalisation raffiné */}
                {deal.city && (
                  <span className="inline-flex items-center text-[11px] font-bold tracking-wider text-[#86868b] bg-black/[0.04] px-2.5 py-1 rounded-md uppercase">
                    📍 {deal.city}
                  </span>
                )}
              </div>
              
              {/* Badge d'état de l'opportunité */}
              <span className={`text-[12px] px-3 py-1 rounded-full font-bold border ${
                deal.status === 'waiting' 
                  ? 'bg-amber-500/[0.08] text-amber-600 border-amber-500/20' 
                  : 'bg-[#0071e3]/10 text-[#0071e3] border-transparent'
              }`}>
                {deal.status === 'waiting' ? 'En attente' : 'À faire'}
              </span>
            </div>
            
            {/* Boite de Prochaine Action - Directement inspirée du modèle */}
            <div className="bg-[#f5f5f7] p-4 rounded-xl border border-black/[0.02]">
              <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest block mb-1.5">
                Prochaine étape (Next step)
              </span>
              <p className="text-[#1d1d1f] text-[15px] font-semibold leading-relaxed">
                {deal.next_action || "Aucune action requise de définie"}
              </p>
            </div>
          </div>
        ))}

        {(!deals || deals.length === 0) && (
          <div className="bg-white rounded-2xl p-12 text-center border border-black/[0.05] shadow-sm">
            <p className="text-[15px] text-[#86868b] font-medium">Aucun dossier ou deal en cours pour ce compte client.</p>
          </div>
        )}
      </div>
    </div>
  );
}