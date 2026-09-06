'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Users, CheckCircle, Trash2, Image as ImageIcon, Eye, X, Clock, 
  BarChart3, Upload, Settings, HelpCircle, Plus, Bell, ChevronRight, TrendingUp, Menu,
  LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Users2, LogOut
} from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'team' | 'settings' | 'help'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [professeursNouveaux, setProfesseursNouveaux] = useState<any[]>([]);
  const [professeursExistants, setProfesseursExistants] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [realCa, setRealCa] = useState<number>(0);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      // 1. Récupérer les professeurs existants
      const { data: profsData, error: profsError } = await supabase.from('professors').select('*');
      if (profsError) setDbError(profsError.message);
      else if (profsData) setProfesseursExistants(profsData);

      // 2. Récupérer les nouvelles demandes
      const { data: reqsData, error: reqsError } = await supabase.from('requests').select('*');
      if (reqsError) {
        setDbError(reqsError.message);
      } else if (reqsData) {
        setProfesseursNouveaux(reqsData);
      }

      // 3. Récupérer les transactions réelles et calculer le Chiffre d'Affaires
      let totalCa = 0;
      const { data: transData, error: transError } = await supabase.from('transactions').select('*');
      if (!transError && transData) {
        setTransactionsList(transData);
        totalCa = transData.reduce((sum, item) => {
          const montant = Number(item.montant || item.amount || item.tarif || 0);
          return sum + montant;
        }, 0);
      } else if (reqsData && reqsData.length > 0) {
        totalCa = reqsData.reduce((sum, item) => {
          const montant = Number(item.montant || item.amount || item.tarif || 0);
          return sum + montant;
        }, 0);
      }

      setRealCa(totalCa);

    } catch (err: any) {
      setDbError(err.message || 'Erreur réseau');
    } finally {
      setIsLoadingDb(false);
    }
  };

  // --- CALCUL DES STATISTIQUES RÉGIONALES (EN NOMBRE DE PROFESSEURS) ---
  const getRegionalStats = () => {
    const validProfs = professeursExistants.filter(p => {
      const ville = (p.ville || p.city || '').toLowerCase().trim();
      return ville && ville !== 'admin';
    });

    if (validProfs.length === 0) return [];

    const profCityMap: { [key: string]: string } = {};
    professeursExistants.forEach(p => {
      const emailKey = (p.email || '').toLowerCase().trim();
      const cityVal = (p.ville || p.city || '').toLowerCase().trim();
      if (emailKey) profCityMap[emailKey] = cityVal;
    });

    const counts: { [key: string]: number } = {};
    const amounts: { [key: string]: number } = {};

    validProfs.forEach(p => {
      const v = (p.ville || p.city || '').toLowerCase().trim();
      let regionName = 'Grand Casablanca';

      if (v.includes('casa') || v.includes('casablanca')) {
        regionName = 'Grand Casablanca';
      } else if (v.includes('marakech') || v.includes('marrakech') || v.includes('safi')) {
        regionName = 'Marrakech-Safi';
      } else if (v.includes('rabat') || v.includes('salé') || v.includes('kenitra') || v.includes('kénitra')) {
        regionName = 'Rabat-Salé-Kénitra';
      } else if (v.includes('fès') || v.includes('fes') || v.includes('meknès') || v.includes('meknes')) {
        regionName = 'Fès-Meknès';
      } else if (v.includes('tanger') || v.includes('tetouan') || v.includes('tétouan')) {
        regionName = 'Tanger-Tétouan';
      } else {
        regionName = v.charAt(0).toUpperCase() + v.slice(1);
      }

      counts[regionName] = (counts[regionName] || 0) + 1;
      amounts[regionName] = amounts[regionName] || 0;
    });

    transactionsList.forEach(t => {
      const profId = (t.prof_id || t.email || '').toLowerCase().trim();
      const montantTrans = Number(t.amount || t.montant || 0);
      const city = profCityMap[profId] || '';

      let regionName = 'Grand Casablanca';
      if (city.includes('marrakech') || city.includes('marakech') || city.includes('safi')) {
        regionName = 'Marrakech-Safi';
      } else if (city.includes('rabat') || city.includes('salé')) {
        regionName = 'Rabat-Salé-Kénitra';
      }

      if (amounts[regionName] !== undefined) {
        amounts[regionName] += montantTrans;
      } else {
        amounts['Grand Casablanca'] = (amounts['Grand Casablanca'] || 0) + montantTrans;
      }
    });

    const colors = [
      'bg-purple-500',
      'bg-amber-500',
      'bg-red-400',
      'bg-sky-400',
      'bg-orange-400'
    ];

    let index = 0;
    return Object.keys(counts).map(region => {
      const count = counts[region];
      const regionalAmount = Math.round(amounts[region] || 0);
      const color = colors[index++ % colors.length];

      return {
        region,
        countText: `${count} prof${count > 1 ? 's' : ''}`,
        amount: `${regionalAmount.toLocaleString()} MAD`,
        color,
        count
      };
    });
  };

  const regionalStatsData = getRegionalStats();

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

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans flex flex-col w-full">
      
      {/* ================= UNIQUE EN-TÊTE ADMIN ================= */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 w-full shadow-2xs">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 transition cursor-pointer flex items-center justify-center shadow-2xs"
            title="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-base tracking-tight text-gray-900">profmaroc</span>
            <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">ADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={fetchDataFromSupabase} title="Actualiser les données" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer">
            <span className={`w-4 h-4 flex items-center justify-center ${isLoadingDb ? 'animate-spin' : ''}`}>🔄</span>
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

      {/* ================= CONTENU PRINCIPAL PLEINE LARGEUR ================= */}
      <main className="flex-1 p-8 space-y-8 max-w-[95rem] w-full mx-auto overflow-y-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard & Analyses</h1>
            <p className="text-xs text-gray-500 mt-0.5">Suivi financier, répartition géographique et performance des matières au Maroc.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard/requests')} className="px-4 py-2.5 bg-[#103D3B] hover:bg-[#0d312f] text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> <span>Gérer les Demandes ({professeursNouveaux.length})</span>
            </button>
            <button onClick={fetchDataFromSupabase} className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> <span>Import Data</span>
            </button>
          </div>
        </div>

        {/* STATS PRINCIPALES (4 cartes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36 relative">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 bg-[#FF4747] text-white text-[11px] font-black rounded-full shadow-2xs">
                -2,08%
              </span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 block mb-0.5">Visitor</span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">14.987</h3>
                <span className="text-[10px] text-gray-400 font-medium leading-tight">Users vs last month</span>
              </div>
            </div>
          </div>

          <div className="bg-[#103D3B] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-emerald-100 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Chiffre d'affaires</span>
              <span className="p-1.5 bg-white/10 rounded-full"><ChevronRight className="w-4 h-4 text-white" /></span>
            </div>
            <div>
              <h3 className="text-2xl font-black">{realCa.toLocaleString()} MAD</h3>
              <p className="text-[10px] text-emerald-300 font-bold mt-1 flex items-center gap-1">
                <span className="text-emerald-400">Transactions Réelles</span> Supabase
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-gray-500">Professeurs Actifs</span>
              <span className="p-1.5 bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-600" /></span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-gray-900">{professeursExistants.filter(p => (p.ville || p.city || '').toLowerCase().trim() !== 'admin').length}</h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">↑ En ligne sur la plateforme</p>
            </div>
          </div>

          {/* Carte Demandes en attente redirigeant vers la page dédiée */}
          <div 
            onClick={() => router.push('/admin/dashboard/requests')}
            className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36 cursor-pointer hover:border-gray-400 transition"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-gray-500">Demandes en attente</span>
              <span className="p-1.5 bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-600" /></span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-amber-600">{professeursNouveaux.length}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Nécessite validation</p>
            </div>
          </div>

        </div>

        {/* GRAPHIQUES CA & RÉPARTITION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-gray-900">Évolution du chiffre d'affaires (MAD)</h2>
                <p className="text-xs text-gray-400">Total calculé en temps réel depuis les transactions</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black text-xs rounded-full">{realCa.toLocaleString()} MAD</span>
            </div>

            <div className="h-52 w-full flex items-end justify-between gap-2 pt-6 px-2 relative bg-gradient-to-b from-amber-50/50 to-transparent rounded-2xl border border-dashed border-gray-100">
              {[
                { month: 'Janv.', height: '35%' }, { month: 'Fév.', height: '48%' },
                { month: 'Mars', height: '42%' }, { month: 'Avr.', height: '58%' },
                { month: 'Mai', height: '50%' }, { month: 'Juin', height: '65%' },
                { month: 'Juil.', height: '75%' }, { month: 'Août', height: '85%' },
                { month: 'Sept.', height: '80%' }, { month: 'Oct.', height: '76%' },
                { month: 'Nov.', height: '90%' }, { month: 'Déc.', height: '100%' },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full bg-gradient-to-t from-amber-500 to-red-400 rounded-t-lg transition-all duration-300 opacity-80" style={{ height: item.height }}></div>
                  <span className="text-[10px] font-bold text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RÉPARTITION RÉGIONALE EN NOMBRE DE PROFS */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900">Professeurs par région</h2>
              <p className="text-xs text-gray-400">Nombre réel de professeurs par zone</p>
            </div>

            <div className="space-y-3 my-4">
              {regionalStatsData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Aucun professeur non-admin trouvé.</p>
              ) : (
                regionalStatsData.map((reg, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${reg.color}`}></div>
                      <span className="font-bold text-gray-700">{reg.region}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">{reg.countText}</span>
                      <span className="font-bold text-gray-900">{reg.amount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 block">Total National Réel</span>
              <span className="text-sm font-black text-[#103D3B]">{realCa.toLocaleString()} MAD</span>
            </div>
          </div>
        </div>

        {/* GRAPHIQUE LINÉAIRE DÉGRADÉ EN BAS */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-gray-900">Sales Details</h2>
              <p className="text-xs text-gray-400">Suivi détaillé des performances et flux d'activité mensuels</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100">
                64,3664.77
              </span>
              <select className="bg-gray-50 border border-gray-200 text-xs text-gray-700 font-semibold px-3 py-1.5 rounded-xl outline-none cursor-pointer">
                <option>October</option>
                <option>September</option>
                <option>August</option>
              </select>
            </div>
          </div>

          <div className="relative w-full h-72 pt-6 pb-2 px-2 bg-white rounded-2xl border border-gray-100 flex flex-col justify-end">
            
            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-40">
              <div className="w-full border-b border-dashed border-gray-200 flex items-center"><span className="text-[10px] text-gray-400 font-medium">100%</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center"><span className="text-[10px] text-gray-400 font-medium">80%</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center"><span className="text-[10px] text-gray-400 font-medium">60%</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center"><span className="text-[10px] text-gray-400 font-medium">40%</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center"><span className="text-[10px] text-gray-400 font-medium">20%</span></div>
            </div>

            <div className="relative w-full h-48 z-10">
              <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path 
                  d="M 0,260 Q 80,240 160,230 T 320,170 T 480,200 T 640,110 T 800,190 T 960,120 L 960,300 L 0,300 Z" 
                  fill="url(#blueGradient)" 
                />

                <path 
                  d="M 0,260 Q 80,240 160,230 T 320,170 T 480,200 T 640,110 T 800,190 T 960,120" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />

                <g transform="translate(640, 110)">
                  <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
                  <rect x="-45" y="-38" width="90" height="26" rx="6" fill="#3b82f6" />
                  <text x="0" y="-21" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">64,3664.77</text>
                </g>

                <circle cx="160" cy="230" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="320" cy="170" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="480" cy="200" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="800" cy="190" r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex justify-between text-[11px] font-semibold text-gray-400 px-2 pt-2 border-t border-gray-100">
              <span>5k</span>
              <span>10k</span>
              <span>15k</span>
              <span>20k</span>
              <span>25k</span>
              <span>30k</span>
              <span>35k</span>
              <span>40k</span>
              <span>45k</span>
              <span>50k</span>
              <span>55k</span>
              <span>60k</span>
            </div>
          </div>
        </div>

      </main>

      {/* ================= PANNEAU LATÉRAL COULISSANT ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>

          <div className="relative w-80 bg-white text-gray-800 flex flex-col justify-between shadow-2xl z-10 h-full border-r border-gray-100 animate-in slide-in-from-left duration-300">
            <div>
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="bg-orange-50 p-1.5 rounded-xl border border-orange-100">
                    <BookOpen className="w-5 h-5 text-[#FF5733]" />
                  </div>
                  <div>
                    <span className="text-base font-black tracking-tight text-gray-900">prof<span className="text-[#FF5733]">maroc</span></span>
                    <p className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest leading-none mt-0.5">ADMIN PANEL</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">MENU</p>
                  <nav className="space-y-1">
                    <button 
                      onClick={() => { setActiveMenu('dashboard'); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#0f2922] text-white transition shadow-xs cursor-pointer text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" /> <span>Dashboard</span>
                    </button>
                    <button 
                      onClick={() => { setActiveMenu('tasks'); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-4 h-4 text-gray-400" />
                        <span>Tasks</span>
                      </div>
                      <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">4</span>
                    </button>
                    <button 
                      onClick={() => { setActiveMenu('calendar'); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer text-left"
                    >
                      <CalendarIcon className="w-4 h-4 text-gray-400" /> <span>Calendar</span>
                    </button>
                    <button 
                      onClick={() => { setActiveMenu('analytics'); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer text-left"
                    >
                      <BarChart3 className="w-4 h-4 text-gray-400" /> <span>Analytics</span>
                    </button>
                    <button 
                      onClick={() => { setActiveMenu('team'); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer text-left"
                    >
                      <Users2 className="w-4 h-4 text-gray-400" /> <span>Team</span>
                    </button>
                  </nav>
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">GENERAL</p>
                  <nav className="space-y-1">
                    <button 
                      onClick={() => { setActiveMenu('settings'); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer text-left"
                    >
                      <Settings className="w-4 h-4 text-gray-400" /> <span>Settings</span>
                    </button>
                    <button 
                      onClick={() => { setActiveMenu('help'); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" /> <span>Help</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-xl transition flex items-center gap-3 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}