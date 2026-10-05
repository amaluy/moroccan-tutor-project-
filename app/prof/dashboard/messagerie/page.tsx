'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, ArrowLeft, Phone, Lock, Unlock, CheckCircle2, User, BookOpen } from 'lucide-react';

export default function ProfMessagerie() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [profData, setProfData] = useState<any>(null);

  useEffect(() => {
    async function fetchLeadsAndProf() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        const profEmail = 
          user?.email || 
          localStorage.getItem('professor_email') || 
          localStorage.getItem('profEmail') || 
          localStorage.getItem('user_email') || 
          localStorage.getItem('email') || '';

        if (!profEmail) {
          window.location.href = '/connexion';
          return;
        }

        // 1. Récupérer les infos du prof
        const { data: allProfs } = await supabase.from('professors').select('*');
        if (allProfs) {
          const prof = allProfs.find((p: any) => p.email && p.email.toLowerCase().trim() === profEmail.toLowerCase().trim());
          if (prof) setProfData(prof);
        }

        // 2. Récupérer les leads de la table 'leads'
        const { data: leadsData, error } = await supabase
          .from('leads')
          .select('*')
          .ilike('professor_email', profEmail.trim());

        if (error) {
          console.error("Erreur chargement leads:", error);
        }

        if (leadsData && leadsData.length > 0) {
          setConversations(leadsData);
          // Sélectionner par défaut le premier lead et le marquer comme lu si besoin
          setSelectedLead(leadsData[0]);
          markAsRead(leadsData[0]);
        } else {
          const mockLeads = [
            {
              id: 1,
              student_name: 'Amal',
              student_phone: '0677151515',
              message: 'bonjour',
              status: 'pending',
              is_read: false,
              subject: 'Soutien Scolaire'
            }
          ];
          setConversations(mockLeads);
          setSelectedLead(mockLeads[0]);
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeadsAndProf();
  }, []);

  // Fonction pour marquer un message/lead comme lu
  const markAsRead = async (lead: any) => {
    if (!lead || lead.is_read) return;

    // Mise à jour locale
    setConversations(prev =>
      prev.map(item => item.id === lead.id ? { ...item, is_read: true } : item)
    );

    // Mise à jour dans Supabase
    try {
      await supabase
        .from('leads')
        .update({ is_read: true })
        .eq('id', lead.id);
    } catch (e) {
      console.error("Erreur marquage lead comme lu:", e);
    }
  };

  // Gestion du clic sur un lead dans la liste
  const handleSelectLead = (lead: any) => {
    setSelectedLead(lead);
    markAsRead(lead);
  };

  const handleUnlockLead = async (leadId: number) => {
    const currentCredits = profData?.leads_restants ?? 0;
    if (currentCredits <= 0) {
      alert("Vous n'avez plus assez de leads/crédits. Veuillez recharger votre compte.");
      window.location.href = '/prof/dashboard/credits';
      return;
    }

    const updatedConversations = conversations.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, status: 'accepted' };
      }
      return lead;
    });

    setConversations(updatedConversations);
    setSelectedLead(updatedConversations.find(l => l.id === leadId));

    try {
      await supabase
        .from('leads')
        .update({ status: 'accepted' })
        .eq('id', leadId);
    } catch (e) {
      console.error("Erreur mise à jour statut lead:", e);
    }
  };

  const filteredConversations = conversations.filter(conv => 
    (conv.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.message || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">
        Chargement des demandes...
      </div>
    );
  }

  const isLeadUnlocked = selectedLead?.status === 'accepted' || selectedLead?.status === 'unlocked';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/prof/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour Dashboard</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-200" />
          <h1 className="text-sm font-black tracking-tight flex items-center gap-2">
            <span>Demandes & Contacts Élèves</span>
            <span className="text-orange-500 font-black">ProfMaroc</span>
          </h1>
        </div>
        <div className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200">
          Leads disponibles : <span className="text-amber-600 font-black">{profData?.leads_restants ?? 0}</span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[calc(100vh-140px)]">
          
          {/* Colonne de gauche : Liste des élèves */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une demande..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Aucune demande trouvée.
                </div>
              ) : (
                filteredConversations.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id;
                  const studentName = lead.student_name || 'Élève';
                  const studentMessage = lead.message || 'Nouvelle demande...';
                  const unlocked = lead.status === 'accepted' || lead.status === 'unlocked';
                  const isUnread = lead.is_read === false; // Indicateur non lu

                  return (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectLead(lead)}
                      className={`w-full text-left p-4 transition flex items-start gap-3 cursor-pointer relative ${
                        isSelected ? 'bg-orange-50/60 border-l-4 border-orange-500' : 'hover:bg-slate-100/60'
                      }`}
                    >
                      {/* Pastille point rouge si non lu */}
                      {isUnread && (
                        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
                      )}

                      <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
                        {studentName[0]?.toUpperCase() || 'E'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between pr-3">
                          <p className={`text-xs truncate ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                            {studentName}
                          </p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                            unlocked ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {unlocked ? 'Débloqué' : 'Nouveau'}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-1 ${isUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                          {studentMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Colonne de droite : Détails de la demande */}
          <div className="md:col-span-8 flex flex-col bg-white">
            {selectedLead ? (
              <>
                <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-base shadow-md shadow-orange-500/20">
                      {selectedLead.student_name?.[0]?.toUpperCase() || 'E'}
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900">{selectedLead.student_name || 'Élève'}</h2>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                        <span>{selectedLead.subject || 'Demande de cours particuliers'}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    {isLeadUnlocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Lead débloqué
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        <Lock className="w-3.5 h-3.5" />
                        En attente de paiement
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/40">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Message de l'élève :</p>
                    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs text-xs text-slate-800 font-medium leading-relaxed max-w-xl">
                      "{selectedLead.message || "Bonjour, je souhaite prendre des cours avec vous."}"
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Numéro de téléphone de l'élève :</p>
                    
                    {isLeadUnlocked ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center justify-between max-w-xl shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-emerald-700 font-medium">Téléphone direct :</p>
                            <p className="text-base font-black text-emerald-900 tracking-wide">
                              {selectedLead.student_phone || 'Non renseigné'}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`tel:${selectedLead.student_phone}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20"
                        >
                          Appeler
                        </a>
                      </div>
                    ) : (
                      <div className="bg-amber-50/70 border border-amber-200 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-xl shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-900">Numéro masqué</p>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                              Débloquez ce lead (1 crédit) pour afficher le numéro et contacter l'élève.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnlockLead(selectedLead.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-xs font-black transition shadow-lg shadow-orange-500/25 cursor-pointer shrink-0 flex items-center gap-2"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>Débloquer (1 Lead)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-white text-center">
                  <p className="text-[11px] text-slate-400 font-medium">
                    💡 <span className="font-bold text-slate-600">Rappel :</span> Aucun chat en direct n'est nécessaire. Contactez directement l'élève par téléphone ou WhatsApp une fois le lead débloqué.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <User className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                <p className="text-xs font-bold">Sélectionnez une demande dans la liste pour voir les détails</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}