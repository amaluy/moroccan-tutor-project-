'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, BookOpen, Users, Sparkles, Bot, Send, RefreshCw, 
  CheckCircle, Trash2, Image as ImageIcon, Eye, X, Clock, Layers, 
  ZoomIn, LayoutDashboard, CheckSquare, Calendar, BarChart3, 
  Upload, Settings, HelpCircle, LogOut, Plus, Search, Bell, ChevronRight, TrendingUp, MapPin, Award 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'team' | 'settings' | 'help'>('dashboard');
  const [activeTab, setActiveTab] = useState<'ia_agent' | 'existants' | 'nouveaux'>('nouveaux');

  const [professeursNouveaux, setProfesseursNouveaux] = useState<any[]>([]);
  const [professeursExistants, setProfesseursExistants] = useState<any[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: "Bonjour Émil ! Je suis ton assistant IA. Je surveille tes tables Supabase 'professors' et 'requests'. Dis-moi par exemple : 'Valide tous les nouveaux profs' ou demande-moi le statut de la plateforme !" }
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

  const handleAiValidateAll = async () => {
    if (professeursNouveaux.length === 0) return "Il n'y a aucune nouvelle demande en attente !";
    try {
      for (const reqItem of professeursNouveaux) {
        await handleApproveRequest(reqItem);
      }
      return `✨ Mission accomplie ! J'ai validé ${professeursNouveaux.length} professeur(s).`;
    } catch (err: any) {
      return `Oups : ${err.message}`;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');

    let aiReply = "";
    if (userMsg.toLowerCase().includes('valide') || userMsg.toLowerCase().includes('tout')) {
      aiReply = await handleAiValidateAll();
    } else {
      aiReply = `J'ai bien reçu ta consigne ("${userMsg}").`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: aiReply }]);
    }, 500);
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

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans flex">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <div className="bg-gradient-to-tr from-amber-500 to-red-500 p-2 rounded-xl text-white shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-gray-900 block leading-none">profmaroc</span>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">ADMIN PANEL</span>
            </div>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
              <nav className="space-y-1">
                <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeMenu === 'dashboard' ? 'bg-[#103D3B] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <LayoutDashboard className="w-4 h-4" /> <span>Dashboard</span>
                </button>
                <button onClick={() => setActiveMenu('tasks')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeMenu === 'tasks' ? 'bg-[#103D3B] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3"><CheckSquare className="w-4 h-4" /> <span>Tasks</span></div>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeMenu === 'tasks' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{professeursNouveaux.length}</span>
                </button>
                <button onClick={() => setActiveMenu('calendar')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeMenu === 'calendar' ? 'bg-[#103D3B] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Calendar className="w-4 h-4" /> <span>Calendar</span>
                </button>
                <button onClick={() => setActiveMenu('analytics')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeMenu === 'analytics' ? 'bg-[#103D3B] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <BarChart3 className="w-4 h-4" /> <span>Analytics</span>
                </button>
                <button onClick={() => setActiveMenu('team')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${activeMenu === 'team' ? 'bg-[#103D3B] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Users className="w-4 h-4" /> <span>Team</span>
                </button>
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">General</p>
              <nav className="space-y-1">
                <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition">
                  <Settings className="w-4 h-4" /> <span>Settings</span>
                </Link>
                <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-100 transition">
                  <HelpCircle className="w-4 h-4" /> <span>Help</span>
                </Link>
                <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition">
                  <LogOut className="w-4 h-4" /> <span>Logout</span>
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="p-4 m-4 bg-gradient-to-br from-[#103D3B] to-emerald-900 text-white rounded-2xl shadow-md">
          <p className="font-bold text-xs mb-1">ProfMaroc Mobile App</p>
          <p className="text-[10px] text-emerald-200 mb-3">Gérez vos cours directement depuis votre smartphone.</p>
          <button onClick={() => alert("Application mobile bientôt disponible !")} className="w-full py-2 bg-white text-emerald-950 font-bold text-[11px] rounded-xl shadow transition cursor-pointer">
            Download
          </button>
        </div>
      </aside>

      {/* ================= CONTENU PRINCIPAL ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search tasks, professors..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white transition" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={fetchDataFromSupabase} title="Actualiser les données" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${isLoadingDb ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer">
              <Bell className="w-4 h-4" />
              {professeursNouveaux.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                ÉM
              </div>
              <div>
                <p className="font-bold text-xs text-gray-900 leading-none">Émil</p>
                <p className="text-[10px] text-gray-400 mt-0.5">berrada0amal@gmail.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* CORPS DU TABLEAU DE BORD */}
        <main className="p-8 space-y-8 max-w-[95rem] w-full mx-auto overflow-y-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard & Analyses</h1>
              <p className="text-xs text-gray-500 mt-0.5">Suivi financier, répartition géographique et performance des matières au Maroc.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('nouveaux')} className="px-4 py-2.5 bg-[#103D3B] hover:bg-[#0d312f] text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" /> <span>Add Request</span>
              </button>
              <button onClick={fetchDataFromSupabase} className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> <span>Import Data</span>
              </button>
            </div>
          </div>

          {/* SECTION CHIFFRE D'AFFAIRES & STATS PRINCIPALES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Carte CA en MAD (Inspiré de votre maquette image 1) */}
            <div className="bg-[#103D3B] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-emerald-100 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Chiffre d'affaires</span>
                <span className="p-1.5 bg-white/10 rounded-full"><ChevronRight className="w-4 h-4 text-white" /></span>
              </div>
              <div>
                <h3 className="text-2xl font-black">2 185 430 MAD</h3>
                <p className="text-[10px] text-emerald-300 font-bold mt-1 flex items-center gap-1">
                  <span className="text-emerald-400">▲ 12,4 %</span> vs mois précédent
                </p>
              </div>
            </div>

            {/* Carte Profs Actifs */}
            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-500">Professeurs Actifs</span>
                <span className="p-1.5 bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-600" /></span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900">{professeursExistants.length}</h3>
                <p className="text-[10px] text-emerald-600 font-medium mt-1">↑ En ligne sur la plateforme</p>
              </div>
            </div>

            {/* Carte Demandes en attente */}
            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-500">Demandes en attente</span>
                <span className="p-1.5 bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-600" /></span>
              </div>
              <div>
                <h3 className="text-3xl font-black text-amber-600">{professeursNouveaux.length}</h3>
                <p className="text-[10px] text-gray-400 mt-1">Nécessite validation</p>
              </div>
            </div>

            {/* Carte IA Supervisor */}
            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-500">Assistant IA</span>
                <span className="p-1.5 bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-600" /></span>
              </div>
              <div>
                <h3 className="text-xl font-black text-purple-600 flex items-center gap-2 mt-1">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" /> Actif
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Supabase synchronisé</p>
              </div>
            </div>

          </div>

          {/* SECTION GRAPHIQUES : ÉVOLUTION DU CA & RÉPARTITION PAR RÉGION (Inspiré image 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Graphique d'évolution du CA mensuel */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-gray-900">Évolution du chiffre d'affaires (MAD)</h2>
                  <p className="text-xs text-gray-400">Croissance mensuelle sur l'année en cours</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black text-xs rounded-full">2,19 M MAD</span>
              </div>

              {/* Simulation graphique courbe style maquette */}
              <div className="h-52 w-full flex items-end justify-between gap-2 pt-6 px-2 relative bg-gradient-to-b from-amber-50/50 to-transparent rounded-2xl border border-dashed border-gray-100">
                {[
                  { month: 'Janv.', val: '700K', height: '35%' },
                  { month: 'Fév.', val: '950K', height: '48%' },
                  { month: 'Mars', val: '850K', height: '42%' },
                  { month: 'Avr.', val: '1,1M', height: '58%' },
                  { month: 'Mai', val: '980K', height: '50%' },
                  { month: 'Juin', val: '1,3M', height: '65%' },
                  { month: 'Juil.', val: '1,6M', height: '75%' },
                  { month: 'Août', val: '1,9M', height: '85%' },
                  { month: 'Sept.', val: '1,8M', height: '80%' },
                  { month: 'Oct.', val: '1,7M', height: '76%' },
                  { month: 'Nov.', val: '2,0M', height: '90%' },
                  { month: 'Déc.', val: '2,19M', height: '100%' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="w-full bg-gradient-to-t from-amber-500 to-red-400 rounded-t-lg transition-all duration-300 group-hover:opacity-100 opacity-80" style={{ height: item.height }}></div>
                    <span className="text-[10px] font-bold text-gray-500 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Répartition des profs par région du Maroc (Donut Chart visuel) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-black text-gray-900">Professeurs par région</h2>
                <p className="text-xs text-gray-400">Répartition géographique au Maroc</p>
              </div>

              <div className="space-y-3 my-4">
                {[
                  { region: 'Grand Casablanca', percent: '27,0%', amount: '590K MAD', color: 'bg-purple-500' },
                  { region: 'Rabat-Salé-Kénitra', percent: '22,8%', amount: '498K MAD', color: 'bg-red-400' },
                  { region: 'Marrakech-Safi', percent: '20,1%', amount: '440K MAD', color: 'bg-amber-500' },
                  { region: 'Fès-Meknès', percent: '19,3%', amount: '400K MAD', color: 'bg-sky-400' },
                  { region: 'Tanger-Tétouan', percent: '11,8%', amount: '258K MAD', color: 'bg-orange-400' },
                ].map((reg, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${reg.color}`}></div>
                      <span className="font-bold text-gray-700">{reg.region}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-500">{reg.percent}</span>
                      <span className="font-bold text-gray-900">{reg.amount}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                <span className="text-[10px] text-gray-400 block">Total National</span>
                <span className="text-sm font-black text-[#103D3B]">2,19 M MAD</span>
              </div>
            </div>

          </div>

          {/* SECTION : MATIÈRES PROMINENTES AVEC SONDAGES (Inspiré de image 3) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-gray-900">Matières prominentes & Sondages étudiants</h2>
                <p className="text-xs text-gray-400">Volume de demandes et d'intérêt mesuré par les sondages de la plateforme</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Top Demandes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Mathématiques', volume: '750 K MAD', rating: '98% satisfaction', color: 'from-pink-500 to-purple-600', height: 'h-36' },
                { name: 'Physique-Chimie', volume: '600 K MAD', rating: '95% satisfaction', color: 'from-purple-600 to-indigo-600', height: 'h-32' },
                { name: 'Français / Anglais', volume: '580 K MAD', rating: '92% satisfaction', color: 'from-purple-500 to-pink-500', height: 'h-32' },
                { name: 'SVT / Sciences', volume: '260 K MAD', rating: '88% satisfaction', color: 'from-amber-400 to-orange-500', height: 'h-24' },
              ].map((item, index) => (
                <div key={index} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-gray-800">{item.name}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{item.rating}</span>
                  </div>
                  <div className="my-4">
                    <span className="text-2xl font-black text-gray-900">{item.volume}</span>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div className={`bg-gradient-to-r ${item.color} h-full rounded-full`} style={{ width: index === 0 ? '90%' : index === 1 ? '75%' : index === 2 ? '70%': '40%' }}></div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">Basé sur les sondages du mois</span>
                </div>
              ))}
            </div>
          </div>

          {/* ONGLETS SUPABASE : GESTION DES PROFESSEURS & DEMANDES */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap gap-3 border-b border-gray-100 pb-4">
              <button onClick={() => setActiveTab('nouveaux')} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${activeTab === 'nouveaux' ? 'bg-[#103D3B] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <BookOpen className="w-3.5 h-3.5 text-[#FF5A5F]" /> <span>Demandes en attente ({professeursNouveaux.length})</span>
              </button>
              <button onClick={() => setActiveTab('existants')} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${activeTab === 'existants' ? 'bg-[#103D3B] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Users className="w-3.5 h-3.5 text-blue-500" /> <span>Professeurs Actifs ({professeursExistants.length})</span>
              </button>
              <button onClick={() => setActiveTab('ia_agent')} className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-2 ${activeTab === 'ia_agent' ? 'bg-purple-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Bot className="w-3.5 h-3.5" /> <span>Assistant IA Bot</span>
              </button>
            </div>

            {activeTab === 'nouveaux' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-black text-gray-900">Validation des profs & Preuves de paiement</h2>
                  <button onClick={async () => { const res = await handleAiValidateAll(); alert(res); }} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> <span>Tout valider en 1 clic (IA)</span>
                  </button>
                </div>

                {professeursNouveaux.length === 0 ? (
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
                          <p className="text-xs text-gray-500">{p.matiere || p.subject} • {p.ville || p.city}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-emerald-600">{p.tarif || p.price} MAD/h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ia_agent' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
                  <div>
                    <h2 className="text-lg font-black mb-2">Commandes Rapides IA</h2>
                    <p className="text-xs text-purple-200 mb-4">Utilisez l'intelligence artificielle pour automatiser vos tâches administratives.</p>
                  </div>
                  <button onClick={async () => { const res = await handleAiValidateAll(); setMessages(prev => [...prev, { role: 'assistant', text: res }]); }} className="w-full py-3 bg-white text-purple-900 font-black text-xs rounded-xl shadow transition cursor-pointer">
                    Valider toutes les demandes
                  </button>
                </div>
                <div className="lg:col-span-2 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col h-[400px]">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2 bg-white rounded-b-2xl">
                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Écrivez une consigne à l'IA..." className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none" />
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl cursor-pointer"><Send className="w-4 h-4" /></button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* MODALE DE DÉTAIL D'UN PROFESSEUR */}
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

      {/* VISIONNEUSE PHOTO PLEIN ÉCRAN */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Grand format" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
        </div>
      )}

    </div>
  );
}