"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { addTimelineEventAction, deleteTimelineEventAction, saveTimelineOrderAction } from "@/app/actions";

export default function DealWorkspacePage({ params }: { params: Promise<{ dealId: string }> }) {
  const resolvedParams = use(params);
  const dealId = parseInt(resolvedParams.dealId, 10);

  const [activeStep, setActiveStep] = useState<"qualification" | "estimation" | "recap">("qualification");
  const [deal, setDeal] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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
      setStatusMsg("Timeline enregistrée avec succès !");
      loadData();
    } else {
      setStatusMsg(`Erreur : ${res.error}`);
    }
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

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

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!deal) return <div className="p-16 text-center text-sm text-zinc-400">Chargement de l'espace de travail...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <Link href={`/comptes/${deal.compte_id}`} className="text-[13px] font-semibold text-[#0071e3] hover:underline">
          ‹ Retour au deal
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">{deal.subject}</h1>
          <p className="text-[14px] text-[#86868b] font-medium mt-1">Workspace de gestion pour {deal.comptes?.name}</p>
        </div>
      </div>

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
          
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider">Ajouter un jalon / bloc sur la Timeline</h3>
            <form onSubmit={handleAddBlock} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#86868b] uppercase">Action / Étape</label>
                <input type="text" value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="Ex: Présentation de la démo technique" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#86868b] uppercase">Date prévue</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium bg-white" />
              </div>
              <button type="submit" className="bg-[#0071e3] text-white text-xs font-bold py-3 px-4 rounded-xl apple-curve apple-active-press cursor-pointer">
                + Insérer l'action
              </button>
            </form>
          </div>

          <div className="bg-white border border-black/[0.06] rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1d1d1f]">Timeline chronologique du Deal</h2>
              <p className="text-xs text-[#86868b] font-medium mt-0.5">Glissez-déposez les blocs verticaux pour réouvrir ou changer l'ordre (1, 2, 3, 4) de vos jalons.</p>
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
                La timeline est vide. Ajoutez votre premier bloc d'action ci-dessus !
              </div>
            )}

            <div className="flex items-center justify-between border-t border-black/[0.05] pt-5">
              <span className="text-xs font-semibold text-[#0071e3]">{statusMsg}</span>
              {timelineEvents.length > 0 && (
                <button 
                  onClick={handleSaveTimeline}
                  className="bg-[#0071e3] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm apple-active-press apple-curve cursor-pointer"
                >
                  ✓ Enregistrer l'ordre et les modifications
                </button>
              )}
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border text-center text-[#86868b] shadow-sm font-medium">
          𗎞 Vue en cours de construction pour l'étape "{activeStep === "estimation" ? "Estimation" : "Récapitulatif"}".
        </div>
      )}

    </div>
  );
}