'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, CheckCircle2, ArrowRight, Building2, User, Hash, CreditCard, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PagePaiementProf() {
  const router = useRouter();
  const [methode, setMethode] = useState<'cash' | 'carte'>('cash');
  const [modeEspeces, setModeEspeces] = useState<'cashplus' | 'wafacash'>('cashplus');
  const [modeCarte, setModeCarte] = useState<'rib' | 'telephone'>('rib');

  const [codeTransfert, setCodeTransfert] = useState('');
  const [nomExpediteur, setNomExpediteur] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Données provisoires récupérées du localStorage sous 'pending_prof_data'
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const savedData = localStorage.getItem('pending_prof_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        // Pré-remplir automatiquement le nom de l'expéditeur
        const fullName = `${parsed.Prénom || parsed.prenom || ''} ${parsed.Nom || parsed.nom || ''}`.trim();
        if (fullName) {
          setNomExpediteur(fullName);
        }
      } catch (err) {
        console.error("Erreur lors du parsing du localStorage :", err);
      }
    }
  }, []);

  const mesCoordonnees = {
    nomComplet: "Amal Berrada", 
    telephone: "0600000000",        
    rib: "0123 4567 8901 2345 6789 0123", 
    ville: "Casablanca"
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const isValid = codeTransfert.trim().length >= 4 && nomExpediteur.trim().length > 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    try {
      // 1. Récupération immédiate et directe depuis le localStorage au moment du clic
      const rawStorageData = localStorage.getItem('pending_prof_data');
      const dataFromStorage = rawStorageData ? JSON.parse(rawStorageData) : {};

      console.log("Données récupérées pour l'envoi :", dataFromStorage);

      // 2. Construction exhaustive du payload correspondant à toutes les colonnes de Supabase
      const payload = {
        Nom: dataFromStorage.Nom || dataFromStorage.nom || nomExpediteur,
        Prénom: dataFromStorage.Prénom || dataFromStorage.prenom || '',
        age: dataFromStorage.age !== undefined && dataFromStorage.age !== '' ? Number(dataFromStorage.age) : null,
        ville: dataFromStorage.ville || dataFromStorage.Ville || '',
        profession: dataFromStorage.profession || '',
        matiere: dataFromStorage.matiere || dataFromStorage.Matiere || '',
        niveau: dataFromStorage.niveau || dataFromStorage.Niveau || [], // <--- Ajouté ici pour récupérer les choix de niveaux
        'dernier diplome': dataFromStorage['dernier diplome'] || dataFromStorage.dernierDiplome || dataFromStorage.diplome || '',
        experience: dataFromStorage.experience || '',
        statut: dataFromStorage.statut || '',
        type_cours: dataFromStorage.type_cours || [],
        tarif: dataFromStorage.tarif !== undefined ? Number(dataFromStorage.tarif) : 10,
        distance_max: dataFromStorage.distance_max || '0',
        frais_deplacement: dataFromStorage.frais_deplacement || '0',
        disponibilites: dataFromStorage.disponibilites || [],
        email: dataFromStorage.email || dataFromStorage.Email || '',
        telephone: dataFromStorage.telephone ? String(dataFromStorage.telephone) : null,
        'numero de transaction': methode === 'carte' ? codeTransfert : null,
        'numero de recu': methode === 'cash' ? codeTransfert : null,
        'date de demande': new Date().toISOString(),
        photo_URL: dataFromStorage.photo_URL || dataFromStorage.photoUrl || dataFromStorage.photo || ''
      };

      console.log("Payload final envoyé à Supabase :", payload);

      const { error } = await supabase.from('requests').insert([payload]);

      if (error) {
        console.error("Erreur Supabase détaillée :", error);
        alert("Erreur lors de l'enregistrement : " + error.message);
        setLoading(false);
        return;
      }

      // Nettoyage du localStorage après succès
      localStorage.removeItem('pending_prof_data');
      setIsSubmitted(true);
    } catch (err) {
      console.error("Erreur inattendue :", err);
      setLoading(false);
    }
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
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center"><span className="text-gray-500">Nom :</span><span className="font-bold">{mesCoordonnees.nomComplet}</span></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Téléphone :</span>
                      <button 
                        type="button"
                        onClick={() => handleCopy(`+212 ${mesCoordonnees.telephone}`, 'tel-cash')}
                        className="flex items-center gap-1.5 font-bold text-gray-900 hover:text-[#FF5A5F] transition cursor-pointer"
                        title="Cliquer pour copier"
                      >
                        <span>+212 {mesCoordonnees.telephone}</span>
                        {copiedField === 'tel-cash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex justify-between items-center"><span className="text-gray-500">Ville :</span><span className="font-bold">{mesCoordonnees.ville}</span></div>
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
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Notre RIB :</span>
                          {copiedField === 'rib' && <span className="text-emerald-600 font-bold text-[10px]">Copié !</span>}
                        </div>
                        <div 
                          onClick={() => handleCopy(mesCoordonnees.rib, 'rib')}
                          className="font-mono font-bold text-gray-900 bg-gray-50 p-2.5 rounded border flex items-center justify-between cursor-pointer hover:bg-gray-100 transition group"
                          title="Cliquer pour copier le RIB"
                        >
                          <span>{mesCoordonnees.rib}</span>
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Numéro de compte (App Mobile) :</span>
                        <button 
                          type="button"
                          onClick={() => handleCopy(`+212 ${mesCoordonnees.telephone}`, 'tel-mobile')}
                          className="flex items-center gap-1.5 font-bold text-gray-900 hover:text-[#FF5A5F] transition cursor-pointer"
                          title="Cliquer pour copier"
                        >
                          <span>+212 {mesCoordonnees.telephone}</span>
                          {copiedField === 'tel-mobile' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                        </button>
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
                      placeholder={methode === 'cash' ? "Ex : 123456789" : "Ex : 98765432"}
                      value={codeTransfert}
                      onChange={(e) => setCodeTransfert(e.target.value)}
                      className="w-full p-3.5 text-sm font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full py-4 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isValid && !loading
                    ? 'bg-[#FF5A5F] hover:bg-[#E0484C] text-white shadow-red-500/20' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>{loading ? "Enregistrement en cours..." : "Soumettre ma preuve de paiement"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
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

      <footer className="w-full py-5 text-center text-xs text-gray-400 font-medium border-t border-gray-100">
        © 2026 ProfMaroc — Tous droits réservés.
      </footer>
    </main>
  );
}