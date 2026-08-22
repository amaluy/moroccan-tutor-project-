'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smile, MapPin, Home, Navigation, Video, Plus, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LieuDuCoursPage() {
  const router = useRouter();

  const [prenom, setPrenom] = useState('Professeur');

  useEffect(() => {
    const savedPrenom = localStorage.getItem('prof_prenom');
    if (savedPrenom) setPrenom(savedPrenom);
  }, []);

  const [address, setAddress] = useState('Casablanca, Maroc');
  const [lieux, setLieux] = useState({
    chezVous: false,
    deplacement: false,
    enLigne: true
  });

  const [isLoading, setIsLoading] = useState(false);

  const toggleLieu = (key: keyof typeof lieux) => {
    setLieux(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isSelectionValid = lieux.chezVous || lieux.deplacement || lieux.enLigne;

  const handleNext = async () => {
    if (!isSelectionValid) return;
    setIsLoading(true);

    try {
      // Sauvegarde des choix dans le localStorage
      localStorage.setItem('prof_lieu_cours', JSON.stringify({ address, lieux }));

      // Redirection vers la nouvelle page Tarif Horaire
      router.push('/donner-cours/tarif');
    } catch (err) {
      console.error("Erreur :", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCFD] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-red-50/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            prof<span className="text-[#FF5A5F]">maroc</span>
          </span>
        </Link>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start my-auto">
        
        {/* Colonne de gauche : Bloc "À savoir" */}
        <div className="lg:col-span-5 bg-white border border-red-100 p-8 rounded-[2.5rem] shadow-xl shadow-red-500/5 space-y-6 sticky top-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-orange-50 rounded-bl-full pointer-events-none -z-10" />
          
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#FF5A5F] shadow-sm">
            <Smile className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">À savoir</h2>
            <div className="h-1 w-10 bg-[#FF5A5F] rounded-full" />
          </div>

          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
            Votre adresse n'apparaîtra jamais sur le site, {prenom}. Elle sera communiquée uniquement aux élèves à qui vous acceptez de donner des cours.
          </p>

          <div className="space-y-4 pt-2 text-xs sm:text-sm text-gray-600 font-medium">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-[#FF5A5F] shrink-0 mt-0.5">
                <Home className="w-4 h-4" />
              </div>
              <p><strong className="text-gray-900">Chez vous :</strong> Proposez vos cours directement chez vous à l'adresse indiquée.</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-[#FF5A5F] shrink-0 mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <p><strong className="text-gray-900">Déplacement :</strong> Indiquez la distance maximale que vous souhaitez parcourir pour vous rendre chez votre élève.</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-[#FF5A5F] shrink-0 mt-0.5">
                <Video className="w-4 h-4" />
              </div>
              <p><strong className="text-gray-900">En ligne :</strong> Abolissez les frontières et dispensez vos leçons au monde entier par webcam.</p>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Sélection des lieux */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-[#FF5A5F]">Lieu</span> du cours
          </h1>

          {/* Input Adresse / Ville */}
          <div className="relative">
            <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Votre ville ou adresse..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#FF5A5F] transition"
            />
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-800">Où peuvent se dérouler vos cours ?</h3>

            {/* Option 1 : Chez vous */}
            <div 
              onClick={() => toggleLieu('chezVous')}
              className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                lieux.chezVous 
                  ? 'border-[#FF5A5F] bg-red-50/30 shadow-sm' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-[#FF5A5F]" />
                <span className="font-bold text-sm text-gray-900">Chez vous</span>
              </div>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${lieux.chezVous ? 'bg-[#FF5A5F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {lieux.chezVous ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </div>

            {/* Option 2 : Vous pouvez vous déplacer */}
            <div 
              onClick={() => toggleLieu('deplacement')}
              className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                lieux.deplacement 
                  ? 'border-[#FF5A5F] bg-red-50/30 shadow-sm' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-[#FF5A5F]" />
                <span className="font-bold text-sm text-gray-900">Vous pouvez vous déplacer</span>
              </div>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${lieux.deplacement ? 'bg-[#FF5A5F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {lieux.deplacement ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </div>

            {/* Option 3 : En ligne */}
            <div 
              onClick={() => toggleLieu('enLigne')}
              className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                lieux.enLigne 
                  ? 'border-[#FF5A5F] bg-red-50/30 shadow-sm' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-[#FF5A5F]" />
                <span className="font-bold text-sm text-gray-900">En ligne</span>
              </div>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${lieux.enLigne ? 'bg-[#FF5A5F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {lieux.enLigne ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </div>

          </div>

          {/* Boutons de navigation */}
          <div className="pt-6 flex items-center gap-4 border-t border-gray-100">
            <button
              onClick={() => router.back()}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl transition cursor-pointer"
            >
              Retour
            </button>
            <button
              disabled={!isSelectionValid || isLoading}
              onClick={handleNext}
              className={`flex-1 py-4 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isSelectionValid 
                  ? 'bg-[#FF5A5F] hover:bg-[#E0484C] text-white shadow-red-500/20' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{isLoading ? 'Enregistrement...' : 'Suivant'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      <footer className="w-full py-6 text-center text-xs text-gray-400 font-medium border-t border-gray-100">
        © 2026 ProfMaroc — Tous droits réservés.
      </footer>
    </main>
  );
}