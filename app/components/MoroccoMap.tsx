'use client';

import { useState, useEffect } from 'react';
import { MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface CityPromo {
  name: string;
  count: string;
  tagline: string;
}

const CITIES_PROMO: CityPromo[] = [
  { name: 'Casablanca', count: '150+ profs', tagline: 'Le plus grand réseau de la métropole' },
  { name: 'Rabat', count: '90+ profs', tagline: 'Excellence académique et universitaire' },
  { name: 'Marrakech', count: '70+ profs', tagline: 'Soutien scolaire de qualité dans la ville ocre' },
  { name: 'Tanger', count: '60+ profs', tagline: 'Professeurs qualifiés du nord du royaume' },
  { name: 'Fès', count: '50+ profs', tagline: 'Tradition d’excellence et de réussite' },
  { name: 'Agadir', count: '40+ profs', tagline: 'Cours particuliers et coaching sur mesure' },
];

interface MoroccoMapProps {
  onSelectCity: (cityName: string) => void;
  selectedCity: string;
}

export default function MoroccoMap({ onSelectCity, selectedCity }: MoroccoMapProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Animation publicitaire fluide entre les villes (toutes les 3 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CITIES_PROMO.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentCity = CITIES_PROMO[currentIndex];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700/80 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]">
      
      {/* Effet lumineux dynamique */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none transition-all duration-700" />

      {/* EN-TÊTE DU CARD */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>En Direct du Maroc</span>
        </div>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Spotlight Villes</span>
      </div>

      {/* ZONE CENTRALE : CARTE BLANCHE ANIMÉE */}
      <div className="py-4 relative z-10 flex-grow flex items-center justify-center">
        <div 
          onClick={() => onSelectCity(currentCity.name)}
          className="w-full p-6 rounded-2xl bg-white text-slate-900 shadow-2xl cursor-pointer transform transition-all duration-700 hover:scale-[1.02] group relative overflow-hidden"
        >
          {/* Badge Nombre de Profs */}
          <div className="flex items-center justify-between mb-3">
            <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
              {currentCity.count}
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition duration-300">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          {/* Nom de la ville */}
          <div className="space-y-1">
            <h4 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {currentCity.name}
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-purple-600" />
            </h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {currentCity.tagline}
            </p>
          </div>

          {/* Indicateurs de défilement */}
          <div className="flex items-center gap-1.5 mt-4">
            {CITIES_PROMO.map((_, idx) => (
              <span 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  idx === currentIndex ? 'w-6 bg-purple-600' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER DU CARD */}
      <div className="pt-2 border-t border-slate-800/80 text-center relative z-10">
        <p className="text-[11px] text-slate-400">
          Cliquez sur la carte pour filtrer instantanément les professeurs de <strong className="text-white">{currentCity.name}</strong>.
        </p>
      </div>

    </div>
  );
}