"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { addTimelineEventAction, deleteTimelineEventAction, saveTimelineOrderAction, updateDealPropertiesAction } from "@/app/actions";

export default function DealWorkspacePage({ params }: { params: Promise<{ dealId: string }> }) {
  const resolvedParams = use(params);
  const dealId = parseInt(resolvedParams.dealId, 10);

  const [activeStep, setActiveStep] = useState<"qualification" | "estimation" | "recap">("qualification");
  const [deal, setDeal] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);

  const [newAction, setNewAction] = useState("");
  const [newDate, setNewDate] = useState("");

  const supabase = createClient();

  const loadData = async () => {
    const { data: dealData } = await supabase.from("deals").select("*, comptes(name)").eq("id", dealId).single();
    const { data: timelineData } = await supabase.from("deal_timeline").select("*").eq("deal_id", dealId).order("position", { ascending: true });
    
    if (dealData) setDeal(dealData);
    if (timelineData) setTimelineEvents(timelineData);
  };

  useEffect(() => {
    loadData();
  }, [dealId]);

  // Mettre à jour les propriétés globales (Nom, Prio, Date limite...)
  const handleUpdateDealProperties = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMsg("Mise à jour de la fiche...");
    const formData = new FormData(e.currentTarget);
    const res = await updateDealPropertiesAction(dealId, formData);
    if (res.success) {
      setStatusMsg("Fiche mise à jour !");
      setShowEditPanel(false);
      loadData();
      setTimeout(() => setStatusMsg(null), 3000);
    } else {
      setStatusMsg(`Erreur : ${res.error}`);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction || !newDate) return;

    setStatusMsg("Ajout du bloc...");
    const nextPosition = timelineEvents.length + 1;
    const res = await addTimelineEventAction(dealId, newAction, newDate, nextPosition);
    
    if (res.success) {
      setNewAction("");
      setNewDate("");
      setStatusMsg("Bloc ajouté !");
      loadData();
    } else {
      setStatusMsg(`Erreur : ${res.error}`);
    }
  };

  const handleDeleteBlock = async (id: number) => {
    setStatusMsg("Suppression...");
    const res = await deleteTimelineEventAction(dealId, id);
    if (res.success) {
      setStatusMsg("Bloc supprimé.");
      loadData();
    }
  };

  const handleLocalChange = (index: number, field: "action" | "event_date", value: string) => {
    const updated = [...timelineEvents];
    updated[index][field] = value;
    setTimelineEvents(updated);
  };

  const handleSaveTimeline = async () => {
    setStatusMsg("Synchronisation...");
    const itemsToSave = timelineEvents.map((event, idx) => ({
      ...event,
      position: idx + 1
    }));
    
    const res = await saveTimelineOrderAction(dealId, itemsToSave);
    if (res.success) {
      setStatusMsg("Timeline enregistrée !");
      loadData();
    } else {
      setStatusMsg(`Erreur : ${res.error}`);
    }
  };

  // ---- DRAG AND DROP ----
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => { setDraggedIndex(index); };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const items = [...timelineEvents];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setTimelineEvents(items);
  };

  const handleDragEnd = () => { setDraggedIndex(null); };

  if (!deal) return <div className="p-16 text-center text-sm text-zinc-400">Chargement...</div>;

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-zinc-900';
      default: return 'bg-zinc-500 text-white';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-center">
        <Link href={`/comptes/${deal.compte_id}`} className="text-[13px] font-semibold text-[#0071e3] hover:underline">
          ‹ Retour au compte {deal.comptes?.name}
        </Link>
        <span className="text-xs font-bold text-[#0071e3]">{statusMsg}</span>
      </div>

      {/* HEADER PRINCIPAL DU DEAL */}
      <div className="bg-white border border-black/[0.06] p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">{deal.subject}</h1>
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${getPriorityBadgeColor(deal.priority)}`}>
                {deal.priority || 'Medium'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#86868b] font-medium">
              {deal.city && <span>📍 {deal.city}</span>}
              {deal.deadline && <span>📅 Échéance : {new Date(deal.deadline).toLocaleDateString('fr-FR')}</span>}
              <span>💼 Statut : {deal.status === 'waiting' ? 'En attente' : 'À faire'}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowEditPanel(!showEditPanel)}
            className="bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08] font-bold px-4 py-2 rounded-xl text-xs apple-curve cursor-pointer self-start sm:self-center"
          >
            {showEditPanel ? "Fermer l'édition" : "Modifier la fiche ✎"}
          </button>
        </div>

        {/* PANNEAU D'ÉDITION ÉVOLUÉ (Rétractable) */}
        {showEditPanel && (
          <form onSubmit={handleUpdateDealProperties} className="border-t border-black/[0.05] pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Nom / Sujet du Deal</label>
              <input type="text" name="subject" defaultValue={deal.subject} required className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Priorité</label>
              <select name="priority" defaultValue={deal.priority || "Medium"} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold bg-white">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Date Limite (Deadline)</label>
              <input type="date" name="deadline" defaultValue={deal.deadline || ""} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Ville</label>
              <input type="text" name="city" defaultValue={deal.city || ""} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Statut global</label>
              <select name="status" defaultValue={deal.status || "todo"} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold bg-white">
                <option value="todo">À faire</option>
                <option value="waiting">En attente</option>
                <option value="done">Terminé (Done)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Prochaine étape globale</label>
              <input type="text" name="next_action" defaultValue={deal.next_action || ""} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold" />
            </div>
            <div className="sm:col-span-2 md:col-span-3 text-right pt-2">
              <button type="submit" className="bg-[#0071e3] text-white font-bold text-xs px-5 py-2.5 rounded-xl apple-curve apple-active-press cursor-pointer">
                Sauvegarder la fiche
              </button>
            </div>
          </form>
        )}
      </div>

      {/* STEPPER DE NAVIGATION */}
      <div className="flex items-center justify-center bg-white border border-black/[0.05] p-3 rounded-2xl shadow-sm max-w-xl mx-auto">
        <button onClick={() => setActiveStep("qualification")} className={`px-5 py-2 rounded-xl text-[13px] font-semibold apple-curve ${activeStep === "qualification" ? "bg-[#0071e3] text-white" : "text-[#1d1d1f] hover:bg-black/[0.03]"}`}>
          📄 Qualification
        </button>
        <div className="h-[1px] bg-black/[0.08] w-12 mx-2"></div>
        <button onClick={() => setActiveStep("estimation")} className={`px-5 py-2 rounded-xl text-[13px] font-semibold apple-curve ${activeStep === "estimation" ? "bg-[#0071e3] text-white" : "text-[#86868b] hover:bg-black/[0.03]"}`}>
          📊 Estimation
        </button>
        <div className="h-[1px] bg-black/[0.08] w-12 mx-2"></div>
        <button onClick={() => setActiveStep("recap")} className={`px-5 py-2 rounded-xl text-[13px] font-semibold apple-curve ${activeStep === "recap" ? "bg-[#0071e3] text-white" : "text-[#86868b] hover:bg-black/[0.03]"}`}>
          ✓ Récapitulatif
        </button>
      </div>

      {activeStep === "qualification" ? (
        <div className="space-y-8">
          
          {/* AJOUT DE BLOC TIMELINE */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">Ajouter une étape chronologique</h3>
            <form onSubmit={handleAddBlock} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#86868b] uppercase">Action / Événement</label>
                <input type="text" value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="Ex: Partage récap à Nico" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#86868b] uppercase">Date prévue</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium bg-white" />
              </div>
              <button type="submit" className="bg-[#0071e3] text-white text-xs font-bold py-3 px-4 rounded-xl apple-curve apple-active-press cursor-pointer">
                + Ajouter à la ligne
              </button>
            </form>
          </div>

          {/* RENDU TIMELINE */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1d1d1f]">Timeline chronologique du Deal</h2>
              <p className="text-xs text-[#86868b] font-medium mt-0.5">Glissez-déposez les blocs pour changer l'ordre (1, 2, 3, 4) et éditez le texte directement.</p>
            </div>

            {timelineEvents.length > 0 ? (
              <div className="relative border-l-2 border-dashed border-[#0071e3]/30 pl-8 ml-4 space-y-6">
                {timelineEvents.map((event, index) => (
                  <div 
                    key={event.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="relative bg-[#f5f5f7] border border-black/[0.04] rounded-2xl p-4 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing apple-curve hover:border-zinc-400 group"
                  >
                    <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0071e3] border-4 border-white shadow-sm"></div>

                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-xs bg-[#0071e3] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm">
                        {index + 1}
                      </span>
                      <input 
                        type="text" 
                        value={event.action} 
                        onChange={(e) => handleLocalChange(index, "action", e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-[#0071e3] focus:outline-none text-sm font-semibold text-[#1d1d1f] flex-1 py-1"
                      />
                      <input 
                        type="date" 
                        value={event.event_date} 
                        onChange={(e) => handleLocalChange(index, "event_date", e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-[#0071e3] focus:outline-none text-xs font-bold text-[#86868b] py-1 bg-white p-1 rounded"
                      />
                    </div>

                    <button 
                      onClick={() => handleDeleteBlock(event.id)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-xl opacity-0 group-hover:opacity-100 apple-curve cursor-pointer font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400 text-sm font-medium border border-dashed rounded-xl bg-black/[0.01]">
                Timeline vide. Ajoutez un bloc pour démarrer le cadencier.
              </div>
            )}

            <div className="flex items-center justify-end border-t border-black/[0.05] pt-5">
              {timelineEvents.length > 0 && (
                <button 
                  onClick={handleSaveTimeline}
                  className="bg-[#0071e3] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm apple-active-press apple-curve cursor-pointer"
                >
                  ✓ Enregistrer la Timeline
                </button>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border text-center text-[#86868b] shadow-sm font-medium">
          🗂️ Vue en cours de construction pour l'étape "{activeStep === "estimation" ? "Estimation" : "Récapitulatif"}".
        </div>
      )}

    </div>
  );
}