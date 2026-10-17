'use client';

import { ShieldCheck, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface LeadsQualityCardProps {
  isDarkMode?: boolean;
  leads?: any[];
}

export default function LeadsQualityCard({ isDarkMode = false, leads = [] }: LeadsQualityCardProps) {
  // Données de secours par défaut si aucun lead n'est encore enregistré
  const defaultLeads = [
    { id: 1, student_name: 'Youssef Alami', subject: 'Mathématiques', seriousness_score: 88, created_at: 'Il y a 10 min' },
    { id: 2, student_name: 'Fatima Zahra', subject: 'Physique-Chimie', seriousness_score: 65, created_at: 'Il y a 2h' },
    { id: 3, student_name: 'Mehdi Bennani', subject: 'Mathématiques', seriousness_score: 92, created_at: 'Il y a 1 jour' },
  ];

  const displayLeads = leads && leads.length > 0 ? leads : defaultLeads;

  return (
    <div className={`p-7 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 text-white' 
        : 'bg-white border-slate-200/80 shadow-xs text-slate-900'
    }`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Qualité des Leads</span>
          </div>
          <h3 className="text-lg font-black tracking-tight">Indice de Sérieux des Élèves</h3>
          <p className="text-xs text-slate-400 font-medium">Analysez l&apos;engagement des étudiants avant d&apos;utiliser vos crédits.</p>
        </div>
      </div>

      {/* Liste des demandes avec leur score de sérieux */}
      <div className="space-y-3">
        {displayLeads.map((lead) => {
          const score = lead.seriousness_score || 70;
          
          // Détermination dynamique de la couleur du badge selon le score
          let badgeColor = 'emerald';
          let label = 'Élève Très Motivé 🔥';
          if (score < 80 && score >= 50) {
            badgeColor = 'amber';
            label = 'Intérêt Confirmé 👍';
          } else if (score < 50) {
            badgeColor = 'rose';
            label = 'Visite Rapide ⚡';
          }

          return (
            <div 
              key={lead.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/80 border-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black truncate">{lead.student_name || 'Élève Anonyme'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{lead.subject || 'Cours'} • {lead.created_at || 'Récemment'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-[11px] font-black bg-${badgeColor}-500/10 text-${badgeColor}-500 border border-${badgeColor}-500/20 flex items-center gap-1`}>
                  <span>{score}%</span>
                  <span className="hidden sm:inline">• {label}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pied de carte */}
      <div className="mt-5 pt-4 border-t border-slate-700/20 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">Calculé via le comportement de navigation.</span>
        <Link href="/prof/dashboard/gestion_demande" className="text-xs font-extrabold text-orange-500 flex items-center gap-1 hover:translate-x-1 transition-transform">
          <span>Voir toutes les demandes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}