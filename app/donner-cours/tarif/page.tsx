'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smile, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function TarifHorairePage() {
  const router = useRouter();
  
  const [prenom, setPrenom] = useState('Professeur');
  const [tarif, setTarif] = useState('230');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPrenom = localStorage.getItem('prof_prenom');
    if (savedPrenom) setPrenom(savedPrenom);
  }, []);

  const isValid = Number(tarif) > 0;

  const handleFinish = async () => {
    if (!isValid) return;
    setIsLoading(true);

    try {
      // Sauvegarde du tarif horaire
      localStorage.setItem('prof_tarif', tarif);

      // Ici, tu peux rediriger vers une page de succès, un tableau de bord ou la fin du tunnel
      router.push('/donner-cours/succes'); // Ou une autre page de ton choix
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

          <div className="space-y-4 text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
            <p>
              Vous êtes libre de choisir votre tarif horaire et de le modifier à tout moment, {prenom}.
            </p>
            <p>
              Si vous débutez, ne choisissez peut-être pas un tarif trop élevé et attendez d'avoir des avis et recommandations pour l'ajuster.
            </p>
          </div>
        </div>

        {/* Colonne de droite : Input Tarif */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              <span className="text-[#FF5A5F]">Tarif</span> horaire
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium pt-1">
              Info : Le tarif moyen pour des cours de soutien scolaire est de <strong className="text-gray-900">230 MAD</strong>
            </p>
          </div>

          <div className="relative pt-2">
            <div className="relative flex items-center">
              <input 
                type="number"
                value={tarif}
                onChange={(e) => setTarif(e.target.value)}
                placeholder="230"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg font-bold text-gray-900 focus:outline-none focus:bg-white focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 transition shadow-xs pr-20"
              />
              <span className="absolute right-5 text-sm font-black text-gray-400 select-none">
                MAD/h
              </span>
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
              disabled={!isValid || isLoading}
              onClick={handleFinish}
              className={`flex-1 py-4 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isValid 
                  ? 'bg-[#FF5A5F] hover:bg-[#E0484C] text-white shadow-red-500/20' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{isLoading ? 'Enregistrement...' : 'Terminer'}</span>
              <Check className="w-4 h-4" />
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