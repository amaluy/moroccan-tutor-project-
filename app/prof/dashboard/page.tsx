'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfDashboard() {
  const [profName, setProfName] = useState('Chargement...');
  const [isAvailable, setIsAvailable] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentProfEmail = "berrada0amal@gmail.com"; 

  useEffect(() => {
    async function fetchProfData() {
      // 1. On récupère le prof avec un .select() simple pour éviter les blocages de colonnes
      const { data: profData, error: profError } = await supabase
        .from('professors')
        .select('*')
        .eq('email', currentProfEmail)
        .single();

      if (profData) {
        // Utilisation des noms exacts vus sur ta capture ("Prénom" et "Nom")
        const fullName = `${profData['Prénom'] || ''} ${profData['Nom'] || ''}`.trim();
        setProfName(fullName || 'Mon Espace');
        setIsAvailable(profData.available ?? true);
      } else {
        console.error("Détail de l'erreur Supabase :", profError);
        setProfName('Professeur');
      }

      // 2. Récupérer les leads de ce professeur
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
    } else {
      alert("Erreur lors de la mise à jour.");
    }
  };

  const totalLeads = leads.length;
  const acceptedLeads = leads.filter(l => l.status === 'accepted').length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Chargement de votre espace...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 capitalize">
              Bonjour, {profName} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Bienvenue sur votre tableau de bord. Gérez vos élèves et vos préférences ici.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Votre statut :</span>
            <button
              onClick={toggleAvailability}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                isAvailable 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {isAvailable ? '🟢 Disponible' : '🔴 Occupé / Inactif'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Demandes reçues ce mois</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Élèves acceptés (Leads validés)</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{acceptedLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <p className="text-sm font-medium text-gray-500">Mon Profil Public</p>
            <a 
              href="/prof/edit-profile" 
              className="mt-2 text-sm font-semibold text-orange-600 hover:underline inline-flex items-center gap-1"
            >
              Modifier mes informations ⚙️
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Invitations & Demandes des élèves</h2>

          {leads.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">Aucune demande d'élève pour le moment.</p>
              <p className="text-xs text-gray-400 mt-1">Partagez votre profil pour recevoir vos premiers cours !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="border border-gray-100 bg-gray-50/50 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:bg-gray-50">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{lead.student_name}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Message : <span className="font-medium text-gray-800">{lead.subject}</span></p>
                    
                    {lead.status === 'accepted' ? (
                      <p className="mt-3 text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-lg inline-block font-bold">
                        📞 Téléphone : {lead.student_phone}
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg inline-block font-medium">
                        🔒 Numéro masqué. Cliquez sur Accepter pour débloquer (10 DH).
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {(!lead.status || lead.status === 'pending') && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(lead.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(lead.id, 'rejected')}
                          className="px-4 py-2 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                        >
                          Rejeter
                        </button>
                      </>
                    )}

                    {lead.status === 'accepted' && (
                      <span className="px-4 py-1.5 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                        Accepté ✓
                      </span>
                    )}

                    {lead.status === 'rejected' && (
                      <span className="px-4 py-1.5 bg-red-100 text-red-800 text-sm font-bold rounded-full">
                        Rejeté ✕
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}