import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ComptesPage() {
  // const supabase = await createClient();
  
  // Plus tard, vous utiliserez ceci quand votre table 'comptes' existera :
  // const { data: comptes } = await supabase.from("comptes").select("*").order("name");

  // Données fictives pour l'instant
  const comptes = [
    { id: 1, name: "Acme Corp", dealCount: 2 },
    { id: 2, name: "Stark Industries", dealCount: 0 },
    { id: 3, name: "Wayne Enterprises", dealCount: 5 },
  ];

  return (
    <div className="space-y-8">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Comptes</h1>
        <p className="text-zinc-500">Gérez vos clients et leurs deals associés.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comptes.map((compte) => (
          <Link href={`/comptes/${compte.id}`} key={compte.id}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
              <h2 className="font-semibold text-lg text-zinc-900">{compte.name}</h2>
              <p className="text-sm text-zinc-500 mt-2">
                {compte.dealCount} deal{compte.dealCount > 1 ? 's' : ''} en cours
              </p>
            </div>
          </Link>
        ))}

        {comptes.length === 0 && (
          <p className="text-center text-zinc-500 py-8">Aucun compte pour le moment.</p>
        )}
      </div>
    </div>
  );
}