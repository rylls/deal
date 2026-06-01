import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Récupérer toutes les données nécessaires
  const { data: comptes } = await supabase.from("comptes").select("id");
  const { data: deals } = await supabase.from("deals").select("id, status, priority, subject, compte_id, comptes(name)");
  const { data: timeline } = await supabase.from("deal_timeline").select("*, deals(subject, compte_id, comptes(name))");

  const totalComptes = comptes?.length || 0;
  const totalDeals = deals?.length || 0;
  const activeDeals = deals?.filter(d => d.status !== "done").length || 0;
  const closedDeals = deals?.filter(d => d.status === "done").length || 0;
  
  const winRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;
  const criticalDealsCount = deals?.filter(d => d.priority === "Critical" && d.status !== "done").length || 0;

  // Calculer les rappels et alertes de la timeline
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentTasks = timeline?.filter(t => {
    if (t.completed) return false;
    return t.event_date <= todayStr;
  })?.sort((a, b) => a.event_date.localeCompare(b.event_date)) || [];

  return (
    <div className="space-y-12 animate-in fade-in duration-400">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1d1d1f]">Dashboard</h1>
        <p className="text-[17px] font-medium text-[#86868b]">Analyse globale de votre activité commerciale.</p>
      </header>

      {/* GRILLE DES GRANDS INDICATEURS STYLE APPLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-black/[0.05] shadow-sm flex flex-col justify-between h-32">
          <span className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider">Comptes Clients</span>
          <span className="text-4xl font-black text-[#1d1d1f] tracking-tight">{totalComptes}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.05] shadow-sm flex flex-col justify-between h-32">
          <span className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider">Deals en cours</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#1d1d1f] tracking-tight">{activeDeals}</span>
            <span className="text-xs font-semibold text-[#86868b]">/ {totalDeals} au total</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.05] shadow-sm flex flex-col justify-between h-32">
          <span className="text-[12px] font-bold text-[#86868b] uppercase tracking-wider">Taux de Conversion</span>
          <span className="text-4xl font-black text-[#0071e3] tracking-tight">{winRate}%</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-black/[0.05] shadow-sm flex flex-col justify-between h-32 bg-red-50/40 border-red-100">
          <span className="text-[12px] font-bold text-red-600 uppercase tracking-wider">Urgences Critiques</span>
          <span className="text-4xl font-black text-red-600 tracking-tight">{criticalDealsCount}</span>
        </div>
      </div>

      {/* SECTION CONCRÈTE : REMINDERS & CHECKS DE CLIENTS ACTIONS */}
      <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Rappels d'actions & Alertes de retard</h2>
          <p className="text-xs text-[#86868b] font-medium mt-0.5">Vos tâches arrivées à échéance ou en retard sur l'ensemble de vos dossiers.</p>
        </div>

        <div className="space-y-3">
          {urgentTasks.map((task: any) => {
            const isOverdue = task.event_date < todayStr;
            return (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#f5f5f7] rounded-xl border border-black/[0.02] gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold bg-black/[0.05] text-[#1d1d1f] px-2 py-0.5 rounded">
                      {task.deals?.comptes?.name || "Compte"}
                    </span>
                    <span className="text-xs font-semibold text-[#86868b]">
                      ↳ {task.deals?.subject}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#1d1d1f]">{task.action}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                    isOverdue ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {isOverdue ? "⚠️ En retard" : "📅 Aujourd'hui"} ({new Date(task.event_date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})})
                  </span>
                  <Link href={`/comptes/deals/${task.deal_id}`} className="text-xs font-bold text-[#0071e3] hover:underline bg-white px-3 py-1.5 rounded-lg border border-black/[0.05] shadow-sm">
                    Ouvrir →
                  </Link>
                </div>
              </div>
            );
          })}

          {urgentTasks.length === 0 && (
            <div className="text-center py-8 text-sm text-[#86868b] font-medium bg-[#fafafa] border border-dashed rounded-xl">
              🎉 Aucune alerte de retard. Votre plan de charge commercial est parfaitement à jour !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}