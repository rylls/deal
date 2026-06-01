"use client";

import { useState } from "react";
// IMPORT CORRIGÉ ICI 👇
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
      <header className="h-16 flex items-center justify-end px-8 w-full absolute top-0 right-0 z-20 pointer-events-none">
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-[#007AFF] text-white w-7 h-7 rounded-full flex items-center justify-center text-xl font-light hover:bg-[#0071E3] transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            +
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-30">
              <button
                onClick={() => {
                  setModalType("compte");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Créer un compte
              </button>
              <button
                onClick={() => {
                  setModalType("deal");
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Créer un deal
              </button>
            </div>
          )}
        </div>
      </header>

      {modalType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 pointer-events-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-zinc-200">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold text-zinc-900">
                {modalType === "compte" ? "Nouveau Compte" : "Nouveau Deal"}
              </h3>
              <button
                onClick={() => {
                  setModalType(null);
                  setError(null);
                }}
                className="text-zinc-400 hover:text-zinc-600 text-sm cursor-pointer"
              >
                Fermer
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {modalType === "compte" ? (
              <form onSubmit={handleCreateCompte} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Nom du compte
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ex: Acme Corp"
                    className="w-full p-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#007AFF] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#007AFF] text-white p-2 rounded-lg font-medium hover:bg-[#0071E3] transition-colors cursor-pointer text-sm"
                >
                  Créer le compte
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateDeal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Rattacher à un compte *
                  </label>
                  <select
                    name="compte_id"
                    required
                    className="w-full p-2 border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-[#007AFF] text-sm"
                  >
                    <option value="">-- Choisir un compte --</option>
                    {comptes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Sujet du deal *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Ex: Refonte du site internet"
                    className="w-full p-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#007AFF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ex: Lyon"
                    className="w-full p-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#007AFF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Prochaine étape (Next Step)
                  </label>
                  <input
                    type="text"
                    name="next_action"
                    placeholder="Ex: Appeler le client mardi"
                    className="w-full p-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#007AFF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Statut
                  </label>
                  <select
                    name="status"
                    className="w-full p-2 border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-[#007AFF] text-sm"
                  >
                    <option value="todo">À faire</option>
                    <option value="waiting">En attente</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#007AFF] text-white p-2 rounded-lg font-medium hover:bg-[#0071E3] transition-colors cursor-pointer text-sm"
                >
                  Créer le deal
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}