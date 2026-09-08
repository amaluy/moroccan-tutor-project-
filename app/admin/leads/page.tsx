'use client';

import { useState, useEffect } from 'react';
import { Coins, Search, Mail, Phone, User, MapPin, BookOpen } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LeadWithProfessor {
  id: number;
  professor_email: string;
  student_name: string | null;
  student_phone: string | null;
  student_email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  professor?: {
    Nom: string | null;
    Prénom: string | null;
    ville: string | null;
    leads_restants: number | null;
  };
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadWithProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeadsData = async () => {
    setLoading(true);
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('id', { ascending: false });

    if (leadsError) {
      console.error('Erreur leads :', leadsError.message);
      setLoading(false);
      return;
    }

    if (leadsData) {
      const enrichedLeads = await Promise.all(
        leadsData.map(async (lead) => {
          if (!lead.professor_email) return lead;

          const { data: profData } = await supabase
            .from('professors')
            .select('Nom, Prénom, ville, leads_restants')
            .eq('email', lead.professor_email.trim())
            .maybeSingle();

          return {
            ...lead,
            professor: profData || undefined,
          };
        })
      );

      setLeads(enrichedLeads);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const profName = `${lead.professor?.Nom || ''} ${lead.professor?.Prénom || ''}`.toLowerCase();
    const studentName = (lead.student_name || '').toLowerCase();
    return matchesFilter && (profName.includes(searchTerm.toLowerCase()) || studentName.includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Suivi des Leads & Soldes</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble automatisée des mises en relation et des soldes.</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-xs">
          <Coins className="w-5 h-5 text-[#FF5733]" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5733] block leading-none">Valeur Lead</span>
            <span className="text-sm font-black text-gray-900">10 MAD / Lead</span>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Rechercher par nom de prof ou d'élève..."
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

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 font-medium">Chargement...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-medium">Aucun lead trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">Professeur</th>
                  <th className="py-3.5 px-6">Élève (Contact)</th>
                  <th className="py-3.5 px-6">Matière</th>
                  <th className="py-3.5 px-6">Message</th>
                  <th className="py-3.5 px-6">Statut actuel</th>
                  <th className="py-3.5 px-6">Solde Prof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition">
                    
                    {/* Professeur */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#FF5733]" />
                        {lead.professor?.Nom || 'Inconnu'} {lead.professor?.Prénom || ''}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {lead.professor?.ville || 'Ville non spécifiée'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{lead.professor_email}</div>
                    </td>

                    {/* Élève */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800">{lead.student_name || 'Anonyme'}</div>
                      <div className="space-y-0.5 mt-1 text-xs text-gray-500">
                        {lead.student_phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{lead.student_phone}</span>
                          </div>
                        )}
                        {lead.student_email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{lead.student_email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Matière */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                        <BookOpen className="w-3 h-3 text-gray-400" />
                        {lead.subject || 'Non spécifiée'}
                      </span>
                    </td>

                    {/* Message */}
                    <td className="py-4 px-6">
                      <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-xs whitespace-pre-wrap leading-relaxed">
                        {lead.message || <span className="italic text-gray-400">Aucun message</span>}
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        lead.status === 'accepted' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : lead.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {lead.status || 'pending'}
                      </span>
                    </td>

                    {/* Solde Prof */}
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{lead.professor?.leads_restants ?? 0} leads restants</span>
                        </div>
                      </div>
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