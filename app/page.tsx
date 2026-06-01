import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  
  // Récupérer les deals qui ne sont pas terminés, triés par les plus récents
  const { data: deals } = await supabase
    .from("deals")
    .select("*")
    .neq("status", "done")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-8 font-sans">
      <main className="max-w-2xl mx-auto space-y-8">
        
        <header className="border-b pb-4">
          <h1 className="text-3xl font-bold tracking-tight">Focus Deals</h1>
          <p className="text-zinc-500">Un deal = Une prochaine action.</p>
        </header>

        <div className="space-y-4">
          {deals?.map((deal) => (
            <div 
              key={deal.id} 
              className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-lg">{deal.company}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
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
                <p className="text-zinc-800">{deal.next_action || "Aucune action définie"}</p>
              </div>
            </div>
          ))}

          {!deals?.length && (
            <p className="text-center text-zinc-500 py-8">Aucun deal en cours. Respirez !</p>
          )}
        </div>

      </main>
    </div>
  );
}