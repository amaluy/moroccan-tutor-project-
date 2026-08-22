'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, BookOpen } from 'lucide-react';

interface SearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onViewAllSubjects: () => void;
}

export default function SearchSection({ searchTerm, setSearchTerm, onSearch, onViewAllSubjects }: SearchSectionProps) {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'professeur' | 'eleve'>('professeur');
  const [locationTerm, setLocationTerm] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'professeur') {
      router.push(`/professeurs?matiere=${encodeURIComponent(searchTerm)}&ville=${encodeURIComponent(locationTerm)}`);
    } else {
      router.push(`/eleves?matiere=${encodeURIComponent(searchTerm)}&ville=${encodeURIComponent(locationTerm)}`);
    }
  };

  return (
    <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto py-6">
      
      {/* Titre avec grammaire correcte : "Trouvez l'élève parfait" ou "Trouvez le professeur parfait" */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-8">
        Trouvez {searchType === 'professeur' ? 'le professeur' : "l'élève"} parfait
      </h1>

      {/* --- SÉLECTEUR PROPRE ET AGRANDI --- */}
      <div className="w-full max-w-md mb-6 flex items-center justify-center gap-4 bg-gray-100/80 p-2 rounded-3xl border border-gray-200/60 shadow-inner">
        <span className="text-sm font-bold text-gray-600 pl-2">Je cherche un :</span>
        <div className="flex gap-2 flex-1">
          <button
            type="button"
            onClick={() => setSearchType('professeur')}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-extrabold transition-all duration-200 cursor-pointer ${
              searchType === 'professeur'
                ? 'bg-white text-gray-900 shadow-md shadow-gray-200 scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Professeur
          </button>
          <button
            type="button"
            onClick={() => setSearchType('eleve')}
            className={`flex-1 py-3 px-4 rounded-2xl text-sm font-extrabold transition-all duration-200 cursor-pointer ${
              searchType === 'eleve'
                ? 'bg-white text-gray-900 shadow-md shadow-gray-200 scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Élève
          </button>
        </div>
      </div>

      {/* Barre de recherche unique et épurée */}
      <form 
        onSubmit={handleFormSubmit}
        className="w-full bg-white border border-gray-200/80 p-2.5 rounded-[2.5rem] shadow-xl shadow-gray-200/50 flex flex-col md:flex-row items-center gap-2"
      >
        <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full md:border-r border-gray-100">
          <BookOpen className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchType === 'professeur' ? "Ex: Maths, Anglais, Physique..." : "Ex: Soutien scolaire demandé..."}
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="flex-1 flex items-center gap-3 px-4 py-3 w-full">
          <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={locationTerm}
            onChange={(e) => setLocationTerm(e.target.value)}
            placeholder="Casablanca, Rabat, En ligne..."
            className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-8 py-4 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold text-sm rounded-[2rem] transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Rechercher</span>
        </button>
      </form>

    </div>
  );
}