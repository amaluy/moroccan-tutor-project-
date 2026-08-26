'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Sparkles, Bot, Send, RefreshCw, CheckCircle, Trash2, CreditCard, Building2, User, Hash } from 'lucide-react';
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
      // 1. Professeurs validés
      const { data: profsData, error: profsError } = await supabase.from('professors').select('*');
      if (profsError) setDbError(profsError.message);
      else if (profsData) setProfesseursExistants(profsData);

      // 2. Demandes en attente (table requests)
      const { data: reqsData, error: reqsError } = await supabase.from('requests').select('*');
      if (reqsError) {
        setDbError(reqsError.message);
        const localSubmissions = localStorage.getItem('professeurs_soumissions') || localStorage.getItem('donner_cours_list');
        if (localSubmissions) setProfesseursNouveaux(JSON.parse(localSubmissions));
      } else if (reqsData) {
        setProfesseursNouveaux(reqsData);
      }
    } catch (err: any) {
      setDbError(err.message || 'Erreur réseau');
    } finally {
      setIsLoadingDb(false);
    }
  };

  // Valider une demande spécifique manuellement en utilisant les colonnes exactes
  const handleApproveRequest = async (reqItem: any) => {
    try {
      const fullName = `${reqItem.prenom || ''} ${reqItem.nom || ''}`.trim() || 'Nouveau Professeur';
      
      const newProf = {
        name: fullName,
        subject: reqItem.matiere || 'Soutien scolaire',
        location: reqItem.ville || 'Casablanca',
        price: reqItem.tarif ? parseFloat(reqItem.tarif) : 200,
        description: reqItem.dernier_diplome ? `Dernier diplôme : ${reqItem.dernier_diplome}` : 'Professeur qualifié vérifié et validé.',
        rating: 5.0,
        reviewsCount: 1,
        isConfirmed: true,
        firstLessonFree: true
      };

      // 1. Insérer dans la table professors
      const { error: insertError } = await supabase.from('professors').insert([newProf]);
      if (insertError) throw insertError;

      // 2. Supprimer de la table requests
      if (reqItem.id) {
        await supabase.from('requests').delete().eq('id', reqItem.id);
      }

      // 3. Envoyer la notification par email au professeur
      await fetch('/api/notify-professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reqItem.email, name: fullName })
      }).catch(() => {});

      await fetchDataFromSupabase();
      alert(`Le profil de ${fullName} a été activé avec succès et publié sur le site !`);
    } catch (err: any) {
      alert(`Erreur lors de la validation : ${err.message}`);
    }
  };

  // Supprimer / Rejeter une demande
  const handleRejectRequest = async (id: string) => {
    if (!confirm("Voulez-vous vraiment rejeter cette demande ?")) return;
    try {
      await supabase.from('requests').delete().eq('id', id);
      await fetchDataFromSupabase();
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    }
  };

  // Fonction de validation automatisée par l'IA
  const handleAiValidateAll = async () => {
    if (professeursNouveaux.length === 0) {
      return "Il n'y a aucune nouvelle demande en attente pour le moment !";
    }

    try {
      for (const reqItem of professeursNouveaux) {
        await handleApproveRequest(reqItem);
      }
      return `✨ Mission accomplie ! J'ai validé et transféré avec succès ${professeursNouveaux.length} professeur(s) dans la table 'professors'. Ils sont en ligne sur le site !`;
    } catch (err: any) {
      return `Oups, une erreur est survenue : ${err.message}`;
    }
  };

  // Gestion de la discussion avec l'IA
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
    } else if (lower.includes('combien') || lower.includes('statistiques')) {
      aiReply = `📊 Actuellement, la base contient ${professeursExistants.length} professeur(s) actif(s) et ${professeursNouveaux.length} demande(s) en attente.`;
    } else if (lower.includes('bonjour') || lower.includes('salut')) {
      aiReply = `Bonjour Amal ! Comment puis-je t'aider à gérer tes professeurs aujourd'hui ?`;
    } else {
      aiReply = `J'ai bien reçu ta consigne ("${userMsg}"). Tu peux me dire de valider les nouveaux profs en écrivant par exemple : "Valide tous les nouveaux profs".`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: aiReply }]);
    }, 500);
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
            <p className="text-xs text-gray-500">Agent IA actif et synchronisé avec Supabase.</p>
          </div>
        </div>

        <Link href="/" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site</span>
        </Link>
      </header>

      <main className="max-w-[95rem] mx-auto px-6 py-10">
        
        {/* Onglets */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('ia_agent')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'ia_agent' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Assistant IA Actif</span>
          </button>

          <button
            onClick={() => setActiveTab('existants')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'existants' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Professeurs ({professeursExistants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('nouveaux')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'nouveaux' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FF5A5F]" />
            <span>Demandes & Paiements ({professeursNouveaux.length})</span>
          </button>
        </div>

        {/* SECTION : ASSISTANT IA */}
        {activeTab === 'ia_agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30 inline-flex items-center gap-1 mb-3">
                  <Sparkles className="w-3 h-3" /> Automatisation
                </span>
                <h2 className="text-xl font-black mb-2">Commandes Rapides</h2>
                <p className="text-purple-200 text-xs mb-5 leading-relaxed">
                  Discute avec l'IA pour valider instantanément les demandes en attente et les envoyer dans la base de données.
                </p>

                <button
                  onClick={async () => {
                    const res = await handleAiValidateAll();
                    setMessages(prev => [...prev, { role: 'assistant', text: res }]);
                  }}
                  className="w-full py-3 bg-white text-purple-900 hover:bg-purple-50 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>Valider toutes les demandes</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[550px]">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50 rounded-t-3xl">
                <Bot className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-sm text-gray-800">Agent IA (Prêt à exécuter tes ordres)</span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none font-medium'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ex: 'Valide tous les nouveaux profs'..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SECTION : PROFESSEURS EXISTANTS */}
        {activeTab === 'existants' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-900">Professeurs Actifs</h2>
              <button onClick={fetchDataFromSupabase} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professeursExistants.map((p, i) => (
                <div key={p.id || i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                    <p className="text-xs text-gray-500">{p.subject} • {p.location}</p>
                  </div>
                  <span className="font-bold text-sm text-emerald-600">{p.price} MAD/h</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION : DEMANDES & PAIEMENTS SOUS FORME DE TABLEAU */}
        {activeTab === 'nouveaux' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-gray-900">Demandes de professeurs & Preuves de paiement</h2>
                <p className="text-xs text-gray-500">Visualisez l'ensemble des données de la table requests et gérez les validations.</p>
              </div>
              <button onClick={fetchDataFromSupabase} className="px-4 py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer">
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
            </div>

            {professeursNouveaux.length === 0 ? (
              <p className="text-gray-400 text-sm py-12 text-center">Aucune nouvelle demande en attente.</p>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                      <th className="p-3">Date</th>
                      <th className="p-3">Prénom & Nom</th>
                      <th className="p-3">Âge</th>
                      <th className="p-3">Ville</th>
                      <th className="p-3">Matière</th>
                      <th className="p-3">Diplôme</th>
                      <th className="p-3">Tarif</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Paiement / Reçu</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {professeursNouveaux.map((req, i) => (
                      <tr key={req.id || i} className="hover:bg-gray-50/80 transition">
                        <td className="p-3 text-gray-500 whitespace-nowrap">
                          {req.date_de_demande ? new Date(req.date_de_demande).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                          {req.prenom || ''} {req.nom || ''}
                        </td>
                        <td className="p-3 text-gray-600">{req.age || 'N/A'}</td>
                        <td className="p-3 font-medium text-gray-800">{req.ville || 'N/A'}</td>
                        <td className="p-3 text-gray-800 font-semibold">{req.matiere || 'N/A'}</td>
                        <td className="p-3 text-gray-600 truncate max-w-[150px]" title={req.dernier_diplome}>
                          {req.dernier_diplome || 'N/A'}
                        </td>
                        <td className="p-3 font-bold text-emerald-600 whitespace-nowrap">
                          {req.tarif ? `${req.tarif} MAD` : 'N/A'}
                        </td>
                        <td className="p-3 text-gray-600">
                          <div>{req.email || 'N/A'}</div>
                          <div className="text-gray-400 font-mono text-[11px]">{req.telephone ? `0${req.telephone}` : ''}</div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5 whitespace-nowrap">
                            <span className="font-bold text-gray-800 block">Reçu: #{req.numero_de_recu || 'N/A'}</span>
                            <span className="text-purple-600 font-mono bg-purple-50 px-1.5 py-0.5 rounded text-[10px] inline-block">
                              Trans: {req.numero_de_transaction || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApproveRequest(req)}
                              title="Accepter & Activer"
                              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition cursor-pointer shadow-xs"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              title="Rejeter"
                              className="p-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}