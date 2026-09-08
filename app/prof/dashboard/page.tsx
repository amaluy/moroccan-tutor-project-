'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import ProfPanel from './profPanel';
import { Search } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfDashboard() {
  const [profName, setProfName] = useState('Chargement...');
  const [profImage, setProfImage] = useState('');
  const [profNiveau, setProfNiveau] = useState<any>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [otherProfs, setOtherProfs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState({ dayName: '', timeString: '' });

  useEffect(() => {
    const updateMoroccoTime = () => {
      const now = new Date();
      const optionsDate: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Casablanca', weekday: 'long', day: 'numeric', month: 'short' };
      const optionsTime: Intl.DateTimeFormatOptions = { timeZone: 'Africa/Casablanca', hour: '2-digit', minute: '2-digit', hour12: false };
      
      const dateFormatter = new Intl.DateTimeFormat('fr-FR', optionsDate);
      const timeFormatter = new Intl.DateTimeFormat('fr-FR', optionsTime);

      setCurrentDate({
        dayName: dateFormatter.format(now),
        timeString: timeFormatter.format(now),
      });
    };

    updateMoroccoTime();
    const timer = setInterval(updateMoroccoTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchProfData() {
      // Récupération de l'email connecté depuis le localStorage (exactement comme profile/page.tsx)
      const storedEmail = localStorage.getItem('profEmail') || "berrada0amal@gmail.com";

      // 1. Récupérer les données du professeur connecté
      const { data: profData } = await supabase
        .from('professors')
        .select('*')
        .eq('email', storedEmail)
        .single();

      if (profData) {
        const fullName = `${profData['Prénom'] || ''} ${profData['Nom'] || ''}`.trim();
        setProfName(fullName || 'Mon Espace');
        setProfImage(profData.image_url || profData.photo || '');
        setProfNiveau(profData.niveau || []);
        setIsAvailable(profData.available ?? true);
      }

      // 2. Récupérer les demandes (leads) de ce prof
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('professor_email', storedEmail);

      if (leadsData) {
        setLeads(leadsData);
      }

      // 3. Récupérer les autres professeurs pour les avatars en haut à droite
      const { data: allProfs } = await supabase
        .from('professors')
        .select('*')
        .neq('email', storedEmail)
        .limit(4);

      if (allProfs) {
        setOtherProfs(allProfs);
      }

      setLoading(false);
    }

    fetchProfData();
  }, []);

  const toggleAvailability = async () => {
    const storedEmail = localStorage.getItem('profEmail') || "berrada0amal@gmail.com";
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    await supabase
      .from('professors')
      .update({ available: newStatus })
      .eq('email', storedEmail);
  };

  const totalLeads = leads.length;
  const acceptedLeads = leads.filter(l => l.status === 'accepted').length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">Chargement de votre espace...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      
      {/* Panneau latéral gauche */}
      <ProfPanel profName={profName} profImage={profImage} niveau={profNiveau} />

      {/* Contenu principal */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* BARRE DU HAUT */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 rounded-3xl shadow-xs border border-gray-100 mb-8 gap-4">
          
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 text-orange-600 px-4 py-2.5 rounded-2xl text-center font-bold">
              <span className="block text-xs uppercase tracking-wider">Maroc</span>
              <span className="text-lg">{currentDate.timeString}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 capitalize">{currentDate.dayName}</h2>
              <p className="text-xs text-gray-400 font-medium">Heure locale de Casablanca</p>
            </div>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex -space-x-3 overflow-hidden">
              {otherProfs.map((p, index) => (
                <div key={index} title={`${p['Prénom'] || ''} ${p['Nom'] || ''}`} className="inline-block relative">
                  {p.image_url || p.photo ? (
                    <img 
                      src={p.image_url || p.photo} 
                      alt="Professeur" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xs">
                      {(p['Prénom'] || 'P')[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-500 ml-2">+{otherProfs.length} profs</span>
          </div>

        </header>

        {/* SECTION BIENVENUE & STATUT */}
        <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 capitalize">
              Bonjour, {profName} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Voici le récapitulatif de votre activité sur Prof Maroc.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-600 pl-2">Mon Statut :</span>
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {isAvailable ? '🟢 Disponible' : '🔴 Occupé'}
            </button>
          </div>
        </div>

        {/* CARTES DE STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100 hover:shadow-md transition">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Demandes reçues</p>
            <p className="text-5xl font-black text-gray-900 mt-3">{totalLeads}</p>
            <p className="text-xs text-gray-400 mt-2">Total des élèves intéressés par vos cours</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xs border border-gray-100 hover:shadow-md transition">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Élèves acceptés</p>
            <p className="text-5xl font-black text-orange-600 mt-3">{acceptedLeads}</p>
            <p className="text-xs text-gray-400 mt-2">Mises en relation validées avec succès</p>
          </div>
        </div>

      </main>
    </div>
  );
}