'use client';

import { Card, Text, Metric } from '@tremor/react';
import { Trophy, Award, Star, Zap, ShieldCheck, Flame, Target, CheckCircle2 } from 'lucide-react';

interface BadgesWidgetProps {
  isDarkMode?: boolean;
}

const badgesList = [
  {
    id: 1,
    title: 'Profil Vérifié',
    description: 'Documents et diplômes validés par l’équipe.',
    icon: ShieldCheck,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    unlocked: true,
  },
  {
    id: 2,
    title: 'Super Prof 🔥',
    description: 'Plus de 10 demandes acceptées ce mois-ci.',
    icon: Flame,
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    unlocked: true,
  },
  {
    id: 3,
    title: 'Réactivité Éclair ⚡',
    description: 'Temps de réponse moyen inférieur à 1 heure.',
    icon: Zap,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    unlocked: true,
  },
  {
    id: 4,
    title: 'Pédagogue Or 🥇',
    description: 'Obtenir une note moyenne supérieure à 4.8/5.',
    icon: Star,
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    unlocked: false,
    progress: '80%',
  },
  {
    id: 5,
    title: 'Mentor Populaire 🎯',
    description: 'Parrainer 3 professeurs sur la plateforme.',
    icon: Target,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    unlocked: false,
    progress: '1/3',
  },
];

export default function BadgesWidget({ isDarkMode = false }: BadgesWidgetProps) {
  const unlockedCount = badgesList.filter((b) => b.unlocked).length;

  return (
    <Card className={`p-6 rounded-3xl border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 text-white' 
        : 'bg-white border-slate-200/80 shadow-xs text-slate-900'
    }`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Récompenses & Badges</span>
          </div>
          <h3 className="text-lg font-black tracking-tight">Vos Trophées</h3>
        </div>
        <span className="text-xs font-black bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-xl">
          {unlockedCount} / {badgesList.length} Débloqués
        </span>
      </div>

      <p className="text-xs text-slate-400 font-medium mb-6">
        Débloquez des badges exclusifs pour rassurer les parents et booster votre visibilité dans les recherches.
      </p>

      {/* Liste des badges */}
      <div className="space-y-3">
        {badgesList.map((badge) => {
          const Icon = badge.icon;
          return (
            <div 
              key={badge.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                badge.unlocked 
                  ? (isDarkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200/60') 
                  : (isDarkMode ? 'bg-slate-950/40 border-slate-900 opacity-60' : 'bg-slate-100/50 border-slate-200/40 opacity-60')
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${badge.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black tracking-wide">{badge.title}</h4>
                    {badge.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{badge.description}</p>
                </div>
              </div>

              {!badge.unlocked && badge.progress && (
                <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg">
                  {badge.progress}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}