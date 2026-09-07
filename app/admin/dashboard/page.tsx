'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Users, CheckCircle, Trash2, Image as ImageIcon, Eye, X, Clock, 
  BarChart3, Upload, Settings, HelpCircle, Plus, Bell, ChevronRight, TrendingUp, Menu,
  LayoutDashboard, CheckSquare, Calendar as CalendarIcon, Users2, LogOut, Download, Calendar, ArrowLeft
} from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Liste officielle des 12 régions du Maroc pour le tableau complet
const ALL_MOROCCO_REGIONS = [
  "Tanger-Tétouan-Al Hoceïma",
  "l'Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab"
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'tasks' | 'calendar' | 'analytics' | 'team' | 'settings' | 'help'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // État pour afficher ou masquer la modale du tableau complet des régions
  const [isRegionsModalOpen, setIsRegionsModalOpen] = useState(false);

  const [professeursNouveaux, setProfesseursNouveaux] = useState<any[]>([]);
  const [professeursExistants, setProfesseursExistants] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [allRequestsHistory, setAllRequestsHistory] = useState<any[]>([]);
  const [realCa, setRealCa] = useState<number>(0);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // --- ÉTATS POUR LE FILTRE DES ANNÉES ---
  const currentYearStr = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [availableYears, setAvailableYears] = useState<string[]>(['2026', '2027', '2028']);
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; count: number } | null>(null);

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
      let profsData: any[] = [];
      let reqsData: any[] = [];
      let transData: any[] = [];

      const { data: pData, error: profsError } = await supabase.from('professors').select('*');
      if (!profsError && pData) {
        profsData = pData;
        setProfesseursExistants(pData);
      }

      const { data: rData, error: reqsError } = await supabase.from('requests').select('*');
      if (!reqsError && rData) {
        reqsData = rData;
        setProfesseursNouveaux(rData);
      }

      const { data: tData, error: transError } = await supabase.from('transactions').select('*');
      if (!transError && tData) {
        transData = tData;
        setTransactionsList(tData);
      }

      let combinedHistory: any[] = [...reqsData, ...profsData];
      setAllRequestsHistory(combinedHistory);

      const yearsSet = new Set<string>(['2026', '2027', '2028']);
      combinedHistory.forEach(item => {
        const dateVal = item.created_at || item.date || item.inserted_at;
        if (dateVal) {
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) {
            yearsSet.add(d.getFullYear().toString());
          }
        }
      });
      transData.forEach(item => {
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
      if (transData.length > 0) {
        totalCa = transData.reduce((sum, item) => {
          const montant = Number(item.montant || item.amount || item.tarif || item.price || 0);
          return sum + montant;
        }, 0);
      }

      if (totalCa === 0 && combinedHistory.length > 0) {
        totalCa = combinedHistory.reduce((sum, item) => {
          const montant = Number(item.montant || item.amount || item.tarif || item.price || item.fee || 0);
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

  const getMonthlyRevenueData = () => {
    const monthsAmounts = Array(12).fill(0);
    const sourceData = transactionsList.length > 0 ? transactionsList : allRequestsHistory;

    sourceData.forEach(item => {
      const dateVal = item.created_at || item.date || item.inserted_at;
      if (dateVal) {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          if (d.getFullYear().toString() === selectedYear) {
            const monthIndex = d.getMonth();
            const montant = Number(item.montant || item.amount || item.tarif || item.price || item.fee || 0);
            monthsAmounts[monthIndex] += montant;
          }
        }
      }
    });

    const monthNames = ['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return monthNames.map((name, index) => ({
      month: name,
      amount: monthsAmounts[index]
    }));
  };

  const monthlyRevenueData = getMonthlyRevenueData();
  const maxRevenueVal = Math.max(...monthlyRevenueData.map(d => d.amount), 0);
  const chartRevenueMax = maxRevenueVal <= 100 ? 1000 : Math.ceil(maxRevenueVal / 500) * 500;

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
  const maxDataVal = Math.max(...monthlyData.map(d => d.count), 0);
  const chartMax = maxDataVal <= 10 ? 50 : Math.ceil(maxDataVal / 50) * 50;
  const stepVal = chartMax / 5;

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

    const counts: { [key: string]: number } = {};
    const amounts: { [key: string]: number } = {};

    validProfs.forEach(p => {
      const v = (p.ville || p.city || '').toLowerCase().trim();
      let regionName = 'Grand Casablanca';

      if (v.includes('casa') || v.includes('casablanca')) {
        regionName = 'Casablanca-Settat';
      } else if (v.includes('marakech') || v.includes('marrakech') || v.includes('safi')) {
        regionName = 'Marrakech-Safi';
      } else if (v.includes('rabat') || v.includes('salé') || v.includes('kenitra') || v.includes('kénitra')) {
        regionName = 'Rabat-Salé-Kénitra';
      } else if (v.includes('fès') || v.includes('fes') || v.includes('meknès') || v.includes('meknes')) {
        regionName = 'Fès-Meknès';
      } else if (v.includes('tanger') || v.includes('tetouan') || v.includes('tétouan') || v.includes('hoceima')) {
        regionName = 'Tanger-Tétouan-Al Hoceïma';
      } else {
        regionName = v.charAt(0).toUpperCase() + v.slice(1);
      }

      counts[regionName] = (counts[regionName] || 0) + 1;
      amounts[regionName] = amounts[regionName] || 0;
    });

    const colors = ['bg-purple-500', 'bg-amber-500', 'bg-red-400', 'bg-sky-400', 'bg-orange-400', 'bg-emerald-500'];
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

  // --- CALCUL DES COMPTEURS POUR LES 12 RÉGIONS OFFICIELLES DU MAROC ---
  const getAllMoroccoRegionsStats = () => {
    const validProfs = professeursExistants.filter(p => {
      const ville = (p.ville || p.city || '').toLowerCase().trim();
      return ville && ville !== 'admin';
    });

    const countsMap: { [key: string]: number } = {};
    validProfs.forEach(p => {
      const v = (p.ville || p.city || '').toLowerCase().trim();
      let matchedRegion = "Casablanca-Settat"; // valeur par défaut

      if (v.includes('casa') || v.includes('casablanca')) matchedRegion = "Casablanca-Settat";
      else if (v.includes('marakech') || v.includes('marrakech') || v.includes('safi')) matchedRegion = "Marrakech-Safi";
      else if (v.includes('rabat') || v.includes('salé') || v.includes('kenitra') || v.includes('kénitra')) matchedRegion = "Rabat-Salé-Kénitra";
      else if (v.includes('fès') || v.includes('fes') || v.includes('meknès') || v.includes('meknes')) matchedRegion = "Fès-Meknès";
      else if (v.includes('tanger') || v.includes('tetouan') || v.includes('tétouan') || v.includes('hoceima')) matchedRegion = "Tanger-Tétouan-Al Hoceïma";
      else if (v.includes('oujda') || v.includes('oriental') || v.includes('nador')) matchedRegion = "l'Oriental";
      else if (v.includes('beni') || v.includes('khénifra') || v.includes('khouribga')) matchedRegion = "Béni Mellal-Khénifra";
      else if (v.includes('errachidia') || v.includes('drâa') || v.includes('ouarzazate')) matchedRegion = "Drâa-Tafilalet";
      else if (v.includes('agadir') || v.includes('souss') || v.includes('inzegane')) matchedRegion = "Souss-Massa";
      else if (v.includes('guelmim') || v.includes('tan-tan')) matchedRegion = "Guelmim-Oued Noun";
      else if (v.includes('laâyoune') || v.includes('layoune')) matchedRegion = "Laâyoune-Sakia El Hamra";
      else if (v.includes('dakhla')) matchedRegion = "Dakhla-Oued Ed-Dahab";

      countsMap[matchedRegion] = (countsMap[matchedRegion] || 0) + 1;
    });

    return ALL_MOROCCO_REGIONS.map(regionName => ({
      region: regionName,
      count: countsMap[regionName] || 0
    }));
  };

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

        {/* ================= GRAPHIQUE CA DYNAMIQUE & RÉGIONS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-gray-900">Évolution du chiffre d'affaires (MAD)</h2>
                <p className="text-xs text-gray-400">Total calculé en temps réel depuis les transactions ({selectedYear})</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black text-xs rounded-full">
                {monthlyRevenueData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} MAD
              </span>
            </div>

            <div className="h-52 w-full flex items-end justify-between gap-2 pt-6 px-2 relative bg-gradient-to-b from-amber-50/50 to-transparent rounded-2xl border border-dashed border-gray-100">
              {monthlyRevenueData.map((item, idx) => {
                const heightPercent = chartRevenueMax > 0 ? (item.amount / chartRevenueMax) * 100 : 0;
                const finalHeight = item.amount > 0 ? Math.max(heightPercent, 8) : 4;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-8 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 whitespace-nowrap shadow-md">
                      {item.amount.toLocaleString()} MAD
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-amber-500 to-red-400 rounded-t-lg transition-all duration-300 hover:opacity-100 opacity-85" 
                      style={{ height: `${finalHeight}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-gray-500 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= CARTE RÉGIONS (TITRE CLIQUABLE EN HAUT) ================= */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <div>
              {/* Titre cliquable pour ouvrir la liste complète de toutes les régions du Maroc */}
              <div 
                onClick={() => setIsRegionsModalOpen(true)}
                className="group cursor-pointer inline-block mb-1"
                title="Cliquer pour afficher toutes les régions du Maroc"
              >
                <h2 className="text-base font-black text-gray-900 group-hover:text-[#103D3B] transition flex items-center gap-1.5">
                  Professeurs par région
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
                </h2>
              </div>
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

            <button 
              onClick={() => setIsRegionsModalOpen(true)}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-[#103D3B] font-bold text-xs rounded-xl border border-gray-200 transition text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Voir toutes les régions du Maroc ({ALL_MOROCCO_REGIONS.length})</span>
            </button>
          </div>
        </div>

        {/* ================= GRAPHIQUE LINÉAIRE DES DEMANDES ================= */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-gray-900">Nombre de demandes reçues par mois</h2>
              <p className="text-xs text-gray-400">Survolez les points pour afficher le nombre exact de demandes par mois.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-600">Année :</span>
                <select 
                  value={selectedYear} 
                  onChange={(e) => { setSelectedYear(e.target.value); setHoveredPoint(null); }}
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

          <div className="relative w-full h-80 pt-8 pb-4 px-6 bg-white rounded-2xl border border-gray-100 flex flex-col justify-end">
            
            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-60">
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-500 font-bold pr-2">{chartMax}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-500 font-bold pr-2">{chartMax - stepVal}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-500 font-bold pr-2">{chartMax - stepVal * 2}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-500 font-bold pr-2">{chartMax - stepVal * 3}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-500 font-bold pr-2">{chartMax - stepVal * 4}</span></div>
              <div className="w-full border-b border-dashed border-gray-200 flex items-center justify-end"><span className="text-[10px] text-gray-500 font-bold pr-2">0</span></div>
            </div>

            <div className="relative w-full h-48 z-10 ml-2">
              <svg viewBox="0 0 1100 260" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#103D3B" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#103D3B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {(() => {
                  const points = monthlyData.map((d, index) => {
                    const x = (index / (monthlyData.length - 1)) * 1040 + 30;
                    const y = chartMax > 0 ? 240 - (d.count / chartMax) * 220 : 240;
                    return { x, y, count: d.count, month: d.month };
                  });

                  const pathD = points.reduce((acc, p, idx) => idx === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, '');
                  const areaD = `${pathD} L ${points[points.length - 1].x},260 L ${points[0].x},260 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#lineGradient)" />
                      <path d={pathD} fill="none" stroke="#103D3B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      
                      {points.map((p, idx) => {
                        const isHovered = hoveredPoint?.month === p.month;
                        return (
                          <g key={idx} transform={`translate(${p.x}, ${p.y})`} className="cursor-pointer group">
                            <circle 
                              cx="0" 
                              cy="0" 
                              r="16" 
                              fill="transparent" 
                              onMouseEnter={() => setHoveredPoint({ month: p.month, count: p.count })}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            
                            <circle 
                              cx="0" 
                              cy="0" 
                              r={isHovered ? "7" : "5"} 
                              fill={isHovered ? "#FF5733" : "#ffffff"} 
                              stroke="#103D3B" 
                              strokeWidth="3" 
                              className="transition-all duration-200 pointer-events-none"
                            />

                            {isHovered && (
                              <g transform="translate(0, -32)" className="pointer-events-none">
                                <rect x="-30" y="-20" width="60" height="24" rx="6" fill="#103D3B" />
                                <text x="0" y="-5" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
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

            <div className="flex justify-between text-[11px] font-bold text-gray-500 px-4 pt-3 border-t border-gray-100">
              {monthlyData.map((item, idx) => (
                <span key={idx} className="text-center flex-1">
                  {item.month}
                </span>
              ))}
            </div>
          </div>

          {hoveredPoint ? (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
              <span className="font-bold text-amber-900">
                📌 Mois survolé : <strong className="text-[#103D3B]">{hoveredPoint.month} {selectedYear}</strong> — <strong>{hoveredPoint.count}</strong> demande(s).
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500">
              <span>💡 Passez simplement votre curseur sur les points de la courbe pour inspecter chaque mois.</span>
            </div>
          )}
        </div>

      </main>

      {/* ================= MODALE : TABLEAU COMPLET DES 12 RÉGIONS DU MAROC ================= */}
      {isRegionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setIsRegionsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden z-10 border border-gray-100 flex flex-col max-h-[85vh]">
            
            <div className="p-6 bg-[#103D3B] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">Répartition par Régions du Maroc</h3>
                <p className="text-xs text-emerald-200 mt-0.5">Liste officielle des 12 régions et nombre de professeurs associés</p>
              </div>
              <button 
                onClick={() => setIsRegionsModalOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>Total des professeurs actifs répertoriés :</span>
                <span className="font-black text-[#103D3B] bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                  {professeursExistants.filter(p => (p.ville || p.city || '').toLowerCase().trim() !== 'admin').length} profs
                </span>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-black text-gray-700">
                      <th className="p-4">Région du Maroc</th>
                      <th className="p-4 text-right">Nombre de Professeurs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-800">
                    {getAllMoroccoRegionsStats().map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50/80 transition">
                        <td className="p-4 flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${row.count > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                          <span className="font-bold text-gray-900">{row.region}</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full font-bold ${row.count > 0 ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                            {row.count} {row.count > 1 ? 'professeurs' : 'professeur'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setIsRegionsModalOpen(false)}
                className="px-5 py-2.5 bg-[#103D3B] hover:bg-[#0d312f] text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

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