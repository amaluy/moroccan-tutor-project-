'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Users, CheckCircle, Trash2, Image as ImageIcon, Eye, X, Clock, 
  BarChart3, Upload, Settings, HelpCircle, Plus, Bell, ChevronRight, TrendingUp, Menu,
  LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Users2, LogOut, Download, Calendar
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
  const [allRequestsHistory, setAllRequestsHistory] = useState<any[]>([]);
  const [realCa, setRealCa] = useState<number>(0);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // --- ÉTATS POUR LE GRAPHIQUE (Années 2026, 2027 + Clic dynamique) ---
  const currentYearStr = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [availableYears, setAvailableYears] = useState<string[]>(['2026', '2027', currentYearStr]);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

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

      let combinedHistory: any[] = [];
      if (reqsData) combinedHistory = [...reqsData];
      if (profsData) {
        combinedHistory = [...combinedHistory, ...profsData];
      }
      setAllRequestsHistory(combinedHistory);

      const yearsSet = new Set<string>(['2026', '2027', currentYearStr]);
      combinedHistory.forEach(item => {
        const dateVal = item.created_at || item.date || item.inserted_at;
        if (dateVal) {
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) {
            yearsSet.add(d.getFullYear().toString());
          }
        }
      });
      const sortedYears = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
      setAvailableYears(sortedYears);

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

  // --- CALCUL DES DEMANDES PAR MOIS FILTRÉES PAR ANNÉE ---
  const getMonthlyRequestsData = () => {
    const monthsCounts = Array(12).fill(0);

    allRequestsHistory.forEach(item => {
      const dateVal = item.created_at || item.date || item.inserted_at;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          if (d.getFullYear().toString() === selectedYear) {
            const monthIndex = d.getMonth(); 
            monthsCounts[monthIndex]++;
          }
        }
      }
    });

    const monthNames = ['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return monthNames.map((name, index) => ({
      month: name,
      count: monthsCounts[index]
    }));
  };

  const monthlyData = getMonthlyRequestsData();
  
  // Échelle fixe demandée : 0, 50, 100, 150, 200 (ou plus si dépassement)
  const maxDataVal = Math.max(...monthlyData.map(d => d.count), 0);
  const maxMonthlyCount = maxDataVal > 200 ? Math.ceil(maxDataVal / 50) * 50 : 200;

  // --- FONCTION D'EXPORT EXCEL (CSV) ---
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Mois;Annee;Nombre de Demandes\n";
    monthlyData.forEach(item => {
      csvContent += `${item.month};${selectedYear};${item.count}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `demandes_profmaroc_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

    const colors = ['bg-purple-500', 'bg-amber-500', 'bg-red-400', 'bg-sky-400', 'bg-orange-400'];

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

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans flex flex-col w-full">
      
      {/* ================= EN-TÊTE ADMIN ================= */}
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

      {/* ================= CONTENU PRINCIPAL ================= */}
      <main className="flex-1 p-8 space-y-8 max-w-[95rem] w-full mx-auto overflow-y-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard & Analyses</h1>
            <p className="text-xs text-gray-500 mt-0.5">Suivi financier, répartition géographique et performance des demandes au Maroc.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/dashboard/requests')} className="px-4 py-2.5 bg-[#103D3B] hover:bg-[#0d312f] text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> <span>Gérer les Demandes ({professeursNouveaux.length})</span>
            </button>
            <button onClick={exportToExcel} className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer">
              <Download className="w-4 h-4" /> <span>Exporter Excel (.csv)</span>
            </button>
          </div>
        </div>

        {/* STATS PRINCIPALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36 relative">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-750">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 bg-[#FF4747] text-white text-[11px] font-black rounded-full shadow-2xs">-2,08%</span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 block mb-0.5">Visitor</span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">14.987</h3>
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
              <p className="text-[10px] text-emerald-300 font-bold mt-1">Transactions Réelles Supabase</p>
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

          <div onClick={() => router.push('/admin/dashboard/requests')} className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36 cursor-pointer hover:border-gray-400 transition">
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

        {/* ================= GRAPHIQUES CA & RÉPARTITION RÉGIONALE (RESTAURÉS) ================= */}
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

        {/* ================= GRAPHIQUE LINÉAIRE INTERACTIF (ANNÉES & ÉCHELLE 0-200) ================= */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-gray-900">Nombre de demandes reçues par mois</h2>
              <p className="text-xs text-gray-400">Cliquez sur un point du graphique pour afficher le chiffre exact de ce mois.</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Sélecteur d'Année (2026, 2027...) */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600">Année :</span>
                <select 
                  value={selectedYear} 
                  onChange={(e) => { setSelectedYear(e.target.value); setActivePointIndex(null); }}
                  className="bg-transparent text-xs font-black text-gray-900 outline-none cursor-pointer"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                Total {selectedYear} : {monthlyData.reduce((sum, item) => sum + item.count, 0)} demandes
              </span>
            </div>
          </div>

          <div className="relative w-full h-80 pt-10 pb-4 px-6 bg-white rounded-2xl border border-gray-100 flex flex-col justify-end">
            
            {/* Échelle verticale personnalisée (0, 50, 100, 150, 200) */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-50">
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-400 font-bold pr-2">{maxMonthlyCount}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-400 font-bold pr-2">{Math.round(maxMonthlyCount * 0.75)}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-400 font-bold pr-2">{Math.round(maxMonthlyCount * 0.5)}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-400 font-bold pr-2">{Math.round(maxMonthlyCount * 0.25)}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-400 font-bold pr-2">0</span></div>
            </div>

            {/* Tracé SVG interactif */}
            <div className="relative w-full h-48 z-10 ml-4">
              <svg viewBox="0 0 1100 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="requestGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#103D3B" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#103D3B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const points = monthlyData.map((d, index) => {
                    const x = (index / (monthlyData.length - 1)) * 1050 + 25;
                    const y = 270 - (d.count / maxMonthlyCount) * 240;
                    return { x, y, count: d.count, month: d.month, index };
                  });

                  const pathD = points.reduce((acc, p, idx) => idx === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');
                  const areaD = `${pathD} L ${points[points.length - 1].x},300 L ${points[0].x},300 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#requestGradient)" />
                      <path d={pathD} fill="none" stroke="#103D3B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {points.map((p) => {
                        const isSelected = activePointIndex === p.index;
                        return (
                          <g key={p.index} transform={`translate(${p.x}, ${p.y})`} onClick={() => setActivePointIndex(p.index)} className="cursor-pointer group">
                            {/* Zone de clic élargie */}
                            <circle cx="0" cy="0" r="18" fill="transparent" />
                            
                            {/* Point sur la courbe (masqué par défaut, apparaît au clic/survol) */}
                            <circle 
                              cx="0" 
                              cy="0" 
                              r={isSelected ? "8" : "5"} 
                              fill={isSelected ? "#FF5733" : "#ffffff"} 
                              stroke="#103D3B" 
                              strokeWidth="3" 
                              className="transition-all duration-200 group-hover:scale-125"
                            />

                            {/* Infobulle affichée UNIQUEMENT au clic sur le point */}
                            {isSelected && (
                              <g transform="translate(0, -42)">
                                <rect x="-35" y="-22" width="70" height="26" rx="6" fill="#103D3B" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.2))" />
                                <text x="0" y="-7" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                                  {p.count} dem.
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Légende des mois en bas */}
            <div className="flex justify-between text-[11px] font-bold text-gray-500 pl-4 pr-2 pt-3 border-t border-gray-100">
              {monthlyData.map((item, idx) => (
                <span 
                  key={idx} 
                  onClick={() => setActivePointIndex(idx)}
                  className={`text-center flex-1 cursor-pointer transition ${activePointIndex === idx ? 'text-[#FF5733] font-black underline' : 'hover:text-gray-900'}`}
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>

          {activePointIndex !== null && (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
              <span className="font-bold text-amber-900">
                📅 Mois sélectionné : <strong className="text-[#103D3B]">{monthlyData[activePointIndex].month} {selectedYear}</strong> — <strong>{monthlyData[activePointIndex].count}</strong> demande(s) enregistrée(s).
              </span>
              <button onClick={() => setActivePointIndex(null)} className="text-gray-500 hover:text-gray-900 font-bold cursor-pointer">Fermer ×</button>
            </div>
          )}
        </div>

      </main>

      {/* ================= MENU LATÉRAL ================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-80 bg-white text-gray-800 flex flex-col justify-between shadow-2xl z-10 h-full border-r border-gray-100">
            <div>
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="bg-orange-50 p-1.5 rounded-xl border border-orange-100"><BookOpen className="w-5 h-5 text-[#FF5733]" /></div>
                  <div>
                    <span className="text-base font-black tracking-tight text-gray-900">prof<span className="text-[#FF5733]">maroc</span></span>
                    <p className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest leading-none mt-0.5">ADMIN PANEL</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-4 space-y-6">
                <nav className="space-y-1">
                  <button onClick={() => { setActiveMenu('dashboard'); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#0f2922] text-white">
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" /> <span>Dashboard</span>
                  </button>
                  <button onClick={() => { router.push('/admin/dashboard/requests'); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <div className="flex items-center gap-3"><CheckSquare className="w-4 h-4 text-gray-400" /><span>Gérer les demandes</span></div>
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{professeursNouveaux.length}</span>
                  </button>
                </nav>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <Link href="/" className="w-full py-2.5 px-3 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-xl transition flex items-center gap-3 cursor-pointer">
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}