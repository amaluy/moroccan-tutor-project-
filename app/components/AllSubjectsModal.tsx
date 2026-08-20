'use client';

import React from 'react';
import { X, BookOpen, MapPin, Users } from 'lucide-react';
import { Professor } from '@/types/professor';

interface AllSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  professors: Professor[];
  onSelectSubject: (subjectName: string) => void;
}

export default function AllSubjectsModal({
  isOpen,
  onClose,
  professors,
  onSelectSubject,
}: AllSubjectsModalProps) {
  if (!isOpen) return null;

  // 1. Calculer dynamiquement le nombre de profs et les villes pour chaque matière
  const subjectsStats = professors.reduce((acc, prof) => {
    // Adapte 'subject' et 'city' selon les noms de colonnes réels dans ta base Supabase
    const subject = prof.subject || 'Autre';
    const city = prof.city || 'Maroc';

    if (!acc[subject]) {
      acc[subject] = { count: 0, cities: new Set<string>() };
    }
    acc[subject].count += 1;
    acc[subject].cities.add(city);
    return acc;
  }, {} as Record<string, { count: number; cities: Set<string> }>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header de la modale */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#FF5A5F] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900">
              Toutes les matières disponibles
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liste des matières */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {Object.keys(subjectsStats).length === 0 ? (
            <p className="text-center text-gray-500 py-8 font-medium">Chargement des matières...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(subjectsStats).map(([subjectName, data]) => (
                <div 
                  key={subjectName}
                  onClick={() => {
                    onSelectSubject(subjectName);
                    onClose();
                  }}
                  className="bg-gray-50 hover:bg-red-50/50 border border-gray-200/60 hover:border-[#FF5A5F]/40 p-5 rounded-2xl transition cursor-pointer flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-base group-hover:text-[#FF5A5F] transition">
                      {subjectName}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                      <Users className="w-3.5 h-3.5 text-[#FF5A5F]" />
                      {data.count} {data.count > 1 ? 'professeurs' : 'professeur'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">
                      Villes : {Array.from(data.cities).join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer de la modale */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
          Cliquez sur une matière pour filtrer instantanément les professeurs correspondants.
        </div>
      </div>
    </div>
  );
}