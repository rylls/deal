"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { addTimelineEventAction, deleteTimelineEventAction, saveTimelineOrderAction, updateDealPropertiesAction, toggleTimelineEventCompletionAction } from "@/app/actions";

const appleBlockColors = [
  { bg: "bg-[#f4f7fe] border-[#0071e3]/20 text-[#0071e3]", focus: "focus:border-[#0071e3]" }, 
  { bg: "bg-[#fdf4fb] border-[#fa43cd]/20 text-[#fa43cd]", focus: "focus:border-[#fa43cd]" }, 
  { bg: "bg-[#fef8f3] border-[#ff9500]/20 text-[#ff9500]", focus: "focus:border-[#ff9500]" }, 
  { bg: "bg-[#f3fbf7] border-[#34c759]/20 text-[#34c759]", focus: "focus:border-[#34c759]" }, 
  { bg: "bg-[#f7f4fe] border-[#5856d6]/20 text-[#5856d6]", focus: "focus:border-[#5856d6]" }  
];

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
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");

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

  const handleUpdateDealProperties = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMsg("Mise à jour...");
    const formData = new FormData(e.currentTarget);
    const res = await updateDealPropertiesAction(dealId, formData);
    if (res.success) {
      setStatusMsg("Fiche mise à jour !");
      setShowEditPanel(false);
      loadData();
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction || !newDate) return;

    setStatusMsg("Planification...");
    const nextPosition = timelineEvents.length + 1;
    const res = await addTimelineEventAction(dealId, newAction, newDate, nextPosition, newTaskPriority);
    
    if (res.success) {
      setNewAction("");
      setNewDate("");
      setNewTaskPriority("Medium");
      setStatusMsg("Action insérée !");
      loadData();
    }
  };

  const handleToggleComplete = async (eventId: number, currentStatus: boolean) => {
    const res = await toggleTimelineEventCompletionAction(dealId, eventId, currentStatus);
    if (res.success) loadData();
  };

  const handleDeleteBlock = async (id: number) => {
    const res = await deleteTimelineEventAction(dealId, id);
    if (res.success) loadData();
  };

  const handleLocalChange = (index: number, field: "action" | "event_date" | "task_priority" | "comment", value: string) => {
    const updated = [...timelineEvents];
    updated[index][field] = value as any;
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
      setStatusMsg("Timeline et commentaires enregistrés !");
      loadData();
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  // ---- DRAG AND DROP NATIVE ----
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

  const getReminderTag = (dateStr: string, isCompleted: boolean) => {
    if (isCompleted) return { label: "✓ Terminé", classes: "bg-green-500/10 text-green-700 border-transparent" };
    const today = new Date().toISOString().split('T')[0];
    if (dateStr < today) return { label: "Retard ⚠️", classes: "bg-red-500 text-white border-transparent" };
    if (dateStr === today) return { label: "Aujourd'hui 📅", classes: "bg-blue-500 text-white border-transparent" };
    return { label: "Planifié", classes: "bg-black/[0.04] text-zinc-600 border-transparent" };
  };

  if (!deal) return <div className="p-16 text-center text-sm text-zinc-400">Chargement...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-center">
        <Link href={`/comptes/${deal.compte_id}`} className="text-[13px] font-bold text-[#0071e3] hover:underline">
          ‹ Retour au compte {deal.comptes?.name}
        </Link>
        <span className="text-xs font-bold text-[#0071e3]">{statusMsg}</span>
      </div>

      {/* BLOC SUPÉRIEUR : FICHE STRATÉGIQUE */}
      <div className="bg-white border border-black/[0.06] p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">{deal.subject}</h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-900 text-white">
                {deal.priority || 'Medium'}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#86868b] font-semibold">
              {deal.city && <span>📍 {deal.city}</span>}
              {deal.deadline && <span>📅 Deadline : {new Date(deal.deadline).toLocaleDateString('fr-FR')}</span>}
            </div>
          </div>
          <button 
            onClick={() => setShowEditPanel(!showEditPanel)}
            className="bg-black/[0.04] text-[#1d1d1f] hover:bg-black/[0.08] font-bold px-4 py-2 rounded-xl text-xs apple-curve cursor-pointer"
          >
            {showEditPanel ? "Fermer l'édition" : "Modifier la fiche ✎"}
          </button>
        </div>

        {showEditPanel && (
          <form onSubmit={handleUpdateDealProperties} className="border-t border-black/[0.05] pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Sujet du Deal</label>
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
                <option value="waiting">En en attente</option>
                <option value="done">Terminé (Done)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase">Prochaine étape globale</label>
              <input type="text" name="next_action" defaultValue={deal.next_action || ""} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold" />
            </div>
            <div className="sm:col-span-2 md:col-span-3 text-right pt-2">
              <button type="submit" className="bg-[#0071e3] text-white font-bold text-xs px-5 py-2.5 rounded-xl apple-curve">
                Sauvegarder la fiche
              </button>
            </div>
          </form>
        )}
      </div>

      {/* PIPELINE DE PROGRESSION STRATÉGIQUE (ALIGNEMENT PERFECT CORRIGÉ) */}
      <div className="relative max-w-xl mx-auto mb-6">
        {/* Ligne d'arrière-plan continue grise - Alignée à top-[20px] (centre de l'icône w-10) */}
        <div className="absolute top-[20px] left-[48px] right-[48px] h-[3px] bg-black/[0.06] z-0 rounded-full" />
        
        {/* Ligne de progression active bleue animée - Alignée à top-[20px] */}
        <div 
          className="absolute top-[20px] left-[48px] right-[48px] h-[3px] bg-gradient-to-r from-[#0071e3] to-[#42a5f5] z-0 rounded-full apple-curve shadow-[0_0_12px_rgba(0,113,227,0.3)] origin-left" 
          style={{
            transform: `scaleX(${activeStep === "qualification" ? 0 : activeStep === "estimation" ? 0.5 : 1})`,
            transition: "transform 450ms cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        />

        {/* Conteneur des jalons */}
        <div className="relative flex justify-between items-start z-10">
          {/* Étape 1 : Qualification */}
          <button 
            type="button"
            onClick={() => setActiveStep("qualification")}
            className="flex flex-col items-center gap-2 group focus:outline-none w-24 text-center cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 apple-curve shadow-md transition-all duration-300 ${
              activeStep === "qualification" 
                ? "bg-white border-[#0071e3] text-[#0071e3] ring-4 ring-[#0071e3]/10 scale-105 font-black" 
                : "bg-[#0071e3] border-[#0071e3] text-white"
            }`}>
              {activeStep === "qualification" ? "1" : "✓"}
            </div>
            <span className={`text-[12px] font-bold tracking-tight apple-curve ${
              activeStep === "qualification" ? "text-[#1d1d1f] font-extrabold" : "text-[#86868b] group-hover:text-[#1d1d1f]"
            }`}>
              Qualification
            </span>
          </button>

          {/* Étape 2 : Chiffrage */}
          <button 
            type="button"
            onClick={() => setActiveStep("estimation")}
            className="flex flex-col items-center gap-2 group focus:outline-none w-24 text-center cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 apple-curve shadow-md transition-all duration-300 ${
              activeStep === "estimation" 
                ? "bg-white border-[#0071e3] text-[#0071e3] ring-4 ring-[#0071e3]/10 scale-105 font-black" 
                : activeStep === "recap"
                  ? "bg-[#0071e3] border-[#0071e3] text-white"
                  : "bg-white border-zinc-200 text-zinc-400"
            }`}>
              {activeStep === "recap" ? "✓" : "2"}
            </div>
            <span className={`text-[12px] font-bold tracking-tight apple-curve ${
              activeStep === "estimation" ? "text-[#1d1d1f] font-extrabold" : "text-[#86868b] group-hover:text-[#1d1d1f]"
            }`}>
              Chiffrage
            </span>
          </button>

          {/* Étape 3 : Récapitulatif */}
          <button 
            type="button"
            onClick={() => setActiveStep("recap")}
            className="flex flex-col items-center gap-2 group focus:outline-none w-24 text-center cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 apple-curve shadow-md transition-all duration-300 ${
              activeStep === "recap" 
                ? "bg-gradient-to-tr from-[#0071e3] to-[#42a5f5] border-transparent text-white ring-4 ring-[#0071e3]/10 scale-105 font-black" 
                : "bg-white border-zinc-200 text-zinc-400"
            }`}>
              3
            </div>
            <span className={`text-[12px] font-bold tracking-tight apple-curve ${
              activeStep === "recap" ? "text-[#1d1d1f] font-extrabold" : "text-[#86868b] group-hover:text-[#1d1d1f]"
            }`}>
              Récapitulatif
            </span>
          </button>
        </div>
      </div>

      {activeStep === "qualification" ? (
        <div className="space-y-8">
          
          {/* AJOUTER UNE ÉTAPE AU CADENCIER */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">Planifier une nouvelle brique d'action</h3>
            <form onSubmit={handleAddBlock} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-6 space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase">Intitulé du jalon</label>
                <input type="text" value={newAction} onChange={(e) => setNewAction(e.target.value)} required placeholder="Ex: Démo technique Proof of Concept" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium" />
              </div>
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase">Échéance</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium bg-white" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="w-full bg-[#0071e3] text-white text-xs font-bold py-3 rounded-xl shadow-sm cursor-pointer">
                  + Insérer
                </button>
              </div>
            </form>
          </div>

          {/* GESTIONNAIRE DE SUIVI GRAPHIQUE (ALIGNEMENT PARFAIT DE LA LIGNE ET DU ROND) */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1d1d1f]">Plan d'action & Suivi analytique</h2>
              <p className="text-xs text-[#86868b] font-medium mt-0.5">Glissez-déposez pour changer l'ordre opérationnel. Remplissez les blocs de commentaires pour historiser vos comptes-rendus.</p>
            </div>

            {timelineEvents.length > 0 ? (
              <div className="relative space-y-6">
                {/* Ligne verticale : alignée de façon stable à left-[7px] */}
                <div className="absolute top-0 bottom-0 left-[7px] w-[2px] bg-black/[0.08] z-0" />

                {timelineEvents.map((event, index) => {
                  const reminder = getReminderTag(event.event_date, event.completed);
                  const colorConfig = appleBlockColors[index % appleBlockColors.length];

                  return (
                    <div 
                      key={event.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className="relative flex items-start group z-10"
                    >
                      {/* Rond d'état absolu : w-4 h-4 (16px), centré sur la ligne (left-0), aligné en face de la première ligne de texte (top-[21px]) */}
                      <button
                        onClick={() => handleToggleComplete(event.id, event.completed)}
                        className={`absolute left-0 top-[21px] w-4 h-4 rounded-full border-2 border-white shadow-sm apple-curve z-20 cursor-pointer ${event.completed ? "bg-green-500" : "bg-zinc-300 hover:bg-[#0071e3]"}`}
                      ></button>

                      {/* Corps de carte décalé proprement par ml-7 pour créer une gouttière d'alignement parfaite */}
                      <div className={`ml-7 border rounded-2xl p-5 flex flex-col gap-4 shadow-sm flex-1 ${colorConfig.bg} ${event.completed ? "opacity-50" : ""}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.04] pb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xs bg-white border border-black/[0.05] text-[#1d1d1f] w-6 h-6 rounded-md flex items-center justify-center font-bold shrink-0">
                              {index + 1}
                            </span>
                            <input 
                              type="text" 
                              value={event.action} 
                              onChange={(e) => handleLocalChange(index, "action", e.target.value)}
                              className={`bg-transparent border-b border-transparent focus:outline-none text-[15px] font-extrabold text-[#1d1d1f] flex-1 min-w-[200px] ${colorConfig.focus} ${event.completed ? "line-through opacity-50" : ""}`}
                            />
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <input 
                              type="date" 
                              value={event.event_date} 
                              onChange={(e) => handleLocalChange(index, "event_date", e.target.value)}
                              className="bg-white border border-black/[0.06] rounded-lg text-xs font-bold text-[#1d1d1f] px-2 py-1 focus:outline-none"
                            />
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${reminder.classes}`}>
                              {reminder.label}
                            </span>
                            <button 
                              onClick={() => handleDeleteBlock(event.id)}
                              className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg apple-curve cursor-pointer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-black/40">
                            Notes de suivi / Compte-rendu d'étape
                          </label>
                          <textarea
                            rows={3}
                            value={event.comment || ""}
                            onChange={(e) => handleLocalChange(index, "comment", e.target.value)}
                            placeholder="Saisissez ici les détails de l'avancement, les retours du client ou les points de blocage rencontrés..."
                            className="w-full p-3 bg-white border border-black/[0.06] rounded-xl text-xs font-medium text-[#1d1d1f] focus:outline-none focus:border-[#0071e3] shadow-inner placeholder-zinc-400"
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400 text-sm font-medium border border-dashed rounded-xl bg-black/[0.01]">
                Votre plan de charge est vide. Insérez votre première brique ci-dessus.
              </div>
            )}

            {timelineEvents.length > 0 && (
              <div className="text-right border-t border-black/[0.04] pt-4">
                <button 
                  onClick={handleSaveTimeline}
                  className="bg-[#1d1d1f] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md apple-curve cursor-pointer hover:bg-black"
                >
                  ✓ Enregistrer l'ordre & les commentaires
                </button>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border text-center text-[#86868b] shadow-sm font-medium text-xs">
          🛠️ Le module de simulation et de génération de propositions financières de l'étape "Chiffrage" est prêt à être configuré.
        </div>
      )}

    </div>
  );
}