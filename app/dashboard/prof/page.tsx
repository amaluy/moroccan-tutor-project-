'use client';

import { useState } from 'react';
import { Wallet, Lock, Unlock, Phone, Sparkles, AlertTriangle } from 'lucide-react';

interface Lead {
  id: string;
  studentName: string;
  studentPhone: string;
  message: string;
  createdAt: string;
  isUnlocked: boolean; // Vrai si le prof avait du crédit lors de la réception
}

export default function ProfDashboard() {
  const [credits, setCredits] = useState(0); // Exemple: crédit à 0 DH[cite: 4]
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      studentName: 'Karim M.',
      studentPhone: '0661******',
      message: 'Recherche cours de maths niveau 2ème Bac SM à Casablanca.',
      createdAt: 'Aujourd\'hui 14:30',
      isUnlocked: false
    },
    {
      id: '2',
      studentName: 'Amina B.',
      studentPhone: '0650******',
      message: 'Besoin de soutien en physique pour préparation examen national.',
      createdAt: 'Hier 18:10',
      isUnlocked: false
    }
  ]);

  const handleRecharge = (amount: number) => {
    // Simuler une recharge de crédit
    setCredits((prev) => prev + amount);
    
    // Débloquer automatiquement les leads en attente s'il a rechargé suffisant
    setLeads((prev) =>
      prev.map((lead) => ({ ...lead, isUnlocked: true }))
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-6 max-w-5xl mx-auto space-y-8">
      
      {/* SECTION HEADER + SOLDE CRÉDIT */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Espace Enseignant</span>
          <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500">Solde de Crédit</p>
            <p className={`text-xl font-black ${credits < 10 ? 'text-red-500' : 'text-gray-900'}`}>
              {credits} MAD <span className="text-xs font-normal text-gray-500">({Math.floor(credits / 10)} leads)</span>
            </p>
          </div>
        </div>
      </div>

      {/* ALERTE CRÉDIT ÉPUISÉ */}
      {credits < 10 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 text-amber-900">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Votre profil est actuellement suspendu aux nouvelles demandes !</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Votre crédit est insuffisant (&lt; 10 DH)[cite: 4]. Rechargez votre compte dès maintenant pour débloquer les coordonnées des élèves intéressés[cite: 4].
            </p>
          </div>
        </div>
      )}

      {/* OPTIONS DE RECHARGE (RECHARGE PRÉPAYÉE MAROC) */}
      <section className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF5A5F]" />
          <h2 className="text-lg font-bold text-gray-900">Recharger vos Crédits (10 DH / lead)[cite: 4]</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-200 p-5 rounded-2xl hover:border-[#FF5A5F] transition cursor-pointer bg-gray-50 hover:bg-white space-y-2">
            <span className="text-xs font-bold text-gray-500">Formule Starter</span>
            <div className="text-2xl font-black text-gray-900">100 DH</div>
            <p className="text-xs text-gray-600 font-medium">10 leads qualifiés[cite: 4]</p>
            <button 
              onClick={() => handleRecharge(100)}
              className="w-full mt-2 py-2 bg-[#FF5A5F] text-white text-xs font-bold rounded-lg"
            >
              Recharger 100 DH
            </button>
          </div>

          <div className="border-2 border-[#FF5A5F] p-5 rounded-2xl relative bg-red-50/20 space-y-2">
            <span className="absolute -top-3 right-4 bg-[#FF5A5F] text-white text-[10px] font-black px-2 py-0.5 rounded-full">POPULAIRE</span>
            <span className="text-xs font-bold text-gray-500">Formule Pro</span>
            <div className="text-2xl font-black text-gray-900">200 DH</div>
            <p className="text-xs text-gray-600 font-medium">20 leads + 2 bonus[cite: 4]</p>
            <button 
              onClick={() => handleRecharge(220)}
              className="w-full mt-2 py-2 bg-[#FF5A5F] text-white text-xs font-bold rounded-lg"
            >
              Recharger 200 DH
            </button>
          </div>

          <div className="border border-gray-200 p-5 rounded-2xl hover:border-[#FF5A5F] transition cursor-pointer bg-gray-50 hover:bg-white space-y-2">
            <span className="text-xs font-bold text-gray-500">Formule Expert</span>
            <div className="text-2xl font-black text-gray-900">500 DH</div>
            <p className="text-xs text-gray-600 font-medium">50 leads + 8 bonus[cite: 4]</p>
            <button 
              onClick={() => handleRecharge(580)}
              className="w-full mt-2 py-2 bg-[#FF5A5F] text-white text-xs font-bold rounded-lg"
            >
              Recharger 500 DH
            </button>
          </div>
        </div>
      </section>

      {/* LISTE DES LEADS ÉLÈVES (VERROUILLÉS / DÉBLOQUÉS) */}
      <section className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Mes Demandes d'Élèves ({leads.length})</h2>

        <div className="space-y-3">
          {leads.map((lead) => (
            <div 
              key={lead.id} 
              className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                lead.isUnlocked ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200/60'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-gray-900 text-base">{lead.studentName}</h4>
                  <span className="text-[10px] text-gray-400">{lead.createdAt}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">{lead.message}</p>
                
                {lead.isUnlocked ? (
                  <div className="flex items-center gap-2 pt-2 text-xs font-bold text-green-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{lead.studentPhone}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 pt-2 text-xs font-bold text-amber-600">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Numéro verrouillé — Rechargez pour afficher[cite: 4]</span>
                  </div>
                )}
              </div>

              {!lead.isUnlocked && (
                <button 
                  onClick={() => handleRecharge(100)}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-2"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Débloquer (10 DH)[cite: 4]</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}