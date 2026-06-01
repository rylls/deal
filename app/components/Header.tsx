"use client";

import { useState } from "react";
import { createCompteAction, createDealAction } from "@/app/actions";

interface Compte {
  id: number;
  name: string;
}

export default function Header({ comptes }: { comptes: Compte[] }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalType, setModalType] = useState<"compte" | "deal" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCompte = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createCompteAction(formData);
    setIsSubmitting(false);
    if (res.error) {
      setError(res.error);
    } else {
      setModalType(null);
      e.currentTarget.reset();
    }
  };

  const handleCreateDeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createDealAction(formData);
    setIsSubmitting(false);
    if (res.error) {
      setError(res.error);
    } else {
      setModalType(null);
      e.currentTarget.reset();
    }
  };

  return (
    <>
      <header className="h-16 flex items-center justify-end px-16 w-full absolute top-0 right-0 z-20 pointer-events-none">
        <div className="relative pointer-events-auto flex items-center h-full">
          {/* Bouton Plus avec icône SVG parfaitement centrée */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-[#0071e3] text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#0077ed] shadow-sm cursor-pointer apple-curve apple-active-press"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={3} 
              stroke="currentColor" 
              className="w-3.5 h-3.5 shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white/85 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-2xl py-1.5 z-30">
              <button
                onClick={() => { setModalType("compte"); setShowDropdown(false); }}
                className="w-full text-left px-5 py-3 text-[13px] text-[#1d1d1f] hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer font-medium"
              >
                Créer un compte
              </button>
              <button
                onClick={() => { setModalType("deal"); setShowDropdown(false); }}
                className="w-full text-left px-5 py-3 text-[13px] text-[#1d1d1f] hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer font-medium"
              >
                Créer un deal
              </button>
            </div>
          )}
        </div>
      </header>

      {modalType && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-lg flex items-center justify-center z-50 p-4 pointer-events-auto">
          <div className="bg-white/95 border border-black/[0.06] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-[#1d1d1f]">
                {modalType === "compte" ? "Nouveau Compte" : "Nouveau Deal"}
              </h3>
              <button
                onClick={() => { setModalType(null); setError(null); }}
                className="text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 rounded-full cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100">{error}</div>}

            {modalType === "compte" ? (
              <form onSubmit={handleCreateCompte} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Nom de la société *</label>
                  <input type="text" name="name" required placeholder="Ex: Local.fr" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Chiffre d'Affaires / Potentiel</label>
                  <input type="text" name="revenue" placeholder="Ex: 500k€" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Secteur d'activité</label>
                  <input type="text" name="sector" placeholder="Ex: Digital" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Contact Principal</label>
                  <input type="text" name="primary_contact" placeholder="Ex: Directeur Général" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px]" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-semibold text-[13px] apple-curve">
                  {isSubmitting ? "Enregistrement..." : "Créer le compte"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateDeal} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Compte *</label>
                  <select name="compte_id" required className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px] bg-white">
                    <option value="">Sélectionner un compte</option>
                    {comptes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Sujet du deal *</label>
                  <input type="text" name="subject" required placeholder="Ex: IA-Lecture document" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Ville</label>
                  <input type="text" name="city" placeholder="Ex: Lyon" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Prochaine étape *</label>
                  <input type="text" name="next_action" required placeholder="Ex: Relancer en Juin/Juillet" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Priorité</label>
                  <select name="priority" className="w-full p-2.5 bg-black/[0.02] border border-black/[0.06] rounded-xl text-[13px] bg-white">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-semibold text-[13px]">
                  {isSubmitting ? "Enregistrement..." : "Créer le deal"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}