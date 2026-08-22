'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, BookOpen, GraduationCap, CheckCircle, AlertCircle, Eye, Coins } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'profs' | 'eleves'>('profs');

  const [professeurs, setProfesseurs] = useState<any[]>([]);
  const [annoncesEleves, setAnnoncesEleves] = useState<any[]>([]);

  useEffect(() => {
    // Forcer l'accès admin pour toi instantanément
    localStorage.setItem('user_email', 'berrada0amal@gmail.com');
    localStorage.setItem('is_admin', 'true');
    setAuthorized(true);

    // Charger les soumissions réelles du formulaire "Donner un cours"
    const savedSubmissions = localStorage.getItem('professeurs_soumissions') || localStorage.getItem('donner_cours_list');
    
    if (savedSubmissions) {
      try {
        let parsedProfs = JSON.parse(savedSubmissions);
        if (Array.isArray(parsedProfs)) {
          // Tri automatique par nombre de leads payés (du plus grand au plus petit)
          parsedProfs.sort((a: any, b: any) => (b.leadsPayes || 0) - (a.leadsPayes || 0));
          setProfesseurs(parsedProfs);
        }
      } catch (e) {
        console.error("Erreur de lecture des données profs", e);
      }
    }
  }, []);

  const updateAndSaveProfs = (newList: any[]) => {
    newList.sort((a, b) => (b.leadsPayes || 0) - (a.leadsPayes || 0));
    setProfesseurs(newList);
    localStorage.setItem('professeurs_soumissions', JSON.stringify(newList));
  };

  const validerProf = (indexOrId: any) => {
    const updated = professeurs.map((p, idx) => (p.id === indexOrId || idx === indexOrId) ? { ...p, statut: 'valide' } : p);
    updateAndSaveProfs(updated);
  };

  const supprimerProf = (indexOrId: any) => {
    const updated = professeurs.filter((p, idx) => p.id !== indexOrId && idx !== indexOrId);
    updateAndSaveProfs(updated);
  };

  const modifierLeads = (indexOrId: any, delta: number) => {
    const updated = professeurs.map((p, idx) => {
      if (p.id === indexOrId || idx === indexOrId) {
        const currentLeads = p.leadsPayes || 0;
        const newLeads = Math.max(0, currentLeads + delta);
        return { ...p, leadsPayes: newLeads };
      }
      return p;
    });
    updateAndSaveProfs(updated);
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Chargement de l'espace administration...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Top Header Admin */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 text-white rounded-xl">
            <ShieldAlert className="w-6 h-6 text-[#FF5A5F]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Espace Administration & Modération</h1>
            <p className="text-xs text-gray-500">Contrôle des formulaires de cours et gestion des leads payants.</p>
          </div>
        </div>

        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Onglets */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('profs')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'profs'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FF5A5F]" />
            <span>Formulaires Professeurs ({professeurs.filter(p => p.statut === 'en_attente' || !p.statut).length} en attente)</span>
          </button>

          <button
            onClick={() => setActiveTab('eleves')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'eleves'
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-500" />
            <span>Annonces Élèves ({annoncesEleves.length} en attente)</span>
          </button>
        </div>

        {/* SECTION PROFESSEURS */}
        {activeTab === 'profs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Soumissions réelles du formulaire "Donner un cours"</h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Triés par leads payés (du plus haut au plus bas)
              </span>
            </div>

            {professeurs.length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <BookOpen className="w-10 h-10 text-gray-300" />
                <p>Aucun professeur n'a encore rempli le formulaire "Donner un cours".</p>
                <p className="text-xs text-gray-400">Dès qu'un professeur soumettra son formulaire, ses données apparaîtront ici en totalité.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-extrabold border-b border-gray-100">
                      <th className="p-4">Professeur & Profil</th>
                      <th className="p-4">Titre & Description complète</th>
                      <th className="p-4">Lieu & Tarif</th>
                      <th className="p-4">Leads Payés (Classement)</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Actions Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {professeurs.map((prof, index) => (
                      <tr key={prof.id || index} className="hover:bg-gray-50/50 transition">
                        {/* 1. Infos profil */}
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{prof.profil?.nom || prof.nom || 'Nom non renseigné'}</div>
                          <div className="text-xs text-gray-500">{prof.profil?.email || prof.email}</div>
                          {prof.profil?.telephone && <div className="text-xs text-gray-400">{prof.profil.telephone}</div>}
                        </td>

                        {/* 2. Titre et Description complète */}
                        <td className="p-4">
                          <div className="font-semibold text-gray-800">{prof.titre || 'Sans titre'}</div>
                          <div className="text-xs text-gray-600 max-w-sm mt-1 whitespace-pre-line">
                            {prof.description || prof.bio || 'Aucune description fournie.'}
                          </div>
                          {prof.succes && (
                            <div className="text-[11px] text-emerald-600 font-medium mt-1">
                              Succès/Exp: {prof.succes}
                            </div>
                          )}
                        </td>

                        {/* 3. Lieu et Tarif */}
                        <td className="p-4 text-gray-600">
                          <div className="font-bold text-gray-900">{prof.tarif || prof.tarifHoraire || 'N/A'}</div>
                          <div className="text-xs text-gray-400">{prof.lieu || prof.ville || 'Non spécifié'}</div>
                        </td>

                        {/* 4. Leads Payés (Contrôle + Classement) */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <Coins className="w-3.5 h-3.5" /> {prof.leadsPayes || 0} leads
                            </span>
                            <div className="flex flex-col gap-0.5">
                              <button 
                                onClick={() => modifierLeads(prof.id || index, 1)}
                                className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold rounded cursor-pointer"
                                title="Ajouter un lead payé"
                              >
                                +
                              </button>
                              <button 
                                onClick={() => modifierLeads(prof.id || index, -1)}
                                className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold rounded cursor-pointer"
                                title="Retirer un lead"
                              >
                                -
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 5. Statut */}
                        <td className="p-4">
                          {prof.statut === 'valide' ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                              <CheckCircle className="w-3.5 h-3.5" /> Publié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5" /> En attente
                            </span>
                          )}
                        </td>

                        {/* 6. Actions */}
                        <td className="p-4 text-right space-x-2">
                          <Link
                            href={`/professeurs/${prof.id || index}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Voir
                          </Link>

                          {prof.statut !== 'valide' && (
                            <button
                              onClick={() => validerProf(prof.id || index)}
                              className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              Accepter
                            </button>
                          )}

                          <button
                            onClick={() => supprimerProf(prof.id || index)}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#FF5A5F] font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION ÉLÈVES */}
        {activeTab === 'eleves' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Annonces des Élèves</h2>
              <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200">
                Aucune soumission pour l'instant
              </span>
            </div>

            <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center gap-3">
              <GraduationCap className="w-10 h-10 text-gray-300" />
              <p>Aucun élève n'a encore publié d'annonce sur la plateforme.</p>
              <p className="text-xs text-gray-400">Le tableau s'activera dès que tu coderas la section des élèves.</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}