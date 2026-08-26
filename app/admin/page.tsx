'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Sparkles, Bot, Send, RefreshCw, CheckCircle, Trash2, Image as ImageIcon, Eye, X, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'ia_agent' | 'existants' | 'nouveaux'>('ia_agent');

  const [professeursNouveaux, setProfesseursNouveaux] = useState<any[]>([]);
  const [professeursExistants, setProfesseursExistants] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: "Bonjour Amal ! Je suis ton assistant IA. Je surveille tes tables Supabase 'professors' et 'requests'. Dis-moi par exemple : 'Valide tous les nouveaux profs' ou demande-moi le statut de la plateforme !" }
  ]);

  useEffect(() => {
    localStorage.setItem('user_email', 'berrada0amal@gmail.com');
    localStorage.setItem('is_admin', 'true');
    setAuthorized(true);

    fetchDataFromSupabase();
  }, []);

  const fetchDataFromSupabase = async () => {
    setIsLoadingDb(true);
    setDbError(null);

    try {
      const { data: profsData, error: profsError } = await supabase.from('professors').select('*');
      if (profsError) setDbError(profsError.message);
      else if (profsData) setProfesseursExistants(profsData);

      const { data: reqsData, error: reqsError } = await supabase.from('requests').select('*');
      if (reqsError) {
        setDbError(reqsError.message);
      } else if (reqsData) {
        setProfesseursNouveaux(reqsData);
      }
    } catch (err: any) {
      setDbError(err.message || 'Erreur réseau');
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleApproveRequest = async (reqItem: any) => {
    try {
      const pName = reqItem['Prénom'] || reqItem.prenom || '';
      const nName = reqItem['Nom'] || reqItem.nom || '';
      const fullName = (`${pName} ${nName}`).trim() || 'Nouveau Professeur';
      
      const newProf = {
        name: fullName,
        subject: reqItem.matiere || 'Soutien scolaire',
        location: reqItem.ville || 'Casablanca',
        price: reqItem.tarif ? parseFloat(reqItem.tarif) : 200,
        description: reqItem['dernier diplome'] ? `Dernier diplôme : ${reqItem['dernier diplome']}` : 'Professeur qualifié vérifié et validé.',
        rating: 5.0,
        reviewsCount: 1,
        isConfirmed: true,
        firstLessonFree: true,
        photo_URL: reqItem.photo_URL || reqItem['photo_url'] || ''
      };

      const { error: insertError } = await supabase.from('professors').insert([newProf]);
      if (insertError) throw insertError;

      if (reqItem.id) {
        await supabase.from('requests').delete().eq('id', reqItem.id);
      }

      if (reqItem.email) {
        await fetch('/api/notify-professor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: reqItem.email, name: fullName })
        }).catch(() => {});
      }

      setSelectedRequest(null);
      await fetchDataFromSupabase();
      alert(`Le profil de ${fullName} a été activé avec succès et publié sur le site !`);
    } catch (err: any) {
      alert(`Erreur lors de la validation : ${err.message}`);
    }
  };

  const handleRejectRequest = async (id: string) => {
    if (!confirm("Voulez-vous vraiment rejeter cette demande ?")) return;
    try {
      await supabase.from('requests').delete().eq('id', id);
      setSelectedRequest(null);
      await fetchDataFromSupabase();
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  const handleAiValidateAll = async () => {
    if (professeursNouveaux.length === 0) {
      return "Il n'y a aucune nouvelle demande en attente pour le moment !";
    }
    try {
      for (const reqItem of professeursNouveaux) {
        await handleApproveRequest(reqItem);
      }
      return `✨ Mission accomplie ! J'ai validé et transféré avec succès ${professeursNouveaux.length} professeur(s).`;
    } catch (err: any) {
      return `Oups, une erreur est survenue : ${err.message}`;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    const lower = userMsg.toLowerCase();
    let aiReply = "";

    if (lower.includes('valide') || lower.includes('confirme') || lower.includes('tout')) {
      aiReply = await handleAiValidateAll();
    } else {
      aiReply = `J'ai bien reçu ta consigne ("${userMsg}").`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: aiReply }]);
    }, 500);
  };

  // Grille des disponibilités analysant précisément le tableau text[] de Supabase
  const renderAvailabilityGrid = (disponibilites: any) => {
    const days = [
      { key: 'lu', label: 'Lu' },
      { key: 'ma', label: 'Ma' },
      { key: 'me', label: 'Me' },
      { key: 'je', label: 'Je' },
      { key: 've', label: 'Ve' },
      { key: 'sa', label: 'Sa' },
      { key: 'di', label: 'Di' },
    ];

    let items: string[] = [];
    if (Array.isArray(disponibilites)) {
      items = disponibilites.map(item => String(item).toLowerCase());
    } else if (typeof disponibilites === 'string') {
      items = disponibilites.split(',').map(item => item.trim().toLowerCase());
    }

    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-red-500 font-bold text-xs">
          <Clock className="w-4 h-4" />
          <span>Disponibilité</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-400 font-medium"></th>
                {days.map(d => (
                  <th key={d.key} className="p-2 font-bold text-gray-700">{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {['matin', 'midi', 'apres-midi'].map(slotKey => {
                const slotLabel = slotKey === 'apres-midi' ? 'Après-midi' : slotKey.charAt(0).toUpperCase() + slotKey.slice(1);
                
                return (
                  <tr key={slotKey}>
                    <td className="p-2 text-left font-medium text-gray-700 whitespace-nowrap">{slotLabel}</td>
                    {days.map(d => {
                      const isAvailable = items.some(item => 
                        (item.includes(slotKey) || item.includes(slotKey.replace('-', ''))) && 
                        item.includes(d.key)
                      );

                      return (
                        <td key={d.key} className="p-2">
                          <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center transition ${isAvailable ? 'bg-sky-200/80 shadow-xs' : 'bg-gray-100/60 opacity-40'}`}>
                            {isAvailable && <div className="w-3 h-3 rounded-full bg-sky-400"></div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Administration Supabase & IA <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h1>
          </div>
        </div>
        <Link href="/" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site</span>
        </Link>
      </header>

      <main className="max-w-[98rem] mx-auto px-6 py-10">
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('ia_agent')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${activeTab === 'ia_agent' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            <Bot className="w-4 h-4" /> <span>Assistant IA Actif</span>
          </button>
          <button onClick={() => setActiveTab('existants')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${activeTab === 'existants' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            <Users className="w-4 h-4 text-blue-500" /> <span>Professeurs ({professeursExistants.length})</span>
          </button>
          <button onClick={() => setActiveTab('nouveaux')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${activeTab === 'nouveaux' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            <BookOpen className="w-4 h-4 text-[#FF5A5F]" /> <span>Demandes & Paiements ({professeursNouveaux.length})</span>
          </button>
        </div>

        {activeTab === 'ia_agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <h2 className="text-xl font-black mb-2">Commandes Rapides</h2>
                <button onClick={async () => { const res = await handleAiValidateAll(); setMessages(prev => [...prev, { role: 'assistant', text: res }]); }} className="w-full py-3 bg-white text-purple-900 hover:bg-purple-50 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer">
                  <Bot className="w-4 h-4 text-purple-600" /> <span>Valider toutes les demandes</span>
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[550px]">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ex: 'Valide tous les nouveaux profs'..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none" />
                <button type="submit" className="px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl cursor-pointer"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'existants' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-6">Professeurs Actifs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professeursExistants.map((p, i) => (
                <div key={p.id || i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {p.photo_URL ? (
                      <img src={p.photo_URL} alt={p.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                        {p.name ? p.name.charAt(0) : '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                      <p className="text-xs text-gray-500">{p.subject} • {p.location}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-emerald-600">{p.price} MAD/h</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nouveaux' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Demandes de professeurs & Preuves de paiement</h2>
              <button onClick={fetchDataFromSupabase} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} /> <span>Actualiser</span>
              </button>
            </div>

            {professeursNouveaux.length === 0 ? (
              <p className="text-gray-400 text-sm py-12 text-center">Aucune nouvelle demande en attente.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                      <th className="p-3">Photo</th>
                      <th className="p-3">Prénom & Nom</th>
                      <th className="p-3">Profession</th>
                      <th className="p-3">Âge</th>
                      <th className="p-3">Ville</th>
                      <th className="p-3">Matière</th>
                      <th className="p-3">Tarif</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Transaction / Reçu</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {professeursNouveaux.map((req, i) => {
                      const prenomVal = req['Prénom'] || req.prenom || '';
                      const nomVal = req['Nom'] || req.nom || '';
                      const fullName = (`${prenomVal} ${nomVal}`).trim() || 'N/A';
                      
                      const photoUrl = req.photo_URL || req['photo_url'] || '';
                      const professionVal = req.profession || 'N/A';
                      const ageVal = req.age || 'N/A';
                      const villeVal = req.ville || 'N/A';
                      const matiereVal = req.matiere || 'N/A';
                      const tarifVal = req.tarif;
                      const emailVal = req.email || 'N/A';
                      const telVal = req.telephone || '';
                      
                      const recuVal = req['numero de recu'] || 'N/A';
                      const transVal = req['numero de transaction'] || 'N/A';

                      return (
                        <tr key={req.id || i} className="hover:bg-gray-50/80 transition cursor-pointer" onClick={() => setSelectedRequest(req)}>
                          <td className="p-3 whitespace-nowrap">
                            {photoUrl ? (
                              <img src={photoUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover border shadow-xs" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                            {fullName}
                          </td>
                          <td className="p-3 font-medium text-purple-700">{professionVal}</td>
                          <td className="p-3 text-gray-600">{ageVal}</td>
                          <td className="p-3 font-medium text-gray-800">{villeVal}</td>
                          <td className="p-3 text-gray-800 font-semibold">{matiereVal}</td>
                          <td className="p-3 font-bold text-emerald-600 whitespace-nowrap">
                            {tarifVal ? `${tarifVal} MAD` : 'N/A'}
                          </td>
                          <td className="p-3 text-gray-600">
                            <div>{emailVal}</div>
                            <div className="text-gray-400 font-mono text-[11px]">{telVal}</div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="font-bold text-gray-800 block">Reçu: #{recuVal}</span>
                              <span className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] inline-block" title={transVal}>
                                Trans: {transVal}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => setSelectedRequest(req)} title="Voir tous les détails" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleApproveRequest(req)} title="Accepter & Activer" className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer shadow-xs">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleRejectRequest(req.id)} title="Rejeter" className="p-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
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
      </main>

      {/* MODALE DE DÉTAIL AGRANDIE AVEC PLANNING GRAPHIQUE */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 p-8 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              {(selectedRequest.photo_URL || selectedRequest['photo_url']) ? (
                <img 
                  src={selectedRequest.photo_URL || selectedRequest['photo_url']} 
                  alt="Profil" 
                  className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-purple-100" 
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-400 font-bold">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  {`${selectedRequest['Prénom'] || selectedRequest.prenom || ''} ${selectedRequest['Nom'] || selectedRequest.nom || ''}`.trim() || 'Détails du Professeur'}
                </h3>
                <p className="text-purple-600 font-bold text-sm">{selectedRequest.profession || 'Profession non spécifiée'}</p>
                <p className="text-xs text-gray-400 mt-1">Demande reçue le : {selectedRequest['date de demande'] ? new Date(selectedRequest['date de demande']).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Âge</span>
                <span className="font-bold text-gray-800 text-sm">{selectedRequest.age || 'N/A'} ans</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Ville</span>
                <span className="font-bold text-gray-800 text-sm">{selectedRequest.ville || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Matière enseignée</span>
                <span className="font-bold text-gray-800 text-sm">{selectedRequest.matiere || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Tarif horaire</span>
                <span className="font-bold text-emerald-600 text-sm">{selectedRequest.tarif ? `${selectedRequest.tarif} MAD` : 'N/A'}</span>
              </div>
              <div className="col-span-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Dernier diplôme</span>
                <span className="font-bold text-gray-800 text-sm">{selectedRequest['dernier diplome'] || 'N/A'}</span>
              </div>
              
              {/* DISPONIBILITÉS SOUS FORME DE GRAPHIQUE INTELLIGENT */}
              <div className="col-span-2">
                {renderAvailabilityGrid(selectedRequest.disponibilites || selectedRequest.disponibilités || '')}
              </div>

              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Email</span>
                <span className="font-bold text-gray-800">{selectedRequest.email || 'N/A'}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <span className="text-gray-400 block font-medium mb-0.5">Téléphone</span>
                <span className="font-bold text-gray-800">{selectedRequest.telephone || 'N/A'}</span>
              </div>
              <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
                <span className="text-purple-600 block font-medium mb-0.5">Numéro de reçu</span>
                <span className="font-bold text-purple-900">#{selectedRequest['numero de recu'] || 'N/A'}</span>
              </div>
              <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
                <span className="text-indigo-600 block font-medium mb-0.5">Numéro de transaction</span>
                <span className="font-bold text-indigo-900 font-mono">{selectedRequest['numero de transaction'] || 'N/A'}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <button onClick={() => handleRejectRequest(selectedRequest.id)} className="px-5 py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition cursor-pointer">
                Rejeter la demande
              </button>
              <button onClick={() => handleApproveRequest(selectedRequest)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md cursor-pointer flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Accepter & Publier sur le site</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}