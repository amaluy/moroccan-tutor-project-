'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, CheckCircle2, ArrowRight, Building2, User, Hash, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PagePaiementProf() {
  const router = useRouter();
  const [methode, setMethode] = useState<'cash' | 'carte'>('cash');
  const [modeEspeces, setModeEspeces] = useState<'cashplus' | 'wafacash'>('cashplus');
  const [modeCarte, setModeCarte] = useState<'rib' | 'telephone'>('rib');

  const [codeTransfert, setCodeTransfert] = useState('');
  const [nomExpediteur, setNomExpediteur] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Tes informations personnelles pour recevoir les paiements des 10 DH
  const mesCoordonnees = {
    nomComplet: "Votre Nom Prénom", // Remplace par ton vrai nom (ex: Youssef El Amrani)
    telephone: "0600000000",       // Ton numéro pour CashPlus, WafaCash ou virement par téléphone
    rib: "0123 4567 8901 2345 6789 0123", // Ton RIB bancaire (ex: CIH Bank ou autre)
    ville: "Casablanca"
  };

  const isValid = codeTransfert.trim().length >= 4 && nomExpediteur.trim().length > 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // Simulation d'enregistrement de la preuve de paiement dans ta base de données
    console.log("Validation de paiement enregistrée :", {
      methode: methode === 'cash' ? modeEspeces : `virement-${modeCarte}`,
      reference: codeTransfert,
      expediteur: nomExpediteur
    });

    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#FCFCFD] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white relative overflow-hidden">
      
      {/* Élément décoratif d'arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-red-50/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            prof<span className="text-[#FF5A5F]">maroc</span>
          </span>
        </Link>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 max-w-lg mx-auto px-6 py-8 w-full my-auto space-y-6">
        
        {!isSubmitted ? (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-50 text-[#FF5A5F] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Wallet className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Activation de votre profil
              </h1>
              <p className="text-sm text-gray-500">
                Frais d'activation uniques pour publier votre profil : <span className="font-bold text-gray-900">10 DH</span>
              </p>
            </div>

            {/* Choix principal : Espèces vs Virement/Carte */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethode('cash')}
                className={`p-3.5 rounded-2xl border text-center transition cursor-pointer font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${
                  methode === 'cash'
                    ? 'bg-white border-[#FF5A5F] text-[#FF5A5F] shadow-sm ring-2 ring-red-500/10'
                    : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                CashPlus / WafaCash
              </button>
              <button
                type="button"
                onClick={() => setMethode('carte')}
                className={`p-3.5 rounded-2xl border text-center transition cursor-pointer font-bold text-xs sm:text-sm flex items-center justify-center gap-2 ${
                  methode === 'carte'
                    ? 'bg-white border-[#FF5A5F] text-[#FF5A5F] shadow-sm ring-2 ring-red-500/10'
                    : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Virement / App Mobile
              </button>
            </div>

            {/* SECTION 1 : ESPÈCES (CashPlus / WafaCash) */}
            {methode === 'cash' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModeEspeces('cashplus')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      modeEspeces === 'cashplus' ? 'bg-red-50 border-[#FF5A5F] text-[#FF5A5F]' : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    CashPlus
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeEspeces('wafacash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      modeEspeces === 'wafacash' ? 'bg-red-50 border-[#FF5A5F] text-[#FF5A5F]' : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    WafaCash
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
                    1. Envoyez 10 DH en agence {modeEspeces} à :
                  </h2>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-gray-500">Nom :</span><span className="font-bold">{mesCoordonnees.nomComplet}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Téléphone :</span><span className="font-bold">+212 {mesCoordonnees.telephone}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Ville :</span><span className="font-bold">{mesCoordonnees.ville}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2 : CARTE BANCAIRE / VIREMENT */}
            {methode === 'carte' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModeCarte('rib')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      modeCarte === 'rib' ? 'bg-red-50 border-[#FF5A5F] text-[#FF5A5F]' : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    Par RIB Bancaire
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeCarte('telephone')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      modeCarte === 'telephone' ? 'bg-red-50 border-[#FF5A5F] text-[#FF5A5F]' : 'bg-white border-gray-200 text-gray-500'
                    }`}
                  >
                    Par App Mobile (Téléphone)
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-gray-500">
                    1. Effectuez un virement de 10 DH :
                  </h2>
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 space-y-1.5 text-xs">
                    {modeCarte === 'rib' ? (
                      <div className="space-y-1">
                        <span className="text-gray-500">Votre RIB :</span>
                        <p className="font-mono font-bold text-gray-900 bg-gray-50 p-2 rounded border">{mesCoordonnees.rib}</p>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Numéro de compte (App Mobile) :</span>
                        <span className="font-bold">+212 {mesCoordonnees.telephone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire de validation de la preuve */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-100">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#FF5A5F]" />
                2. Confirmez votre paiement
              </h2>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Votre Nom et Prénom</label>
                  <div className="flex items-center rounded-xl bg-white border border-gray-200 focus-within:border-[#FF5A5F] overflow-hidden shadow-sm">
                    <span className="px-3.5 text-gray-400"><User className="w-4 h-4" /></span>
                    <input 
                      type="text"
                      placeholder="Ex : Youssef El Amrani"
                      value={nomExpediteur}
                      onChange={(e) => setNomExpediteur(e.target.value)}
                      className="w-full p-3.5 text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">
                    {methode === 'cash' ? "Code de transfert / Numéro de reçu" : "Référence du virement / Numéro de transaction"}
                  </label>
                  <div className="flex items-center rounded-xl bg-white border border-gray-200 focus-within:border-[#FF5A5F] overflow-hidden shadow-sm">
                    <span className="px-3.5 text-gray-400"><Hash className="w-4 h-4" /></span>
                    <input 
                      type="text"
                      placeholder={methode === 'cash' ? "Ex : 123456789" : "Ex : REF98765432"}
                      value={codeTransfert}
                      onChange={(e) => setCodeTransfert(e.target.value)}
                      className="w-full p-3.5 text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-4 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isValid 
                    ? 'bg-[#FF5A5F] hover:bg-[#E0484C] text-white shadow-red-500/20' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Soumettre ma preuve de paiement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Écran de succès après validation */
          <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Demande enregistrée !</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nous allons vérifier votre paiement de 10 DH. Votre profil sera validé et publié très rapidement sur ProfMaroc.
            </p>
            <div className="pt-4">
              <Link 
                href="/"
                className="inline-block w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full py-5 text-center text-xs text-gray-400 font-medium border-t border-gray-100">
        © 2026 ProfMaroc — Tous droits réservés.
      </footer>
    </main>
  );
}