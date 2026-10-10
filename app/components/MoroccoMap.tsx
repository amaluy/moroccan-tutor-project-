'use client';

import { MapPin } from 'lucide-react';

interface CityData {
  name: string;
  count: string;
  position: { top: string; left: string };
}

const CITIES: CityData[] = [
  { name: 'Tanger', count: '60+ profs', position: { top: '10%', left: '72%' } },
  { name: 'Rabat', count: '90+ profs', position: { top: '22%', left: '58%' } },
  { name: 'Casablanca', count: '150+ profs', position: { top: '30%', left: '48%' } },
  { name: 'Fès', count: '50+ profs', position: { top: '20%', left: '78%' } },
  { name: 'Oujda', count: '30+ profs', position: { top: '21%', left: '92%' } },
  { name: 'Marrakech', count: '70+ profs', position: { top: '44%', left: '42%' } },
  { name: 'Agadir', count: '40+ profs', position: { top: '58%', left: '30%' } },
  { name: 'Laâyoune', count: '20+ profs', position: { top: '78%', left: '18%' } },
  { name: 'Dakhla', count: '15+ profs', position: { top: '92%', left: '10%' } },
];

interface MoroccoMapProps {
  onSelectCity: (cityName: string) => void;
  selectedCity: string;
}

export default function MoroccoMap({ onSelectCity, selectedCity }: MoroccoMapProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-700/80 shadow-xl relative overflow-hidden">
      
      {/* Effets lumineux discrets */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* CARTE VECTORIELLE COMPACTE ET CENTRÉE */}
      <div className="relative h-[380px] sm:h-[420px] bg-slate-950/40 rounded-2xl border border-slate-800/80 p-4 flex items-center justify-center backdrop-blur-sm overflow-hidden z-10">
        
        <div className="relative w-full h-full max-w-[280px] flex items-center justify-center">
          
          {/* Tracé SVG ajusté */}
          <svg
            viewBox="0 0 500 700"
            className="w-full h-full text-purple-400/80 drop-shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            fill="rgba(147, 51, 234, 0.08)"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 360 35 L 375 25 L 390 45 L 420 50 L 440 45 L 455 60 L 450 85 L 455 125 L 475 148 L 440 170 L 410 168 L 400 190 L 370 230 L 275 295 L 275 395 L 180 395 L 180 505 L 148 505 L 148 580 L 30 580 L 33 540 L 50 515 L 68 470 L 78 435 L 100 410 L 130 365 L 165 320 L 225 285 L 245 235 L 250 190 L 262 165 L 280 152 L 300 120 L 330 110 L 345 80 Z" />
          </svg>

          {/* Boutons des villes */}
          {CITIES.map((city) => {
            const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();

            return (
              <div
                key={city.name}
                style={{ top: city.position.top, left: city.position.left }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group z-20"
              >
                <button
                  onClick={() => onSelectCity(city.name)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all duration-300 shadow-md cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-purple-600 text-white scale-110 ring-2 ring-purple-400/40'
                      : 'bg-slate-900/95 text-slate-200 border border-slate-700/80 hover:bg-white hover:text-slate-900 hover:scale-105'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-purple-400 group-hover:text-purple-600'}`} />
                  <span>{city.name}</span>
                </button>

                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                  <div className="bg-slate-900 text-purple-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-purple-500/30 whitespace-nowrap shadow-sm">
                    {city.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}