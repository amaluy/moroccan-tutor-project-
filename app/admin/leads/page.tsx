'use client';

import { useState, useEffect } from 'react';
import { Coins, Search, CheckCircle2, XCircle, Clock, Mail, Phone, MessageSquare } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase (assure-toi d'avoir tes variables d'environnement dans .env.local)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Lead {
  id: number;
  professor_email: string;
  student_name: string | null;
  student_phone: string | null;
  subject: string | null;
  status: string | null;
  student_email: string | null;
  message: string | null;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Récupération des données depuis la table Supabase "leads"
  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des leads :', error.message);
      } else if (data) {
        setLeads(data);
      }
      setLoading(false);
    }

    fetchLeads();
  }, []);

  // Filtrage des leads selon la recherche et les onglets de statut
  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const profEmail = lead.professor_email || '';
    const studentName = lead.student_name || '';
    const matchesSearch = 
      profEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
      studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Suivi des Leads & Soldes</h1>
          <p className="text-sm text-gray-500 mt-1">Données en direct de la table Supabase `leads`.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xs">
            <Coins className="w-5 h-5 text-[#FF5733]" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5733] block leading-none">Valeur Lead</span>
              <span className="text-sm font-black text-gray-900">10 MAD / Lead</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Rechercher par email prof ou élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20 focus:border-[#FF5733]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {(['all', 'accepted', 'pending', 'rejected'] as const).map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer uppercase tracking-wider ${
                filter === statusKey 
                  ? 'bg-[#0f2922] text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {statusKey === 'all' ? 'Tous' : statusKey}
            </button>
          ))}
        </div>

      </div>

      {/* Tableau des leads */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium">Chargement des leads depuis Supabase...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium">Aucun lead trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-6">Professeur (Email)</th>
                  <th className="py-3.5 px-6">Élève & Contact</th>
                  <th className="py-3.5 px-6">Matière / Message</th>
                  <th className="py-3.5 px-6">Statut (Prof)</th>
                  <th className="py-3.5 px-6">Impact Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-bold text-gray-400 text-xs">#{lead.id}</td>
                    
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {lead.professor_email || <span className="text-gray-400 italic">Non assigné</span>}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800">{lead.student_name || 'Anonyme'}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        {lead.student_phone && (
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.student_phone}</span>
                        )}
                        {lead.student_email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.student_email}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-gray-700">{lead.subject || 'Matière non spécifiée'}</div>
                      {lead.message && (
                        <div className="text-xs text-gray-400 truncate max-w-xs mt-0.5" title={lead.message}>
                          "{lead.message}"
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {lead.status === 'accepted' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accepté
                        </span>
                      )}
                      {lead.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                          <XCircle className="w-3.5 h-3.5" /> Rejeté
                        </span>
                      )}
                      {lead.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <Clock className="w-3.5 h-3.5" /> En attente
                        </span>
                      )}
                      {!lead.status && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          Inconnu
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900">
                      {lead.status === 'accepted' ? (
                        <span className="text-emerald-600">-10 MAD</span>
                      ) : (
                        <span className="text-gray-400 font-normal text-xs">0 MAD (Non facturé)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}