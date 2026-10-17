'use client';

import { Award } from 'lucide-react';

interface BadgesWidgetProps {
  isDarkMode?: boolean;
}

export default function BadgesWidget({ isDarkMode = false }: BadgesWidgetProps) {
  const badges = [
    {
      id: 1,
      icon: '⚡',
      name: 'Ultra Réactif',
      desc: 'Répond en moins de 2h',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400',
      unlocked: true,
    },
    {
      id: 2,
      icon: '🔥',
      name: 'En Tendance',
      desc: '+100 vues ce mois',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-500',
      unlocked: true,
    },
    {
      id: 3,
      icon: '🛡️',
      name: 'Profil Vérifié',
      desc: 'Identité validée',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-500',
      unlocked: true,
    },
  ];

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 text-white' 
        : 'bg-white border-slate-200/80 shadow-xs text-slate-900'
    }`}>
      {/* En-tête */}
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-purple-500" />
        <h4 className="text-xs font-black uppercase tracking-wider">Vos Badges</h4>
      </div>

      {/* Grille de Badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all hover:scale-105 ${badge.bgColor} ${badge.borderColor}`}
          >
            <span className="text-2xl mb-1">{badge.icon}</span>
            <span className={`text-[10px] font-black leading-tight ${badge.textColor}`}>
              {badge.name}
            </span>
            <span className="text-[8px] text-slate-400 font-medium mt-0.5 leading-tight">
              {badge.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}