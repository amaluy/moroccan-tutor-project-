'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const CRENEAUX = ['Matin', 'Midi', 'Après-midi'];

export default function ProfDashboard() {
  const [profName, setProfName] = useState('Chargement...');
  const [isAvailable, setIsAvailable] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'availability' | 'profile'>('overview');
  const [availabilityGrid, setAvailabilityGrid] = useState<Record<string, boolean>>({});

  const currentProfEmail = "berrada0amal@gmail.com"; 

  useEffect(() => {
    async function fetchProfData() {
      const { data: profData } = await supabase
        .from('professors')
        .select('*')
        .eq('email', currentProfEmail)
        .single();

      if (profData) {
        const fullName = `${profData['Prénom'] || ''} ${profData['Nom'] || ''}`.trim();
        setProfName(fullName || 'Mon Espace');
        setIsAvailable(profData.available ?? true);
        if (profData.availability_grid) {
          setAvailabilityGrid(profData.availability_grid);
        }
      }

      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('professor_email', currentProfEmail);

      if (leadsData) {
        setLeads(leadsData);
      }

      setLoading(false);
    }

    fetchProfData();
  }, [currentProfEmail]);

  const toggleSlot = async (jour: string, creneau: string) => {
    const key = `${jour}-${creneau}`;
    const updatedGrid = { ...availabilityGrid, [key]: !availabilityGrid[key] };
    setAvailabilityGrid(updatedGrid);

    await supabase
      .from('professors')
      .update({ availability_grid: updatedGrid })
      .eq('email', currentProfEmail);
  };

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    await supabase
      .from('professors')
      .update({ available: newStatus })
      .eq('email', currentProfEmail);
  };

  const handleUpdateStatus = async (id: string, newStatus: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    }
  };

  const totalLeads = leads.length;
  const acceptedLeads = leads.filter(l => l.status === 'accepted').length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Chargement de votre espace...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* MENU LATÉRAL DE NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-extrabold text-orange-600">Espace Prof</h2>
            <p className="text-xs text-gray-400 mt-1 capitalize">{profName}</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'overview' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📊 Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex justify-between items-center ${
                activeTab === 'leads' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>📩 Demandes d'élèves</span>
              {totalLeads > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalLeads}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'availability' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📅 Disponibilités
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'profile' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⚙️ Modifier mon profil
            </button>
          </nav>
        </div>

        {/* Bouton de déconnexion ou retour */}
        <div className="pt-6 border-t border-gray-100">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-800 font-medium">← Retour au site</a>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL SELON L'ONGLET ACTIF */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl">
        
        {/* EN-TÊTE GLOBAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 capitalize">
              Bonjour, {profName} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Gérez votre activité en toute simplicité.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Statut :</span>
            <button
              onClick={toggleAvailability}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isAvailable ? '🟢 Disponible' : '🔴 Occupé'}
            </button>
          </div>
        </div>

        {/* ONGLET 1 : VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Vue d'ensemble</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Demandes reçues ce mois</p>
                <p className="text-4xl font-extrabold text-gray-900 mt-2">{totalLeads}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Élèves acceptés</p>
                <p className="text-4xl font-extrabold text-orange-600 mt-2">{acceptedLeads}</p>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2 : DEMANDES D'ÉLÈVES */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invitations & Demandes des élèves</h2>

            {leads.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">Aucune demande d'élève pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="border border-gray-100 bg-gray-50/50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{lead.student_name}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">Message : <span className="font-medium text-gray-800">{lead.subject}</span></p>
                      
                      {lead.status === 'accepted' ? (
                        <p className="mt-3 text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-lg inline-block font-bold">
                          📞 Téléphone : {lead.student_phone}
                        </p>
                      ) : (
                        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg inline-block font-medium">
                          🔒 Numéro masqué. Cliquez sur Accepter pour débloquer.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(!lead.status || lead.status === 'pending') && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'accepted')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'rejected')}
                            className="px-4 py-2 bg-white border border-gray-300 hover:bg-red-50 text-gray-700 text-sm font-semibold rounded-xl"
                          >
                            Rejeter
                          </button>
                        </>
                      )}
                      {lead.status === 'accepted' && <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">Accepté ✓</span>}
                      {lead.status === 'rejected' && <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full">Rejeté ✕</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET 3 : DISPONIBILITÉS */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Modifier vos disponibilités</h2>
            <p className="text-sm text-gray-500 mb-6">Cliquez sur les cercles pour activer ou désactiver vos créneaux par jour.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-left text-sm font-semibold text-gray-500">Créneau</th>
                    {JOURS.map((jour) => (
                      <th key={jour} className="py-3 text-sm font-bold text-gray-800">{jour}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRENEAUX.map((creneau) => (
                    <tr key={creneau} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-4 text-left text-sm font-medium text-gray-700">{creneau}</td>
                      {JOURS.map((jour) => {
                        const isActive = !!availabilityGrid[`${jour}-${creneau}`];
                        return (
                          <td key={jour} className="py-4">
                            <button
                              onClick={() => toggleSlot(jour, creneau)}
                              className={`w-8 h-8 rounded-full transition-all mx-auto flex items-center justify-center ${
                                isActive ? 'bg-orange-500 hover:bg-orange-600 shadow-sm shadow-orange-200' : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ONGLET 4 : PROFIL */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mon Profil Public</h2>
            <p className="text-sm text-gray-500 mb-6">Modifiez vos informations personnelles visibles par les élèves.</p>
            <a 
              href="/prof/edit-profile" 
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors inline-block"
            >
              Accéder à la modification complète ⚙️
            </a>
          </div>
        )}

      </main>
    </div>
  );
}