'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Smile, Coffee, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AProposDuCoursPage() {
  const router = useRouter();
  
  const [prenom, setPrenom] = useState('Professeur');

  useEffect(() => {
    const savedPrenom = localStorage.getItem('prof_prenom');
    if (savedPrenom) setPrenom(savedPrenom);
  }, []);

  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compter le nombre de mots (minimum 40)
  const wordCount = description.trim() === '' ? 0 : description.trim().split(/\s+/).length;
  const isMinReached = wordCount >= 40;

  const handleSaveAndContinue = async () => {
    if (!isMinReached) return;
    setIsLoading(true);

    try {
      localStorage.setItem('prof_description', description);
      
      // Redirection explicite vers la page lieu
      router.push('/donner-cours/lieu');
    } catch (err) {
      console.error("Erreur lors de la navigation :", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCFD] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-red-50/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            prof<span className="text-[#FF5A5F]">maroc</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start my-auto">
        
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
              Expliquez votre démarche en tant que professeur particulier et de quelle façon vous partagez votre savoir :
            </p>
            <ul className="space-y-1.5 pl-2 text-gray-500">
              <li>• Vos techniques et méthodes d'enseignement</li>
              <li>• Déroulement type d'un cours</li>
              <li>• Vos spécificités en tant que professeur</li>
              <li>• À qui s'adressent les cours (diplôme, niveau, classe, spécificités, etc.)</li>
            </ul>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-gray-900 font-black text-xs uppercase tracking-wider">
                <Coffee className="w-4 h-4 text-[#FF5A5F] shrink-0" />
                <span>N'OUBLIEZ PAS {prenom.toUpperCase()}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Vos coordonnées ou URLs ne doivent pas apparaître dans vos textes. À vous de jouer ;)
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          
          <div className="flex items-end justify-between flex-wrap gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              A propos du <span className="text-[#FF5A5F]">cours</span>
            </h1>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
              {wordCount} / 40 mots minimum
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <textarea 
              rows={8}
              placeholder="C'est le moment de convaincre vos futurs élèves que votre méthode sera différente !"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 transition shadow-xs resize-none"
            />
            {!isMinReached && description.length > 0 && (
              <p className="text-xs text-rose-500 font-semibold">
                Il vous manque encore {40 - wordCount} mot{(40 - wordCount) > 1 ? 's' : ''} pour atteindre le minimum requis.
              </p>
            )}
          </div>

          <div className="pt-6 flex items-center gap-4 border-t border-gray-100">
            <button
              onClick={() => router.back()}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl transition cursor-pointer"
            >
              Retour
            </button>
            <button
              disabled={!isMinReached || isLoading}
              onClick={handleSaveAndContinue}
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