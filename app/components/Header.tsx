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

  const handleCreateCompte = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await createCompteAction(formData);
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
    const formData = new FormData(e.currentTarget);
    const res = await createDealAction(formData);
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
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-[#0071e3] text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-light hover:bg-[#0077ed] shadow-sm cursor-pointer apple-transition active:scale-95"
          >
            +
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white/80 backdrop-blur-md border border-[#d2d2d7]/50 rounded-xl shadow-xl py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-200">
              <button
                onClick={() => { setModalType("compte"); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-[#1d1d1f] hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer font-medium"
              >
                Créer un compte
              </button>
              <button
                onClick={() => { setModalType("deal"); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-[#1d1d1f] hover:bg-[#0071e3] hover:text-white transition-colors cursor-pointer font-medium"
              >
                Créer un deal
              </button>
            </div>
          )}
        </div>
      </header>

      {modalType && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-md flex items-center justify-center z-50 p-4 pointer-events-auto">
          <div className="bg-white border border-[#d2d2d7]/60 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
                {modalType === "compte" ? "Nouveau Compte" : "Nouveau Deal"}
              </h3>
              <button
                onClick={() => { setModalType(null); setError(null); }}
                className="text-[#86868b] hover:text-[#1d1d1f] text-xs font-medium cursor-pointer apple-transition"
              >
                Annuler
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 font-medium">
                {error}
              </div>
            )}

            {modalType === "compte" ? (
              <form onSubmit={handleCreateCompte} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: Apple Inc."
                    className="w-full p-2.5 bg-[#f5f5f7] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0071e3] text-white py-2.5 rounded-lg font-medium hover:bg-[#0077ed] transition-colors cursor-pointer text-[13px] shadow-sm"
                >
                  Continuer
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateDeal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    Compte client *
                  </label>
                  <select
                    name="compte_id"
                    required
                    className="w-full p-2.5 bg-[#f5f5f7] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-transition appearance-none"
                  >
                    <option value="">Sélectionner un compte</option>
                    {comptes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    Sujet du deal *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Ex: Contrat de services"
                    className="w-full p-2.5 bg-[#f5f5f7] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ex: Paris"
                    className="w-full p-2.5 bg-[#f5f5f7] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    Prochaine action (Next Step)
                  </label>
                  <input
                    type="text"
                    name="next_action"
                    placeholder="Ex: Envoyer la proposition"
                    className="w-full p-2.5 bg-[#f5f5f7] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                    Statut actuel
                  </label>
                  <select
                    name="status"
                    className="w-full p-2.5 bg-[#f5f5f7] border border-transparent rounded-lg focus:outline-none focus:bg-white focus:border-[#0071e3] text-[13px] apple-transition"
                  >
                    <option value="todo">À faire</option>
                    <option value="waiting">En attente</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0071e3] text-white py-2.5 rounded-lg font-medium hover:bg-[#0077ed] transition-colors cursor-pointer text-[13px] shadow-sm pt-3"
                >
                  Ajouter le deal
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}