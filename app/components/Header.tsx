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
      <header className="h-20 flex items-center justify-end px-16 w-full absolute top-0 right-0 z-20 pointer-events-none">
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-[#0071e3] text-white w-9 h-9 rounded-full flex items-center justify-center text-xl font-light hover:bg-[#0077ed] shadow-md cursor-pointer apple-curve apple-active-press"
          >
            +
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-xl border border-black/[0.08] rounded-2xl shadow-2xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
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
        <div className="fixed inset-0 bg-black/15 backdrop-blur-lg flex items-center justify-center z-50 p-4 pointer-events-auto animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-300 cubic-bezier(0.16, 1, 0.3, 1)">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                {modalType === "compte" ? "Nouveau Compte" : "Nouveau Deal"}
              </h3>
              <button
                onClick={() => { setModalType(null); setError(null); }}
                className="text-[#86868b] hover:text-[#1d1d1f] text-xs font-semibold bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 rounded-full cursor-pointer apple-curve"
              >
                Annuler
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            {modalType === "compte" ? (
              <form onSubmit={handleCreateCompte} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                    Nom de la société
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: Apple Inc."
                    className="w-full p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-curve font-medium"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-semibold hover:bg-[#0077ed] text-[13px] shadow-sm apple-active-press apple-curve disabled:opacity-50"
                >
                  {isSubmitting ? "Création..." : "Enregistrer"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateDeal} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                    Rattachement compte obligatoire *
                  </label>
                  <select
                    name="compte_id"
                    required
                    className="w-full p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-curve font-medium appearance-none"
                  >
                    <option value="">Choisir un compte existant</option>
                    {comptes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                    Sujet ou mission *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Ex: Accord cadre d'infrastructure"
                    className="w-full p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-curve font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                    Localisation / Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ex: Paris"
                    className="w-full p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-curve font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                    Prochaine Action Immédiate (Next Step)
                  </label>
                  <input
                    type="text"
                    name="next_action"
                    placeholder="Ex: Valider le chiffrage final"
                    className="w-full p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-curve font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                    Statut initial
                  </label>
                  <select
                    name="status"
                    className="w-full p-3 bg-black/[0.02] border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-curve font-medium animate-none"
                  >
                    <option value="todo">À faire</option>
                    <option value="waiting">En attente</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0071e3] text-white py-3 rounded-xl font-semibold hover:bg-[#0077ed] text-[13px] shadow-sm apple-active-press apple-curve disabled:opacity-50 pt-4"
                >
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