'use client';
import AdminPanel from './adminPanel'; 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Users, CheckSquare, Trash2, Image as ImageIcon, Eye, X, Clock, 
  BarChart3, Upload, Settings, HelpCircle, Plus, Bell, ChevronRight, TrendingUp, Menu,
  LayoutDashboard, LogOut, Download, Calendar
} from 'lucide-react';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ALL_MOROCCO_REGIONS = [
  "Casablanca-Settat",
  "Marrakech-Safi",
  "Tanger-Tétouan-Al Hoceïma",
  "l'Oriental",
  "Fès-Meknès",
  "Rabat-Salé-Kénitra",
  "Béni Mellal-Khénifra",
  "Drâa-Tafilalet",
  "Souss-Massa",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed-Dahab"
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [professeursNouveaux, setProfesseursNouveaux] = useState<any[]>([]);
  const [professeursExistants, setProfesseursExistants] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);
  const [allRequestsHistory, setAllRequestsHistory] = useState<any[]>([]);
  const [realCa, setRealCa] = useState<number>(0);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const currentYearStr = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [availableYears, setAvailableYears] = useState<string[]>(['2026', '2027', '2028']);

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

      const { data: pData } = await supabase.from('professors').select('*');
      if (pData) { profsData = pData; setProfesseursExistants(pData); }

      const { data: rData } = await supabase.from('requests').select('*');
      if (rData) { reqsData = rData; setProfesseursNouveaux(rData); }

      const { data: tData } = await supabase.from('transactions').select('*');
      if (tData) { transData = tData; setTransactionsList(tData); }

      let combinedHistory: any[] = [...reqsData, ...profsData];
      setAllRequestsHistory(combinedHistory);

      let totalCa = transData.reduce((sum, item) => sum + Number(item.montant || item.amount || 0), 0);
      if (totalCa === 0) {
        totalCa = combinedHistory.reduce((sum, item) => sum + Number(item.montant || item.amount || 0), 0);
      }
      setRealCa(totalCa);
    } catch (err: any) {
      setDbError(err.message);
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
        if (!isNaN(d.getTime()) && d.getFullYear().toString() === selectedYear) {
          monthsAmounts[d.getMonth()] += Number(item.montant || item.amount || 0);
        }
      }
    });

    const monthNames = ['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return monthNames.map((name, index) => ({ month: name, amount: monthsAmounts[index] }));
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
        if (!isNaN(d.getTime()) && d.getFullYear().toString() === selectedYear) {
          monthsCounts[d.getMonth()]++;
        }
      }
    });

    const monthNames = ['Janv.', 'Fév.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
    return monthNames.map((name, index) => ({ month: name, count: monthsCounts[index] }));
  };

  const monthlyData = getMonthlyRequestsData();
  const maxDataVal = Math.max(...monthlyData.map(d => d.count), 0);
  const chartRequestsMax = maxDataVal <= 5 ? 10 : Math.ceil(maxDataVal / 5) * 5;

  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Mois;Annee;Nombre de Demandes\n";
    monthlyData.forEach(item => { csvContent += `${item.month};${selectedYear};${item.count}\n`; });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `demandes_profmaroc_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAllMoroccoRegionsStats = () => {
    const validProfs = professeursExistants.filter(p => {
      const ville = (p.ville || p.city || '').toLowerCase().trim();
      return ville && ville !== 'admin';
    });

    const countsMap: { [key: string]: number } = {};
    validProfs.forEach(p => {
      const v = (p.ville || p.city || '').toLowerCase().trim();
      let matchedRegion = "Casablanca-Settat";

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
    })).sort((a, b) => b.count - a.count);
  };

  if (!authorized) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Chargement...</div>;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans flex flex-col w-full">
      
      {/* EN-TÊTE ADMIN */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 w-full shadow-2xs">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 transition cursor-pointer flex items-center justify-center shadow-2xs">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-black text-base tracking-tight text-gray-900">profmaroc</span>
            <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">ADMIN</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={fetchDataFromSupabase} title="Actualiser" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer">
            <span className={`w-4 h-4 flex items-center justify-center ${isLoadingDb ? 'animate-spin' : ''}`}>🔄</span>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer">
            <Bell className="w-4 h-4" />
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

      {/* CONTENU PRINCIPAL */}
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
          <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-xs flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-750">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 bg-[#FF4747] text-white text-[11px] font-black rounded-full">-2,08%</span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 block mb-0.5">Visitor</span>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">14.987</h3>
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

        {/* SECTION PRINCIPALE : 2 COLONNES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLONNE GAUCHE (2 parts) : Chiffre d'affaires & Demandes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Graphique CA */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-base font-black text-gray-900">Évolution du chiffre d'affaires (MAD)</h2>
                  <p className="text-xs text-gray-400">Total calculé en temps réel depuis les transactions ({selectedYear})</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black text-xs rounded-full">
                  {monthlyRevenueData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} MAD
                </span>
              </div>

              <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 px-2 relative bg-gradient-to-b from-amber-50/50 to-transparent rounded-2xl border border-dashed border-gray-100">
                {monthlyRevenueData.map((item, idx) => {
                  const heightPercent = chartRevenueMax > 0 ? (item.amount / chartRevenueMax) * 100 : 0;
                  const finalHeight = item.amount > 0 ? Math.max(heightPercent, 8) : 4;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute -top-8 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 whitespace-nowrap shadow-md">
                        {item.amount.toLocaleString()} MAD
                      </div>
                      <div 
                        className="w-full bg-gradient-to-t from-amber-500 to-red-400 rounded-t-lg transition-all duration-300 opacity-85" 
                        style={{ height: `${finalHeight}%` }}
                      ></div>
                      <span className="text-[10px] font-bold text-gray-500 mt-2">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nouveau Graphique Demandes en Barres */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-black text-gray-900">Nombre de demandes reçues par mois</h2>
                  <p className="text-xs text-gray-400">Aperçu mensuel des demandes enregistrées sur la plateforme.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-600">Année :</span>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
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

              <div className="h-56 w-full flex items-end justify-between gap-3 pt-8 px-2 relative bg-gradient-to-b from-emerald-50/40 to-transparent rounded-2xl border border-dashed border-gray-100">
                {monthlyData.map((item, idx) => {
                  const heightPercent = chartRequestsMax > 0 ? (item.count / chartRequestsMax) * 100 : 0;
                  const finalHeight = item.count > 0 ? Math.max(heightPercent, 12) : 5;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="absolute -top-10 bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-25 whitespace-nowrap shadow-lg flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {item.count} demande(s) en {item.month}
                      </div>

                      {item.count > 0 && (
                        <span className="text-[10px] font-black text-[#103D3B] mb-1.5 opacity-90 group-hover:scale-110 transition-transform">
                          {item.count}
                        </span>
                      )}

                      <div 
                        className={`w-full rounded-t-xl transition-all duration-300 shadow-xs ${
                          item.count > 0 
                            ? 'bg-gradient-to-t from-[#103D3B] to-emerald-600 opacity-90 group-hover:opacity-100 group-hover:brightness-110' 
                            : 'bg-gray-200 opacity-60'
                        }`} 
                        style={{ height: `${finalHeight}%` }}
                      ></div>

                      <span className="text-[10px] font-bold text-gray-500 mt-2.5">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* COLONNE DROITE (1 part) : Professeurs par région */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">Professeurs par région</h2>
              <p className="text-xs text-gray-400">Liste complète des 12 régions du Maroc</p>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-black text-gray-700">
                    <th className="py-3 px-4">Région</th>
                    <th className="py-3 px-4 text-right">Profs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-900">
                  {getAllMoroccoRegionsStats().map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${row.count > 0 ? 'bg-emerald-500 shadow-xs' : 'bg-gray-300'}`}></span>
                        <span className="font-bold text-gray-900">{row.region}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-xs inline-block min-w-[28px] text-center ${
                          row.count > 0 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {row.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>

      {/* MENU LATÉRAL - CORRIGÉ AVEC UNE CLASSE DE TRANSITION/VISIBILITÉ FLUIDE */}
      <div className={`fixed inset-0 z-50 flex transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        <div className={`relative w-80 bg-white text-gray-800 flex flex-col shadow-2xl z-10 h-full border-r border-gray-100 transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Bouton de fermeture */}
          <div className="absolute top-4 right-4 z-20">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Intégration directe du composant AdminPanel */}
          <div className="flex-1 overflow-y-auto">
            <AdminPanel />
          </div>

        </div>
      </div>

    </div>
  );
}