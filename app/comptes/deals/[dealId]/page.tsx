"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { addTimelineEventAction, deleteTimelineEventAction, saveTimelineOrderAction, updateDealPropertiesAction, toggleTimelineEventCompletionAction } from "@/app/actions";

export default function DealWorkspacePage({ params }: { params: Promise<{ dealId: string }> }) {
  const resolvedParams = use(params);
  const dealId = parseInt(resolvedParams.dealId, 10);

  const [activeStep, setActiveStep] = useState<"qualification" | "estimation" | "recap">("qualification");
  const [deal, setDeal] = useState<any>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);

  // Formulaire local pour l'ajout
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
      setStatusMsg("Propriétés enregistrées !");
      setShowEditPanel(false);
      loadData();
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction || !newDate) return;

    setStatusMsg("Planification du jalon...");
    const nextPosition = timelineEvents.length + 1;
    const res = await addTimelineEventAction(dealId, newAction, newDate, nextPosition, newTaskPriority);
    
    if (res.success) {
      setNewAction("");
      setNewDate("");
      setNewTaskPriority("Medium");
      setStatusMsg("Action planifiée !");
      loadData();
    }
  };

  const handleToggleComplete = async (eventId: number, currentStatus: boolean) => {
    const res = await toggleTimelineEventCompletionAction(dealId, eventId, currentStatus);
    if (res.success) {
      loadData();
    }
  };

  const handleDeleteBlock = async (id: number) => {
    const res = await deleteTimelineEventAction(dealId, id);
    if (res.success) {
      loadData();
    }
  };

  const handleLocalChange = (index: number, field: "action" | "event_date" | "task_priority", value: string) => {
    const updated = [...timelineEvents];
    updated[index][field] = value as any;
    setTimelineEvents(updated);
  };

  const handleSaveTimeline = async () => {
    setStatusMsg("Synchronisation globale...");
    const itemsToSave = timelineEvents.map((event, idx) => ({
      ...event,
      position: idx + 1
    }));
    
    const res = await saveTimelineOrderAction(dealId, itemsToSave);
    if (res.success) {
      setStatusMsg("Modifications de planification enregistrées !");
      loadData();
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  // ---- LOGIQUE DE GESTION DU REBOND DRAG & DROP ----
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

  // ---- CALCULATEUR DE REMINDERS INTELLIGENTS ----
  const getReminderTag = (dateStr: string, isCompleted: boolean) => {
    if (isCompleted) return { label: "✓ Terminé", classes: "bg-green-50 text-green-700 border-green-200/50" };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const targetDate = new Date(dateStr);
    targetDate.setHours(0,0,0,0);

    if (targetDate.getTime() < today.getTime()) {
      return { label: "En retard ⚠️", classes: "bg-red-50 text-red-700 border-red-200/60 font-bold animate-pulse" };
    } else if (targetDate.getTime() === today.getTime()) {
      return { label: "À faire aujourd'hui 📅", classes: "bg-blue-50 text-blue-700 border-blue-200/60 font-bold" };
    } else {
      return { label: "Planifié", classes: "bg-zinc-100 text-zinc-600 border-transparent" };
    }
  };

  if (!deal) return <div className="p-16 text-center text-sm text-[#86868b] font-medium">Chargement du Workspace...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-400">
      
      {/* Barre supérieure d'état */}
      <div className="flex justify-between items-center">
        <Link href={`/comptes/${deal.compte_id}`} className="text-[13px] font-bold text-[#0071e3] hover:underline flex items-center gap-1">
          ‹ {deal.comptes?.name}
        </Link>
        <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/5 px-3 py-1 rounded-full">{statusMsg || "A jour"}</span>
      </div>

      {/* COMPOSANT : FICHE D'ÉDITION DU DEALS */}
      <div className="bg-white border border-black/[0.06] p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1d1d1f]">{deal.subject}</h1>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${deal.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-zinc-100 text-zinc-800'}`}>
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
            {showEditPanel ? "Fermer l'édition" : "Détails & Métadonnées ✎"}
          </button>
        </div>

        {showEditPanel && (
          <form onSubmit={handleUpdateDealProperties} className="border-t border-black/[0.05] pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Sujet du Deal</label>
              <input type="text" name="subject" defaultValue={deal.subject} required className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Priorité Stratégique</label>
              <select name="priority" defaultValue={deal.priority || "Medium"} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold bg-white">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Échéance Finale</label>
              <input type="date" name="deadline" defaultValue={deal.deadline || ""} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold bg-white" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Ville</label>
              <input type="text" name="city" defaultValue={deal.city || ""} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Statut Pipeline</label>
              <select name="status" defaultValue={deal.status || "todo"} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold bg-white">
                <option value="todo">À faire</option>
                <option value="waiting">En en attente</option>
                <option value="done">Terminé (Gagné)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Prochaine action macro</label>
              <input type="text" name="next_action" defaultValue={deal.next_action || ""} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-semibold" />
            </div>
            <div className="sm:col-span-2 md:col-span-3 text-right pt-2">
              <button type="submit" className="bg-[#0071e3] text-white font-bold text-xs px-5 py-2.5 rounded-xl apple-curve cursor-pointer shadow-sm">
                Enregistrer les métadonnées
              </button>
            </div>
          </form>
        )}
      </div>

      {/* NAVIGATION INTERNE (STEPPER APPlE) */}
      <div className="flex items-center justify-center bg-white border border-black/[0.05] p-2.5 rounded-2xl shadow-sm max-w-md mx-auto">
        <button onClick={() => setActiveStep("qualification")} className={`px-4 py-2 rounded-xl text-[12px] font-bold apple-curve ${activeStep === "qualification" ? "bg-[#0071e3] text-white shadow-sm" : "text-[#86868b] hover:bg-black/[0.02]"}`}>
          📄 Plan de Qualification
        </button>
        <div className="h-[1px] bg-black/[0.08] w-8 mx-1"></div>
        <button onClick={() => setActiveStep("estimation")} className={`px-4 py-2 rounded-xl text-[12px] font-bold apple-curve ${activeStep === "estimation" ? "bg-[#0071e3] text-white shadow-sm" : "text-[#86868b] hover:bg-black/[0.02]"}`}>
          📊 Chiffrage
        </button>
      </div>

      {activeStep === "qualification" ? (
        <div className="space-y-6">
          
          {/* CRÉATEUR DE JALONS CHRONOLOGIQUES DE SUIVI */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">Planifier une action commerciale</h3>
            <form onSubmit={handleAddBlock} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase">Action requise</label>
                <input type="text" value={newAction} onChange={(e) => setNewAction(e.target.value)} required placeholder="Ex: Envoyer l'accord de confidentialité" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium" />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase">Date de réalisation</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium bg-white" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase">Priorité</label>
                <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-xs font-medium bg-white">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="w-full bg-[#0071e3] text-white text-xs font-bold py-3 px-3 rounded-xl apple-curve shadow-sm cursor-pointer">
                  Planifier
                </button>
              </div>
            </form>
          </div>

          {/* GESTIONNAIRE DE SUIVI GRAPHIQUE ET CHRONOLOGIQUE */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1d1d1f]">Cadencier & Plan d'Action Échéancé</h2>
              <p className="text-xs text-[#86868b] font-medium mt-0.5">Cochez les cercles pour valider l'action. Glissez les blocs pour ré-ordonner le déroulement des opérations.</p>
            </div>

            {timelineEvents.length > 0 ? (
              <div className="relative border-l border-black/[0.08] pl-6 ml-3 space-y-4">
                {timelineEvents.map((event, index) => {
                  const reminder = getReminderTag(event.event_date, event.completed);
                  return (
                    <div 
                      key={event.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`relative bg-[#f9f9f9] border border-black/[0.03] rounded-2xl p-4 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing apple-curve hover:border-black/[0.15] hover:bg-white group ${event.completed ? "opacity-60" : ""}`}
                    >
                      {/* Pastille interactive sur la ligne de vie */}
                      <button
                        onClick={() => handleToggleComplete(event.id, event.completed)}
                        className={`absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm apple-curve cursor-pointer ${event.completed ? "bg-green-500" : "bg-zinc-200 hover:bg-[#0071e3]"}`}
                      ></button>

                      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                        {/* Numéro chronologique automatique */}
                        <span className="text-[10px] bg-black/[0.05] text-[#1d1d1f] w-5 h-5 rounded-md flex items-center justify-center font-bold shrink-0">
                          {index + 1}
                        </span>

                        {/* Édition directe */}
                        <input 
                          type="text" 
                          value={event.action} 
                          onChange={(e) => handleLocalChange(index, "action", e.target.value)}
                          className={`bg-transparent border-b border-transparent focus:border-[#0071e3] focus:outline-none text-xs font-bold text-[#1d1d1f] flex-1 min-w-[150px] ${event.completed ? "line-through text-[#86868b]" : ""}`}
                        />
                        
                        <input 
                          type="date" 
                          value={event.event_date} 
                          onChange={(e) => handleLocalChange(index, "event_date", e.target.value)}
                          className="bg-white border border-black/[0.05] rounded-lg text-[11px] font-bold text-[#86868b] px-2 py-1 focus:outline-none focus:border-[#0071e3]"
                        />

                        {/* Sélecteur de priorité inline */}
                        <select
                          value={event.task_priority || "Medium"}
                          onChange={(e) => handleLocalChange(index, "task_priority", e.target.value)}
                          className="text-[11px] font-semibold bg-white border border-black/[0.04] rounded-lg px-1.5 py-1 text-zinc-700"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>

                        {/* Badge de Reminder Visuel Dynamique */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${reminder.classes}`}>
                          {reminder.label}
                        </span>
                      </div>

                      {/* Bouton de nettoyage rapide */}
                      <button 
                        onClick={() => handleDeleteBlock(event.id)}
                        className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 apple-curve cursor-pointer"
                      >
                        Retirer
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-[#86868b] text-xs font-medium border border-dashed rounded-xl bg-black/[0.01]">
                Aucune action planifiée pour le moment sur ce deal.
              </div>
            )}

            {timelineEvents.length > 0 && (
              <div className="text-right border-t border-black/[0.04] pt-4">
                <button 
                  onClick={handleSaveTimeline}
                  className="bg-[#1d1d1f] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm apple-active-press apple-curve cursor-pointer hover:bg-black"
                >
                  ✓ Enregistrer la planification de la frise
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