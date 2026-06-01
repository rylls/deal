"use client";

import { useState } from "react";
import { createDealAction } from "@/app/actions";

export default function CreateDealButtonLocal({ compteId }: { compteId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    // On force l'injection de l'identifiant de ce compte précis de manière automatisée
    formData.append("compte_id", compteId.toString());
    
    const res = await createDealAction(formData);
    setIsSubmitting(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
      e.currentTarget.reset();
    }
  };

  return (
    <>
      {/* Bouton Plus style Apple avec icône vectorielle parfaitement centrée */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-[#0071e3] text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-[#0077ed] shadow-sm apple-curve apple-active-press cursor-pointer select-none"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={3} 
          stroke="currentColor" 
          className="w-3.5 h-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Créer un deal
      </button>

      {/* Fenêtre modale contextuelle d'insertion rapide */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-lg flex items-center justify-center z-50 p-4 pointer-events-auto select-none animate-in fade-in duration-200">
          <div className="bg-white/95 border border-black/[0.06] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-300 cubic-bezier(0.16, 1, 0.3, 1)">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-[#1d1d1f]">Nouveau Deal Rattaché</h3>
              <button
                onClick={() => { setIsOpen(false); setError(null); }}
                className="text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 rounded-full cursor-pointer apple-curve"
              >
                Annuler
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Sujet ou opportunité *</label>
                <input type="text" name="subject" required placeholder="Ex: Phase 2 Marketing" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#0071e3]" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Ville / Localisation</label>
                <input type="text" name="city" placeholder="Ex: Saint-Étienne" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#0071e3]" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Prochaine étape immédiate *</label>
                <input type="text" name="next_action" required placeholder="Ex: Partage récap à Nico" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px] font-medium focus:outline-none focus:bg-white focus:border-[#0071e3]" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Priorité initiale</label>
                <select name="priority" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px] bg-white font-medium focus:outline-none focus:bg-white focus:border-[#0071e3]">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-bold text-[13px] apple-curve shadow-sm disabled:opacity-50 pt-4">
                {isSubmitting ? "Planification en cours..." : "Valider et rattacher le deal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}