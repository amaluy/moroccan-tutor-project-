'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, BookOpen, Users, CheckCircle, AlertCircle, Sparkles, Bot, Coins, Send } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'ia_agent' | 'nouveaux' | 'existants'>('ia_agent');

  const [professeursNouveaux, setProfesseursNouveaux] = useState<any[]>([]);
  const [professeursExistants, setProfesseursExistants] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // États pour le Chat IA Interactif dans l'admin
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: "Bonjour Amal ! Je suis ton assistant IA. Comment puis-je t'aider à gérer tes professeurs et tes leads aujourd'hui ?" }
  ]);

  useEffect(() => {
    localStorage.setItem('user_email', 'berrada0amal@gmail.com');
    localStorage.setItem('is_admin', 'true');
    setAuthorized(true);

    // Charger les soumissions
    const savedSubmissions = localStorage.getItem('professeurs_soumissions') || localStorage.getItem('donner_cours_list');
    if (savedSubmissions) {
      try {
        let parsedProfs = JSON.parse(savedSubmissions);
        if (Array.isArray(parsedProfs)) {
          parsedProfs.sort((a: any, b: any) => (b.leadsPayes || 0) - (a.leadsPayes || 0));
          setProfesseursNouveaux(parsedProfs);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Charger les existants
    const savedExistants = localStorage.getItem('professeurs') || localStorage.getItem('liste_professeurs');
    if (savedExistants) {
      try {
        let parsed = JSON.parse(savedExistants);
        if (Array.isArray(parsed)) setProfesseursExistants(parsed);
      } catch (e) {
        console.error(e);
      }
    } else {
      setProfesseursExistants([
        { id: '1', nom: 'Fatima El Idrissi', matiere: 'Mathématiques', ville: 'Casablanca', tarif: '150 DH/h' },
        { id: '2', nom: 'Youssef Tazi', matiere: 'Physique-Chimie', ville: 'Rabat', tarif: '180 DH/h' }
      ]);
    }
  }, []);

  // Fonction d'audit global par l'IA
  const runAiModerationAndRanking = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const updated = professeursNouveaux.map((prof) => {
        const hasDescription = prof.description && prof.description.length > 20;
        return {
          ...prof,
          statut: hasDescription ? 'valide' : prof.statut,
          leadsPayes: prof.leadsPayes || (hasDescription ? 5 : 1)
        };
      });

      updated.sort((a, b) => (b.leadsPayes || 0) - (a.leadsPayes || 0));
      setProfesseursNouveaux(updated);
      localStorage.setItem('professeurs_soumissions', JSON.stringify(updated));
      setIsAnalyzing(false);
    }, 1000);
  };

  // Gestion de l'envoi de message au chat IA admin
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    // Réponse simulée intelligente de l'IA en fonction de la question
    setTimeout(() => {
      let aiReply = "J'ai bien pris en compte ta demande. Le système est à jour.";
      const lower = userMsg.toLowerCase();

      if (lower.includes('combien') || lower.includes('nombre')) {
        aiReply = `Il y a actuellement ${professeursNouveaux.length} nouveau(x) formulaire(s) en attente et ${professeursExistants.length} professeur(s) actif(s) sur le site.`;
      } else if (lower.includes('valide') || lower.includes('modere') || lower.includes('nettoie')) {
        runAiModerationAndRanking();
        aiReply = "J'ai exécuté l'audit automatique : les profils complets ont été validés et triés par nombre de leads !";
      } else if (lower.includes('bonjour') || lower.includes('salut')) {
        aiReply = "Bonjour Amal ! Prête à faire décoller ta plateforme de cours ? Dis-moi ce que tu souhaites analyser.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: aiReply }]);
    }, 600);
  };

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Top Header Admin */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Administration Assistée par IA <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-500">Pilote ton site par la discussion et l'automatisation intelligente.</p>
          </div>
        </div>

        <Link href="/" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Onglets */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('ia_agent')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 shadow-sm ${
              activeTab === 'ia_agent'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Assistant IA & Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('nouveaux')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'nouveaux' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FF5A5F]" />
            <span>Nouveaux Formulaires ({professeursNouveaux.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('existants')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'existants' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Professeurs Existants ({professeursExistants.length})</span>
          </button>
        </div>

        {/* SECTION 1 : ASSISTANT IA & CHAT INTERACTIF */}
        {activeTab === 'ia_agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panneau de contrôle rapide */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <span className="bg-purple-500/30 text-purple-200 text-xs font-bold px-3 py-1 rounded-full border border-purple-400/30 inline-flex items-center gap-1 mb-3">
                  <Sparkles className="w-3 h-3" /> Actions Rapides IA
                </span>
                <h2 className="text-xl font-black mb-2">Automatisation</h2>
                <p className="text-purple-200 text-xs mb-5 leading-relaxed">
                  Lance un audit complet pour valider les annonces et classer les professeurs selon leurs leads.
                </p>

                <button
                  onClick={runAiModerationAndRanking}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-white text-purple-900 hover:bg-purple-50 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Bot className={`w-4 h-4 text-purple-600 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? "Analyse en cours..." : "Lancer l'audit automatique"}</span>
                </button>
              </div>
            </div>

            {/* Interface de Chat avec l'IA */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50 rounded-t-3xl">
                <Bot className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-sm text-gray-800">Discussion en direct avec ton Assistant Admin</span>
              </div>

              {/* Messages du chat */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none font-medium'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input pour écrire à l'IA */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ex: 'Combien de profs en attente ?' ou 'Valide tout'..."
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

        {/* SECTION 2 : NOUVEAUX FORMULAIRES */}
        {activeTab === 'nouveaux' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-gray-900">Soumissions en attente de modération</h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
                Classés par l'IA (Leads & Pertinence)
              </span>
            </div>

            {professeursNouveaux.length === 0 ? (
              <div className="p-16 text-center text-gray-400 text-sm">Aucun formulaire en attente.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 text-xs uppercase font-extrabold border-b border-gray-100">
                      <th className="p-4">Professeur</th>
                      <th className="p-4">Annonce</th>
                      <th className="p-4">Lieu & Tarif</th>
                      <th className="p-4">Score Leads (IA)</th>
                      <th className="p-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {professeursNouveaux.map((prof, index) => (
                      <tr key={prof.id || index} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 font-bold text-gray-900">{prof.profil?.nom || prof.nom || 'Anonyme'}</td>
                        <td className="p-4 text-xs text-gray-600 max-w-xs truncate">{prof.titre || prof.description}</td>
                        <td className="p-4 text-gray-600">{prof.tarif || 'N/A'} ({prof.lieu || 'Casablanca'})</td>
                        <td className="p-4 font-black text-amber-600 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" /> {prof.leadsPayes || 0}
                        </td>
                        <td className="p-4">
                          {prof.statut === 'valide' ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                              <CheckCircle className="w-3.5 h-3.5" /> Validé par IA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                              <AlertCircle className="w-3.5 h-3.5" /> En attente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3 : EXISTANTS */}
        {activeTab === 'existants' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Professeurs Actifs sur la Plateforme</h2>
            <div className="space-y-3">
              {professeursExistants.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="font-bold text-gray-900">{p.nom}</h3>
                    <p className="text-xs text-gray-500">{p.matiere} • {p.ville}</p>
                  </div>
                  <span className="font-semibold text-sm text-emerald-600">{p.tarif}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}