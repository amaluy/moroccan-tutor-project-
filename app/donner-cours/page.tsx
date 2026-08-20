'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smile, Search, ChevronRight, Check, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DonnerCoursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Récupération de la matière principale si elle est passée dans l'URL
  const mainSubjectFromUrl = searchParams.get('matiere');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    mainSubjectFromUrl ? [mainSubjectFromUrl] : []
  );

  // Les 8 vraies matières de la plateforme
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

  // Compétences / modules additionnels suggérés pour l'étape 2 (quand la matière principale est choisie)
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

  // Filtrage pour la recherche de la 1ère page
  const filteredSubjects = allSubjects.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectMainSubject = (subjectName: string) => {
    setSelectedSubjects([subjectName]);
  };

  const handleToggleModule = (mod: string) => {
    if (selectedSubjects.includes(mod)) {
      // On ne peut pas retirer la toute première matière principale sélectionnée par simple clic ici si on veut, ou alors on gère
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
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white">
      
      {/* Header minimaliste */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-[#FF5A5F] tracking-tight">
          profmaroc
        </Link>
        <span className="text-xs font-semibold text-gray-400">Étape 1 sur 3</span>
      </header>

      {/* Contenu principal double colonne */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-start my-auto">
        
        {/* Colonne de gauche : Bloc "À savoir" dynamique selon l'étape */}
        <div className="lg:col-span-5 bg-[#FFF2F2] border border-[#FFE4E4] p-8 rounded-[2rem] shadow-xs space-y-5 sticky top-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FF5A5F] shadow-xs">
            <Smile className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">À savoir</h2>
          
          <div className="space-y-3 text-sm text-gray-600 font-medium leading-relaxed">
            {isMainStep ? (
              <p>
                ProfMaroc vous propose d'enseigner et de partager vos connaissances dans nos disciplines clés. Utilisez le moteur de recherche pour sélectionner votre matière principale et laissez-vous guider pour que l'aventure commence ;)
              </p>
            ) : (
              <p>
                Vous pouvez ajouter <strong className="text-gray-900">{5 - selectedSubjects.length} matière{5 - selectedSubjects.length > 1 ? 's' : ''} supplémentaire{5 - selectedSubjects.length > 1 ? 's' : ''}</strong> à votre annonce. Choisissez des matières que vous enseignez simultanément.
              </p>
            )}
          </div>
        </div>

        {/* Colonne de droite : Sélection des matières ou compétences */}
        <div className="lg:col-span-7 space-y-6">
          
          {isMainStep ? (
            // --- ÉTAPE 1 : CHOIX DE LA MATIÈRE PRINCIPALE ---
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Quelles <span className="text-[#FF5A5F]">matières</span> enseignez-vous ?
              </h1>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder='Essayer "Maths"...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200/90 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] shadow-xs transition"
                />
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Matières les plus enseignées
                </span>
              </div>

              {/* Liste des 8 matières */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((sub, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSelectMainSubject(sub)}
                      className="bg-[#FAFAFA] hover:bg-gray-50 border border-gray-200/80 p-4.5 rounded-2xl flex items-center justify-between cursor-pointer transition group shadow-xs"
                    >
                      <span className="font-bold text-gray-800 text-base group-hover:text-[#FF5A5F] transition">
                        {sub}
                      </span>
                      <div className="text-gray-400 group-hover:text-[#FF5A5F] transition">
                        <ChevronRight className="w-5 h-5" />
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
            // --- ÉTAPE 2 : AJOUT DES COMPATIBILITÉS / MAX 5 ---
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Vous enseignez <span className="text-[#FF5A5F]">les {selectedSubjects[0]}</span>
              </h1>

              {/* Matières déjà sélectionnées en haut (en rouge) */}
              <div className="space-y-3 pt-2">
                {selectedSubjects.map((sub, index) => (
                  <div 
                    key={index}
                    onClick={() => handleToggleModule(sub)}
                    className="bg-[#FF6B6B] text-white p-4.5 rounded-2xl flex items-center justify-between cursor-pointer shadow-sm transition"
                  >
                    <span className="font-bold text-base">{sub}</span>
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Section compétences associées */}
              <div className="space-y-3 pt-4">
                <h2 className="text-lg font-extrabold text-gray-900">
                  Ajoutez des compétences associées
                </h2>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  (optionnel)
                </p>

                <div className="space-y-3">
                  {additionalModules
                    .filter((mod) => !selectedSubjects.includes(mod))
                    .map((mod, index) => {
                      const disabled = isMaxReached;
                      return (
                        <div 
                          key={index}
                          onClick={() => !disabled && handleToggleModule(mod)}
                          className={`p-4.5 rounded-2xl flex items-center justify-between transition border ${
                            disabled 
                              ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed' 
                              : 'bg-[#FAFAFA] hover:bg-gray-50 border-gray-200/80 cursor-pointer group'
                          }`}
                        >
                          <span className={`font-bold text-sm ${disabled ? 'text-gray-400' : 'text-gray-800 group-hover:text-[#FF5A5F]'}`}>
                            {mod}
                          </span>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                            disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-[#FF5A5F]'
                          }`}>
                            <Plus className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Boutons de navigation */}
              <div className="pt-6 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedSubjects([])}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-2xl transition cursor-pointer"
                >
                  Retour
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 bg-[#FF6B6B] hover:bg-[#fa5252] text-white font-bold text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
      <footer className="w-full py-6 text-center text-xs text-gray-400 font-medium">
        © 2026 ProfMaroc — Tous droits réservés.
      </footer>
    </main>
  );
}