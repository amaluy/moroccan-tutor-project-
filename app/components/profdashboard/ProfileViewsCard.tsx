'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Eye, CheckCircle } from 'lucide-react';

interface ProfileViewsCardProps {
  isDarkMode?: boolean;
}

const viewsData = [
  { jour: 'Lun', vues: 14, clics: 3 },
  { jour: 'Mar', vues: 28, clics: 7 },
  { jour: 'Mer', vues: 22, clics: 5 },
  { jour: 'Jeu', vues: 35, clics: 10 },
  { jour: 'Ven', vues: 42, clics: 14 },
  { jour: 'Sam', vues: 55, clics: 18 },
  { jour: 'Dim', vues: 48, clics: 15 },
];

export default function ProfileViewsCard({ isDarkMode = false }: ProfileViewsCardProps) {
  return (
    <div className={`p-7 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 text-white' 
        : 'bg-white border-slate-200/80 shadow-xs text-slate-900'
    }`}>
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Visibilité & Audience</span>
          </div>
          <h3 className="text-lg font-black tracking-tight">Vues de Profil vs Clics</h3>
          <p className="text-xs text-slate-400 font-medium">Nombre de fois où votre fiche apparaît dans les recherches.</p>
        </div>

        {/* Indicateurs Synthèse */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Total Vues</p>
            <p className="text-lg font-black text-blue-500">244</p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl text-center">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Total Clics</p>
            <p className="text-lg font-black text-purple-500">72</p>
          </div>
        </div>
      </div>

      {/* Graphique d'Évolution (Recharts) */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={viewsData}>
            <defs>
              <linearGradient id="colorVues" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClics" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey="jour" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                borderRadius: '16px',
                borderColor: '#334155',
                fontSize: '12px',
                fontWeight: 'bold'
              }} 
            />
            <Area type="monotone" dataKey="vues" name="Vues du profil" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorVues)" />
            <Area type="monotone" dataKey="clics" name="Clics / Intérêts" stroke="#A855F7" strokeWidth={3} fillOpacity={1} fill="url(#colorClics)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Note d'information */}
      <div className="mt-4 pt-4 border-t border-slate-700/20 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          Taux d&apos;intérêt moyen de <strong className={isDarkMode ? "text-slate-200" : "text-slate-700"}>29.5%</strong> cette semaine.
        </span>
      </div>

    </div>
  );
}