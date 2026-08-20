'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smile, Search, ChevronRight, Check, Plus, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';

export default function DonnerCoursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const mainSubjectFromUrl = searchParams.get('matiere');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    mainSubjectFromUrl ? [mainSubjectFromUrl] : []
  );

  const allSubjects = [
    'Maths',
    'Anglais',
    'Français',
    'Arabe',
    'Soutien scolaire',
    'SVT',
    'Physique',
    'Physique - Chimie',
  ];

  const additionalModules = [
    'Statistiques',
    'Physique',
    'Chimie',
    'Préparation concours',
    'Autres sciences',
    'Chimie organique',
    'Logique mathématique',
    'Trigonométrie',
    'Géométrie',
    'Arithmétique',
  ];

  const isMainStep = selectedSubjects.length === 0;
  const isMaxReached = selectedSubjects.length >= 5;

  const filteredSubjects = allSubjects.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMainSubject = (subjectName: string) => {
    setSelectedSubjects([subjectName]);
  };

  const handleToggleModule = (mod: string) => {
    if (selectedSubjects.includes(mod)) {
      if (selectedSubjects.length === 1) return; 
      setSelectedSubjects(selectedSubjects.filter((s) => s !== mod));
    } else {
      if (selectedSubjects.length < 5) {
        setSelectedSubjects([...selectedSubjects, mod]);
      }
    }
  };

  const handleNext = () => {
    router.push(`/donner-cours/etape-suivante?matieres=${encodeURIComponent(selectedSubjects.join(','))}`);
  };

  return (
    <main className="min-h-screen bg-[#FCFCFD] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white relative overflow-hidden">
      
      {/* Éléments de fond décoratifs pour donner du cachet unique */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-red-50/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header minimaliste */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            prof<span className="text-[#FF5A5F]">maroc</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-600">Étape 1 sur 3</span>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start my-auto">
        
        {/* Colonne de gauche : Bloc "À savoir" revisité et stylé */}
        <div className="lg:col-span-5 bg-white border border-red-100 p-8 rounded-[2.5rem] shadow-xl shadow-red-500/5 space-y-6 sticky top-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-orange-50 rounded-bl-full pointer-events-none -z-10" />
          
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#FF5A5F] shadow-sm">
            <Smile className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">À savoir</h2>
            <div className="h-1 w-10 bg-[#FF5A5F] rounded-full" />
          </div>

          <div className="space-y-3 text-sm text-gray-600 font-medium leading-relaxed">
            {isMainStep ? (
              <p>
                ProfMaroc vous connecte directement avec des élèves motivés. Utilisez la recherche pour choisir votre <strong className="text-gray-900">discipline principale</strong> et commencez à bâtir votre profil d'expert.
              </p>
            ) : (
              <div className="space-y-3">
                <p>
                  Vous pouvez ajouter jusqu'à <strong className="text-gray-900">4 matières supplémentaires</strong> pour élargir vos opportunités de cours.
                </p>
                <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-100 flex items-center gap-3">
                  <Layers className="w-5 h-5 text-[#FF5A5F] shrink-0" />
                  <span className="text-xs font-bold text-gray-800">
                    {selectedSubjects.length} / 5 matière{selectedSubjects.length > 1 ? 's' : ''} sélectionnée{selectedSubjects.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Colonne de droite : Sélection dynamique */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          
          {isMainStep ? (
            // --- ÉTAPE 1 : CHOIX DE LA MATIÈRE ---
            <>
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#FF5A5F] uppercase tracking-wider">Spécialité</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Quelles <span className="text-[#FF5A5F]">matières</span> enseignez-vous ?
                </h1>
              </div>

              {/* Barre de recherche moderne */}
              <div className="relative pt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder='Rechercher une matière (ex: Maths)...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4.5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 transition shadow-xs"
                />
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Matières principales
                </span>
              </div>

              {/* Liste des matières */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((sub, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectMainSubject(sub)}
                      className="bg-gray-50/70 hover:bg-white border border-gray-200/70 hover:border-[#FF5A5F]/50 p-4.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 group shadow-xs hover:shadow-md"
                    >
                      <span className="font-bold text-gray-800 text-base group-hover:text-[#FF5A5F] transition">
                        {sub}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-[#FF5A5F] text-gray-400 group-hover:text-white flex items-center justify-center transition shadow-xs">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8 text-sm font-medium">
                    Aucune matière trouvée pour "{searchTerm}".
                  </p>
                )}
              </div>
            </>
          ) : (
            // --- ÉTAPE 2 : COMPÉTENCES & MAX 5 ---
            <>
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#FF5A5F] uppercase tracking-wider">Sélection active</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Vous enseignez <span className="text-[#FF5A5F]">les {selectedSubjects[0]}</span>
                </h1>
              </div>

              {/* Matières choisies en haut */}
              <div className="space-y-3 pt-2">
                {selectedSubjects.map((sub, index) => (
                  <div 
                    key={index}
                    onClick={() => handleToggleModule(sub)}
                    className="bg-gradient-to-r from-[#FF5A5F] to-rose-500 text-white p-4.5 rounded-2xl flex items-center justify-between cursor-pointer shadow-md transition hover:opacity-95"
                  >
                    <span className="font-bold text-base">{sub}</span>
                    <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Compétences associées */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-gray-900">
                    Compétences associées
                  </h2>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    Optionnel
                  </span>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {additionalModules
                    .filter((mod) => !selectedSubjects.includes(mod))
                    .map((mod, index) => {
                      const disabled = isMaxReached;
                      return (
                        <div 
                          key={index}
                          onClick={() => !disabled && handleToggleModule(mod)}
                          className={`p-4 rounded-2xl flex items-center justify-between transition border ${
                            disabled 
                              ? 'bg-gray-50/50 border-gray-100 opacity-40 cursor-not-allowed' 
                              : 'bg-gray-50/70 hover:bg-white border-gray-200/70 hover:border-gray-300 cursor-pointer group shadow-xs'
                          }`}
                        >
                          <span className={`font-bold text-sm ${disabled ? 'text-gray-400' : 'text-gray-800 group-hover:text-[#FF5A5F]'}`}>
                            {mod}
                          </span>
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                            disabled ? 'text-gray-300' : 'bg-white text-gray-400 group-hover:text-[#FF5A5F] shadow-xs'
                          }`}>
                            <Plus className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Boutons de navigation */}
              <div className="pt-6 flex items-center gap-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedSubjects([])}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl transition cursor-pointer"
                >
                  Retour
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold text-sm rounded-xl transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

        </div>

      </div>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-gray-400 font-medium border-t border-gray-100">
        © 2026 ProfMaroc — Tous droits réservés.
      </footer>
    </main>
  );
}