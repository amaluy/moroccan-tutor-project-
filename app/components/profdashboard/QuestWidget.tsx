'use client';

import { Target, CheckCircle2, Circle } from 'lucide-react';

interface QuestWidgetProps {
  isDarkMode?: boolean;
}

export default function QuestWidget({ isDarkMode = false }: QuestWidgetProps) {
  // Exemples de quêtes mensuelles
  const quests = [
    { id: 1, title: 'Répondre à 3 demandes d\'élèves', xp: '+30 XP', completed: true },
    { id: 2, title: 'Mettre à jour vos disponibilités', xp: '+15 XP', completed: true },
    { id: 3, title: 'Obtenir 50 vues sur votre profil', xp: '+50 XP', completed: false },
  ];

  const completedCount = quests.filter((q) => q.completed).length;
  const progressPercent = Math.round((completedCount / quests.length) * 100);

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 text-white' 
        : 'bg-white border-slate-200/80 shadow-xs text-slate-900'
    }`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-500" />
          <h4 className="text-xs font-black uppercase tracking-wider">Objectifs du Mois</h4>
        </div>
        <span className="text-[11px] font-black text-orange-500 bg-orange-500/10 px-2.5 py-0.5 rounded-full">
          {progressPercent}%
        </span>
      </div>

      {/* Barre de progression globale */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Liste des quêtes */}
      <div className="space-y-2.5">
        {quests.map((quest) => (
          <div 
            key={quest.id}
            className={`p-3 rounded-2xl border flex items-center justify-between transition ${
              quest.completed
                ? isDarkMode ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50/80 border-slate-100'
                : isDarkMode ? 'bg-slate-900 border-slate-700/80' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {quest.completed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className={`text-xs font-bold ${quest.completed ? 'line-through text-slate-400' : ''}`}>
                {quest.title}
              </span>
            </div>
            <span className="text-[10px] font-black text-amber-500 shrink-0 ml-2">
              {quest.xp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}