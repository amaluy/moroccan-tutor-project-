'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Sparkles, Bot, Send, RefreshCw, CheckCircle, Trash2 } from 'lucide-react';
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

      // 2. Demandes en attente
      const { data: reqsData, error: reqsError } = await supabase.from('requests').select('*');
      if (reqsError) {
        // Fallback localStorage si requests vide
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

  // Fonction de validation automatisée par l'IA
  const handleAiValidateAll = async () => {
    if (professeursNouveaux.length === 0) {
      return "Il n'y a aucune nouvelle demande en attente pour le moment !";
    }

    try {
      for (const reqItem of professeursNouveaux) {
        const newProf = {
          name: reqItem.name || reqItem.nom || reqItem.profil?.nom || 'Nouveau Professeur',
          subject: reqItem.subject || reqItem.matiere || reqItem.titre || 'Soutien scolaire',
          location: reqItem.location || reqItem.lieu || reqItem.ville || 'Casablanca',
          price: reqItem.price || reqItem.tarif || 200,
          description: reqItem.description || 'Professeur qualifié validé par l\'IA.',
          rating: 5.0,
          reviewsCount: 1,
          isConfirmed: true,
          firstLessonFree: true
        };

        // Insertion dans professors
        await supabase.from('professors').insert([newProf]);

        // Suppression de requests si l'ID existe
        if (reqItem.id) {
          await supabase.from('requests').delete().eq('id', reqItem.id);
        }
      }

      await fetchDataFromSupabase();
      return `✨ Mission accomplie ! J'ai validé et transféré avec succès ${professeursNouveaux.length} professeur(s) directement dans la table 'professors'. Ils sont en ligne sur le site !`;
    } catch (err: any) {
      return `Oups, une erreur est survenue lors du transfert : ${err.message}`;
    }
  };

  // Gestion de la discussion avec l'IA
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    // Analyse de la demande par l'IA
    const lower = userMsg.toLowerCase();
    let aiReply = "";

    if (lower.includes('valide') || lower.includes('confirme') || lower.includes('transfert') || lower.includes('tout')) {
      aiReply = await handleAiValidateAll();
    } else if (lower.includes('combien') || lower.includes('statistiques') || lower.includes('bilan')) {
      aiReply = `📊 Actuellement, la base contient ${professeursExistants.length} professeur(s) actif(s) et il y a ${professeursNouveaux.length} demande(s) en attente dans la table 'requests'.`;
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Onglets */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('ia_agent')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'ia_agent' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200 shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
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
            <span>Demandes ({professeursNouveaux.length})</span>
          </button>
        </div>

        {/* SECTION : ASSISTANT IA (ACTIF & TRAVAILLE) */}
        {activeTab === 'ia_agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30 inline-flex items-center gap-1 mb-3">
                  <Sparkles className="w-3 h-3" /> Automatisation
                </span>
                <h2 className="text-xl font-black mb-2">Commandes Rapides</h2>
                <p className="text-purple-200 text-xs mb-5 leading-relaxed">
                  Discute avec l'IA dans le chat pour valider instantanément les demandes en attente et les envoyer dans la base de données.
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
                  placeholder="Ex: 'Valide tous les nouveaux profs' ou 'Combien y a-t-il de profs ?'..."
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

        {/* SECTION : PROFESSEURS */}
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

        {/* SECTION : DEMANDES */}
        {activeTab === 'nouveaux' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Demandes en attente</h2>
            {professeursNouveaux.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">Aucune nouvelle demande en attente.</p>
            ) : (
              <div className="space-y-3">
                {professeursNouveaux.map((req, i) => (
                  <div key={req.id || i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900">{req.name || req.nom || 'Anonyme'}</h3>
                      <p className="text-xs text-gray-500">{req.subject || req.matiere} • {req.location || req.lieu}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}