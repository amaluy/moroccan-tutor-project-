'use client';

import { Zap, Trophy, Flame } from 'lucide-react';

interface LeaderboardWidgetProps {
  isDarkMode?: boolean;
  profRank?: number;
  profScore?: number;
  profLeague?: string;
  topProfessors?: any[];
}

export default function LeaderboardWidget({
  isDarkMode = false,
  profRank = 1,
  profScore = 140,
  profLeague = 'Ligue Or 🥇',
  topProfessors = []
}: LeaderboardWidgetProps) {
  // Liste de secours si la base de données met du temps à répondre
  const defaultProfessors = [
    { id: '1', name: 'Sami El Idrissi (Vous)', score: profScore || 140, rank: profRank || 1, league: profLeague, isCurrentProf: true },
    { id: '2', name: 'Amal Berrada', score: 100, rank: 2, league: 'Ligue Or 🥇', isCurrentProf: false },
    { id: '3', name: 'Testr Test', score: 100, rank: 3, league: 'Ligue Or 🥇', isCurrentProf: false },
    { id: '4', name: 'Sofia Sofiet', score: 100, rank: 4, league: 'Ligue Or 🥇', isCurrentProf: false },
    { id: '5', name: 'Salah Louizi', score: 100, rank: 5, league: 'Ligue Or 🥇', isCurrentProf: false }
  ];

  const listToDisplay = topProfessors && topProfessors.length > 0 ? topProfessors : defaultProfessors;

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/30 border-slate-800 text-white' 
        : 'bg-gradient-to-b from-white via-purple-50/20 to-purple-100/40 border-slate-200 shadow-xs text-slate-900'
    }`}>
      
      {/* En-tête Ligue et Score */}
      <div className="border-b border-slate-700/30 pb-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-black">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{profLeague}</span>
          </div>
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>

        <div>
          <h3 className="text-lg font-black tracking-tight">Classement Ligue</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Gagnez des XP en répondant aux élèves pour grimper !</p>
        </div>

        {/* Rang et Points */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-purple-500/20 p-3.5 rounded-2xl text-center backdrop-blur-md">
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Rang</p>
            <p className="text-xl font-black text-purple-400 mt-0.5">#{profRank || 1}</p>
          </div>
          <div className="border-l border-slate-800">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Points</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{profScore} <span className="text-[10px]">XP</span></p>
          </div>
        </div>
      </div>

      {/* Top Enseignants */}
      <div className="pt-5 space-y-3">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Top Enseignants</p>

        <div className="space-y-2">
          {listToDisplay.map((prof) => (
            <div
              key={prof.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                prof.isCurrentProf
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-md ring-2 ring-purple-500/30'
                  : isDarkMode ? 'bg-slate-950/50 border-slate-800/80' : 'bg-white/80 border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className={`w-7 h-7 rounded-xl text-[11px] font-black flex items-center justify-center shrink-0 ${
                  prof.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' :
                  prof.rank === 2 ? 'bg-slate-300 text-slate-950' :
                  prof.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{prof.rank}
                </span>

                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate flex items-center gap-1.5">
                    <span className="truncate">{prof.isCurrentProf ? `${prof.name} (Vous)` : prof.name}</span>
                    {prof.rank === 1 && <Flame className="w-3 h-3 text-orange-500 fill-orange-500 shrink-0" />}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium truncate">{prof.league}</p>
                </div>
              </div>

              <span className="text-xs font-black text-amber-500 shrink-0 pl-2">
                {prof.score} XP
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}