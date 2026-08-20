'use client';

import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { subjectsData } from '../data/subjectsData';

interface SearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onViewAllSubjects: () => void;
}

export default function SearchSection({
  searchTerm,
  setSearchTerm,
  onSearch,
  onViewAllSubjects,
}: SearchSectionProps) {
  return (
    <div className="w-full flex flex-col items-center space-y-10">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
        Trouvez le<br />professeur parfait
      </h1>

      {/* Formulaire de recherche */}
      <form
        onSubmit={onSearch}
        className="w-full max-w-2xl bg-white p-2.5 rounded-full shadow-lg border border-gray-200/80 flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-3 pl-4 flex-1">
          <BookOpen className="w-5 h-5 text-[#FF5A5F] shrink-0" />
          <input
            type="text"
            placeholder="apprendre l'anglais"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
          />
        </div>
        <button
          type="submit"
          className="bg-[#FF5A5F] hover:bg-[#E0484C] text-white px-6 py-3 rounded-full font-bold text-sm sm:text-base transition shadow-md shrink-0"
        >
          Rechercher
        </button>
      </form>

      {/* Grille des matières & bouton */}
      <div className="w-full flex flex-col items-center space-y-8 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 w-full">
          {subjectsData.map((subject) => {
            const IconComponent = subject.icon;
            const isSelected =
              searchTerm.toLowerCase() === subject.name.toLowerCase();

            return (
              <button
                key={subject.name}
                type="button"
                onClick={() => setSearchTerm(subject.name)}
                className={`bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border transition-all duration-200 group cursor-pointer ${
                  isSelected
                    ? 'border-[#FF5A5F] shadow-md ring-2 ring-[#FF5A5F]/20'
                    : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5'
                }`}
              >
                <div className="text-[#FF5A5F] transition-transform duration-200 group-hover:scale-110">
                  <IconComponent className="w-7 h-7 stroke-[1.8]" />
                </div>
                <span className="text-xs font-bold text-gray-800 text-center leading-tight">
                  {subject.name}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onViewAllSubjects}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-2xl transition shadow-md group cursor-pointer text-sm sm:text-base"
        >
          <span>Voir toutes les matières</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}