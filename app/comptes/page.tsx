import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ComptesPage() {
  const supabase = await createClient();
  
  // Récupération des vrais comptes depuis SUPABASE
  const { data: comptes } = await supabase
    .from("comptes")
    .select(`
      id,
      name,
      deals(id, status)
    `)
    .order("name");

  return (
    <div className="space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Comptes</h1>
        <p className="text-zinc-500">Gérez vos clients et visualisez vos opportunités.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comptes?.map((compte: any) => {
          const activeDealsCount = compte.deals?.filter((d: any) => d.status !== "done").length || 0;

          return (
            <Link href={`/comptes/${compte.id}`} key={compte.id}>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:border-[#007AFF] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-32">
                <h2 className="font-semibold text-lg text-zinc-900">{compte.name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full self-start ${
                  activeDealsCount > 0 ? 'bg-blue-50 text-blue-700 font-medium' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {activeDealsCount} deal{activeDealsCount > 1 ? 's' : ''} en cours
                </span>
              </div>
            </Link>
          );
        })}

        {(!comptes || comptes.length === 0) && (
          <div className="col-span-full bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-8 text-center text-zinc-500">
            Aucun compte enregistré dans votre base de données. Utilisez le bouton "+" en haut à droite pour ajouter votre premier compte !
          </div>
        )}
      </div>
    </div>
  );
}