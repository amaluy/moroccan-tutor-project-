'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Users, CheckCircle, Trash2, Image as ImageIcon, Eye, X, Clock, 
  ArrowLeft 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RequestsPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'nouveaux' | 'existants'>('nouveaux');
  const [professeursNouveaux, setProfesseursNouveaux] = useState<any[]>([]);
  const [professeursExistants, setProfesseursExistants] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchDataFromSupabase();
  }, []);

  const fetchDataFromSupabase = async () => {
    setIsLoadingDb(true);
    try {
      // 1. Récupérer les nouvelles demandes
      const { data: reqsData } = await supabase.from('requests').select('*');
      if (reqsData) setProfesseursNouveaux(reqsData);

      // 2. Récupérer les professeurs existants
      const { data: profsData } = await supabase.from('professors').select('*');
      if (profsData) setProfesseursExistants(profsData);
    } catch (err: any) {
      console.error("Erreur de chargement:", err.message);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleApproveRequest = async (reqItem: any) => {
    try {
      const pName = reqItem['Prénom'] || reqItem.prenom || '';
      const nName = reqItem['Nom'] || reqItem.nom || '';
      const fullName = (`${pName} ${nName}`).trim() || 'Nouveau Professeur';
      const profEmail = reqItem.email || '';

      let newProf: any = {};
      const fieldsToMap = [
        'Prénom', 'Nom', 'age', 'ville', 'profession', 'dernier diplome', 
        'tarif', 'email', 'telephone', 'numero de recu', 'photo_URL', 
        'numero de transaction', 'disponibilities', 'type_cours', 
        'distance_max', 'frais_deplacement', 'statut', 'experience', 
        'niveau', 'bio', 'matiere'
      ];

      fieldsToMap.forEach(field => {
        if (reqItem[field] !== undefined) {
          newProf[field] = reqItem[field];
        }
      });

      newProf.is_approved = true;

      const { error: insertError } = await supabase.from('professors').insert([newProf]);
      if (insertError) throw insertError;

      if (profEmail) {
        await supabase.from('leads').insert([{ email: profEmail, created_at: new Date().toISOString() }]);
      }

      if (reqItem.id) {
        await supabase.from('requests').delete().eq('id', reqItem.id);
      }

      setSelectedRequest(null);
      await fetchDataFromSupabase();
      alert(`Le profil de ${fullName} a été accepté et publié avec succès !`);
    } catch (err: any) {
      alert(`Erreur lors de la validation : ${err.message}`);
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (!confirm("Voulez-vous vraiment rejeter cette demande ? Elle sera supprimée.")) return;
    try {
      const { error } = await supabase.from('requests').delete().eq('id', id);
      if (error) throw error;

      setSelectedRequest(null);
      await fetchDataFromSupabase();
      alert("La demande a été rejetée.");
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  const renderAvailabilityGrid = (disponibilites: any) => {
    const days = [
      { key: 'lu', label: 'Lu' }, { key: 'ma', label: 'Ma' },
      { key: 'me', label: 'Me' }, { key: 'je', label: 'Je' },
      { key: 've', label: 'Ve' }, { key: 'sa', label: 'Sa' },
      { key: 'di', label: 'Di' },
    ];
    const slots = [
      { key: 'matin', label: 'Matin' },
      { key: 'midi', label: 'Midi' },
      { key: 'apresmidi', label: 'Après-midi' },
    ];

    let items: string[] = [];
    if (Array.isArray(disponibilites)) {
      items = disponibilites.map(item => String(item).toLowerCase().trim());
    } else if (typeof disponibilites === 'string') {
      items = disponibilites.split(',').map(item => item.toLowerCase().trim());
    }

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 text-red-500 font-bold text-xs">
          <Clock className="w-4 h-4" /> <span>Disponibilité</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-400 font-medium"></th>
                {days.map(d => <th key={d.key} className="p-2 font-bold text-gray-700">{d.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {slots.map(({ key: slotKey, label }) => (
                <tr key={slotKey}>
                  <td className="p-2 text-left font-medium text-gray-700">{label}</td>
                  {days.map(d => {
                    const targetCode1 = `${slotKey}-${d.key}`;
                    const targetCode2 = `${d.key}-${slotKey}`;
                    const isAvailable = items.some(item => item === targetCode1 || item === targetCode2 || item.includes(targetCode1));
                    return (
                      <td key={d.key} className="p-2">
                        <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center transition ${isAvailable ? 'bg-sky-200/80' : 'bg-gray-100/60 opacity-40'}`}>
                          {isAvailable && <div className="w-3 h-3 rounded-full bg-sky-400"></div>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans p-8 space-y-8">
      <div className="max-w-[95rem] mx-auto space-y-6">
        
        {/* En-tête / Bouton de retour */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition cursor-pointer flex items-center gap-2 text-xs font-bold text-gray-700 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Retour au Dashboard</span>
          </button>
        </div>

        {/* Section Principale avec les onglets (comme sur vos images) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap gap-3 border-b border-gray-100 pb-4">
            <button 
              onClick={() => setActiveTab('nouveaux')} 
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${activeTab === 'nouveaux' ? 'bg-[#103D3B] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#FF5A5F]" /> <span>Demandes en attente ({professeursNouveaux.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('existants')} 
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${activeTab === 'existants' ? 'bg-[#103D3B] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Users className="w-3.5 h-3.5 text-blue-500" /> <span>Professeurs Actifs ({professeursExistants.length})</span>
            </button>
          </div>

          {activeTab === 'nouveaux' && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-gray-900">Validation des profs & Preuves de paiement</h2>

              {isLoadingDb ? (
                <p className="text-gray-400 text-sm py-12 text-center">Chargement des demandes...</p>
              ) : professeursNouveaux.length === 0 ? (
                <p className="text-gray-400 text-sm py-12 text-center">Aucune nouvelle demande en attente pour le moment !</p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                        <th className="p-3">Photo</th>
                        <th className="p-3">Nom complet</th>
                        <th className="p-3">Profession</th>
                        <th className="p-3">Ville</th>
                        <th className="p-3">Matière</th>
                        <th className="p-3">Tarif</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Reçu / Transaction</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {professeursNouveaux.map((req, i) => {
                        const fullName = (`${req['Prénom'] || req.prenom || ''} ${req['Nom'] || req.nom || ''}`).trim() || 'N/A';
                        const photoUrl = req.photo_url || req.photo_URL || '';
                        const recuVal = req['numero de recu'];
                        const transVal = req['numero de transaction'];

                        return (
                          <tr key={req.id || i} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedRequest(req)}>
                            <td className="p-3 whitespace-nowrap">
                              {photoUrl ? (
                                <img src={photoUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover border shadow-2xs" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                            </td>
                            <td className="p-3 font-bold text-gray-900">{fullName}</td>
                            <td className="p-3 font-medium text-purple-700">{req.profession || 'N/A'}</td>
                            <td className="p-3 font-medium text-gray-800">{req.ville || req.city || 'N/A'}</td>
                            <td className="p-3 font-semibold text-gray-800">{req.matiere || req.subject || 'N/A'}</td>
                            <td className="p-3 font-bold text-emerald-600">{req.tarif ? `${req.tarif} MAD` : 'N/A'}</td>
                            <td className="p-3 text-gray-600">
                              <div>{req.email}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{req.telephone}</div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {recuVal && <span className="font-bold text-gray-800 block">Reçu: #{recuVal}</span>}
                              {transVal && <span className="text-indigo-600 font-mono bg-indigo-50 px-1 py-0.5 rounded text-[10px]">Trans: {transVal}</span>}
                            </td>
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => setSelectedRequest(req)} title="Détails" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => handleApproveRequest(req)} title="Valider" className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-2xs cursor-pointer"><CheckCircle className="w-4 h-4" /></button>
                                <button onClick={() => handleRejectRequest(req.id)} title="Rejeter" className="p-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'existants' && (
            <div className="space-y-4">
              <h2 className="text-base font-black text-gray-900">Professeurs Actifs sur le site</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professeursExistants.map((p, i) => (
                  <div key={p.id || i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {p.photo_url || p.photo_URL ? (
                        <img src={p.photo_url || p.photo_URL} alt="" className="w-10 h-10 rounded-full object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">?</div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{`${p.Prénom || ''} ${p.Nom || ''}`.trim()}</h3>
                        <p className="text-xs text-gray-500">{p.matiere || p.subject} • <strong className="text-purple-700">{p.ville || p.city}</strong></p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-emerald-600">{p.tarif || p.price} MAD/h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODALE DE DÉTAIL D'UNE DEMANDE */}
      {selectedRequest && (() => {
        const photoUrl = selectedRequest.photo_url || selectedRequest.photo_URL;
        const fullName = (`${selectedRequest['Prénom'] || selectedRequest.prenom || ''} ${selectedRequest['Nom'] || selectedRequest.nom || ''}`).trim() || 'Détails';

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 p-8 relative">
              <button onClick={() => setSelectedRequest(null)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer"><X className="w-5 h-5" /></button>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="shrink-0 relative group cursor-pointer" onClick={() => photoUrl && setPreviewImage(photoUrl)}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-purple-200 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">?</div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{fullName}</h3>
                  <p className="text-purple-600 font-bold text-sm">{selectedRequest.profession || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="text-gray-400 block font-medium mb-0.5">Ville</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedRequest.ville || selectedRequest.city || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="text-gray-400 block font-medium mb-0.5">Tarif horaire</span>
                  <span className="font-bold text-emerald-600 text-sm">{selectedRequest.tarif ? `${selectedRequest.tarif} MAD` : 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  {renderAvailabilityGrid(selectedRequest.disponibilities || selectedRequest.disponibilites || '')}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button onClick={() => handleRejectRequest(selectedRequest.id)} className="px-5 py-3 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl cursor-pointer">Rejeter</button>
                <button onClick={() => handleApproveRequest(selectedRequest)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> <span>Accepter & Publier</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* VISIONNEUSE PHOTO EN GRAND */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Grand format" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
        </div>
      )}

    </div>
  );
}