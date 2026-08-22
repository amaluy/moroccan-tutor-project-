'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smile, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TitreAnnoncePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matieres = searchParams.get('matieres');

  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compter le nombre de mots (abaissé temporairement à 3 pour tester facilement)
  const wordCount = title.trim() === '' ? 0 : title.trim().split(/\s+/).length;
  const isMinReached = wordCount >= 3; 

  const handleSaveToSupabase = async () => {
    if (!isMinReached) return;
    setIsLoading(true);

    try {
      console.log("Tentative de redirection vers /donner-cours/description...");
      router.push('/donner-cours/description');
    } catch (err) {
      console.error("Erreur de redirection :", err);
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
              Votre titre est la clef de voûte de votre annonce ! Bichonnez-le, il doit être unique, accrocheur et contenir au moins <strong className="text-gray-900">3 mots</strong> (test) :
            </p>
            <ul className="space-y-1.5 pl-2 text-gray-500">
              <li>• Les matières que vous enseignez</li>
              <li>• Diplôme, méthode, etc.</li>
              <li>• Vos spécificités et tout ce qui vous démarque</li>
            </ul>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <ThumbsUp className="w-4 h-4 shrink-0" />
                <span>Ce qui fonctionne</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">
                "Étudiant en école d'ingénieur donne cours de maths et physique du collège au lycée à Casablanca."
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <ThumbsDown className="w-4 h-4 shrink-0" />
                <span>Ce qui ne fonctionne pas</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">
                "Donne cours de chant et guitare pour 40 MAD/h"
              </p>
            </div>
          </div>
        </div>

        {/* Colonne de droite : Saisie du titre */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          
          <div className="flex items-end justify-between flex-wrap gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              <span className="text-[#FF5A5F]">Titre</span> de votre annonce
            </h1>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              {wordCount} / 3 mots minimum
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <textarea 
              rows={5}
              placeholder="Ex : Diplômé de l'université et professeur expérimenté enseigne les mathématiques pour tous niveaux."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 transition shadow-xs resize-none"
            />
            {!isMinReached && title.length > 0 && (
              <p className="text-xs text-rose-500 font-semibold">
                Il vous manque encore {3 - wordCount} mot{(3 - wordCount) > 1 ? 's' : ''} pour activer le bouton.
              </p>
            )}
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
              disabled={!isMinReached || isLoading}
              onClick={handleSaveToSupabase}
              className={`flex-1 py-4 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                isMinReached 
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