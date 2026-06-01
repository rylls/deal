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

  // Charger le compte en cours
  const { data: compte } = await supabase
    .from("comptes")
    .select("*")
    .eq("id", compteId)
    .single();

  if (!compte) {
    notFound();
  }

  // Charger tous les deals associés à ce compte qui ne sont pas 'done'
  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .eq("compte_id", compteId)
    .neq("status", "done")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="border-b pb-4 flex flex-col gap-2">
        <div className="text-sm">
          <Link href="/comptes" className="text-zinc-400 hover:text-[#007AFF] transition-colors">← Retour aux comptes</Link>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{compte.name}</h1>
        <p className="text-zinc-500">Détails des opportunités et actions en cours.</p>
      </header>

      <div className="space-y-4">
        {deals?.map((deal: any) => (
          <div 
            key={deal.id} 
            className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="font-semibold text-lg text-zinc-900">{deal.subject}</h2>
                {deal.city && (
                  <span className="inline-flex items-center text-xs text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded font-medium">
                    📍 {deal.city}
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                deal.status === 'waiting' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {deal.status === 'waiting' ? 'En attente' : 'À faire'}
              </span>
            </div>
            
            <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Next Step
              </span>
              <p className="text-zinc-800 text-sm">{deal.next_action || "Aucune prochaine étape définie"}</p>
            </div>
          </div>
        ))}

        {(!deals || deals.length === 0) && (
          <div className="bg-zinc-50 border border-dashed rounded-xl p-8 text-center text-zinc-500">
            Aucun deal en cours pour ce compte.
          </div>
        )}
      </div>
    </div>
  );
}