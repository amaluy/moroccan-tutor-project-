'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Sparkles } from 'lucide-react';

interface LeaderboardWidgetProps {
  profId: string | number;
  isDarkMode?: boolean;
}

export default function LeaderboardWidget({ profId, isDarkMode = false }: LeaderboardWidgetProps) {
  const [profRank, setProfRank] = useState<number>(0);
  const [profScore, setProfScore] = useState<number>(0);
  const [topProfessors, setTopProfessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const { data: leaderboardData } = await supabase
          .from('professor_leaderboard')
          .select('*')
          .order('rank', { ascending: true });

        if (leaderboardData) {
          // Trouver le rang du professeur actuel
          const currentProf = leaderboardData.find((p: any) => String(p.id) === String(profId));
          if (currentProf) {
            setProfRank(currentProf.rank);
            setProfScore(currentProf.total_score);
          }

          // Formater le Top 3
          const formattedTop = leaderboardData.slice(0, 3).map((p: any) => ({
            id: p.id,
            name: `${p['Prénom'] || p.prenom || ''} ${p['Nom'] || p.nom || ''}`.trim() || 'Professeur',
            score: p.total_score,
            rank: p.rank,
            isCurrentProf: String(p.id) === String(profId)
          }));
          setTopProfessors(formattedTop);
        }
      } catch (err) {
        console.error("Erreur classement:", err);
      } finally {
        setLoading(false);
      }
    }

    if (profId) {
      fetchLeaderboard();
    }
  }, [profId]);

  if (loading) {
    return (
      <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <p className="text-xs text-slate-400">Chargement de la compétition...</p>
      </div>
    );
  }

  return (
    <div className={`p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 text-white' 
        : 'bg-white border-slate-200/80 shadow-xs text-slate-900'
    }`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* EN-TÊTE DU WIDGET */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/40 pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Classement Mensuel</span>
          </div>
          <h3 className="text-xl font-black">Votre Position dans la Compétition</h3>
        </div>

        <div className="flex items-center gap-4 bg-purple-600/10 border border-purple-500/20 px-5 py-3 rounded-2xl">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Rang Actuel</p>
            <p className="text-2xl font-black text-purple-400">#{profRank || '-'}</p>
          </div>
          <div className="h-8 w-[1px] bg-purple-500/20" />
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase">Score Total</p>
            <p className="text-2xl font-black text-amber-400">{profScore || 0} Pts</p>
          </div>
        </div>
      </div>

      {/* TOP 3 PROFESSEURS */}
      <div className="pt-6 relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Enseignants de la Plateforme</p>
          <div className="inline-flex items-center gap-1 text-[11px] text-purple-400 font-bold">
            <Sparkles className="w-3 h-3" />
            <span>En temps réel</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topProfessors.map((prof) => (
            <div
              key={prof.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                prof.isCurrentProf
                  ? 'bg-purple-600/20 border-purple-500 text-white ring-2 ring-purple-500/30'
                  : isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                  prof.rank === 1 ? 'bg-amber-400 text-slate-950' :
                  prof.rank === 2 ? 'bg-slate-300 text-slate-950' :
                  prof.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {prof.rank}
                </span>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{prof.isCurrentProf ? `${prof.name} (Vous)` : prof.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{prof.score} Points</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}