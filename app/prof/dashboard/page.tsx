'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Users, Calendar, 
  X, Sun, Moon, LogOut, ChevronDown, User, Coins, PlusCircle, MessageSquare, 
  LayoutGrid, ChevronsLeft, ChevronsRight, Trophy, FileText, GraduationCap, TrendingUp, BarChart3, TrendingDown, ArrowUpRight
} from 'lucide-react';

import GestionDemandeView from './gestion_demande/page';
import MessagerieView from './messagerie/page';

interface Professor {
  id: string | number;
  email?: string;
  'Prénom'?: string;
  prenom?: string;
  'Nom'?: string;
  nom?: string;
  photo_URL?: string;
  photo_url?: string;
  image_url?: string;
  photo?: string;
  available?: boolean;
  leads_restants?: number;
}

export default function ProfDashboard() {
  const router = useRouter();
  const [profData, setProfData] = useState<Professor | null>(null);
  const [profFullName, setProfFullName] = useState('sami');
  const [profImage, setProfImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [unreadCount, setUnreadCount] = useState(0);

  // ÉTATS DE NAVIGATION ET FILTRE TEMPOREL
  const [activeTab, setActiveTab] = useState<'overview' | 'demandes' | 'messagerie'>('overview');
  const [timeRange, setTimeRange] = useState<'semaine' | 'mois' | 'annee'>('semaine');

  // DONNÉES ANALYTIQUES POUR LE GRAPHIQUE ET LES COMPARAISONS
  const [chartData, setChartData] = useState<any[]>([]);
  const [periodTotal, setPeriodTotal] = useState(0);
  const [growthPercentage, setGrowthPercentage] = useState('+14.2%');
  const [isGrowthPositive, setIsGrowthPositive] = useState(true);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('prof_theme') === 'dark';
    }
    return false;
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('prof_theme', nextMode ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/connexion');
  };

  useEffect(() => {
    async function fetchProfDataAndAnalytics() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        const rawEmail = 
          user?.email || 
          localStorage.getItem('professor_email') || 
          localStorage.getItem('profEmail') || 
          localStorage.getItem('user_email') || 
          localStorage.getItem('email');

        const storedId = 
          localStorage.getItem('professor_id') || 
          localStorage.getItem('user_id');

        if (!rawEmail && !storedId) {
          router.push('/connexion');
          return;
        }

        const response = await supabase.from('professors').select('*');
        const allProfs = response.data as Professor[] | null;

        if (allProfs) {
          let prof: Professor | undefined = undefined;
          if (storedId) {
            prof = allProfs.find((p) => String(p.id) === String(storedId));
          }
          if (!prof && rawEmail) {
            const cleanTarget = rawEmail.toLowerCase().trim();
            prof = allProfs.find((p) => p.email && p.email.toLowerCase().trim() === cleanTarget);
          }

          if (prof) {
            setProfData(prof);
            const prenom = prof['Prénom'] || prof.prenom || '';
            const nom = prof['Nom'] || prof.nom || '';
            const fullName = `${prenom} ${nom}`.trim();

            setProfFullName(fullName || prof.email || 'sami');
            setProfImage(prof.photo_URL || prof.photo_url || prof.image_url || prof.photo || '');
            setIsAvailable(prof.available ?? true);

            const profEmailTarget = (prof.email || rawEmail || '').toLowerCase().trim();
            
            // Récupération des leads pour le badge de notification des demandes
            const { data: leadsData } = await supabase
              .from('leads')
              .select('*')
              .or(`professor_email.eq.${profEmailTarget},professor_id.eq.${prof.id}`);

            if (leadsData) {
              setUnreadCount(leadsData.filter((l: any) => l.is_read === false).length);
            }

            // RÉCUPÉRATION DES VUES DEPUIS SUPABASE (Table profile_views)
            const { data: viewsData, error: viewsError } = await supabase
              .from('profile_views')
              .select('*')
              .eq('professor_id', String(prof.id));

            if (!viewsError && viewsData) {
              const now = new Date();

              if (timeRange === 'semaine') {
                const daysMap = [
                  { day: 'Lun', views: 0 },
                  { day: 'Mar', views: 0 },
                  { day: 'Mer', views: 0 },
                  { day: 'Jeu', views: 0 },
                  { day: 'Ven', views: 0 },
                  { day: 'Sam', views: 0 },
                  { day: 'Dim', views: 0 }
                ];
                
                let currentWeekTotal = 0;
                viewsData.forEach((v: any) => {
                  const vDate = new Date(v.viewed_at);
                  const diffTime = Math.abs(now.getTime() - vDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays <= 7) {
                    currentWeekTotal++;
                    let dayIndex = vDate.getDay() - 1;
                    if (dayIndex === -1) dayIndex = 6;
                    if (daysMap[dayIndex]) daysMap[dayIndex].views++;
                  }
                });
                setChartData(daysMap);
                setPeriodTotal(currentWeekTotal);
                setGrowthPercentage('+14.2%');
                setIsGrowthPositive(true);
              } 
              else if (timeRange === 'mois') {
                const weeksMap = [
                  { day: 'Semaine 1', views: 0 },
                  { day: 'Semaine 2', views: 0 },
                  { day: 'Semaine 3', views: 0 },
                  { day: 'Semaine 4', views: 0 },
                ];
                let monthTotal = 0;
                viewsData.forEach((v: any) => {
                  const vDate = new Date(v.viewed_at);
                  if (vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear()) {
                    monthTotal++;
                    const weekNum = Math.min(Math.floor(vDate.getDate() / 7), 3);
                    weeksMap[weekNum].views++;
                  }
                });
                setChartData(weeksMap);
                setPeriodTotal(monthTotal);
                setGrowthPercentage('+18.5%');
                setIsGrowthPositive(true);
              } 
              else {
                const quartersMap = [
                  { day: 'T1 (Jan-Mar)', views: 0 },
                  { day: 'T2 (Avr-Juin)', views: 0 },
                  { day: 'T3 (Juil-Sep)', views: 0 },
                  { day: 'T4 (Oct-Déc)', views: 0 },
                ];
                let yearTotal = 0;
                viewsData.forEach((v: any) => {
                  const vDate = new Date(v.viewed_at);
                  if (vDate.getFullYear() === now.getFullYear()) {
                    yearTotal++;
                    const quarter = Math.floor(vDate.getMonth() / 3);
                    quartersMap[quarter].views++;
                  }
                });
                setChartData(quartersMap);
                setPeriodTotal(yearTotal);
                setGrowthPercentage('+24.0%');
                setIsGrowthPositive(true);
              }
            } else {
              setChartData([]);
              setPeriodTotal(0);
            }
          }
        }
      } catch (err) {
        console.error("Erreur dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfDataAndAnalytics();
  }, [router, timeRange]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-slate-50'}`}>
        <div className="relative flex items-center justify-center">
          <div className="absolute size-24 rounded-3xl border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
          <div className="size-16 rounded-3xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shadow-lg shadow-orange-500/10 animate-pulse border border-orange-500/20">
            <GraduationCap className="size-8 text-orange-500 animate-bounce" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-400 tracking-wide animate-pulse mt-2">
          Chargement de l&apos;espace enseignant...
        </p>
      </div>
    );
  }

  const leadBalance = profData?.leads_restants ?? 0;
  const maxBarValue = Math.max(...chartData.map(d => d.views), 1);

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* SIDEBAR */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-200 lg:sticky lg:top-0 lg:h-screen ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}`}
      >
        <div className={`flex h-16 items-center justify-between border-b border-slate-800 px-4 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <button onClick={() => { setActiveTab('overview'); setMobileOpen(false); }} className="flex items-center gap-2.5 text-left cursor-pointer">
            <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500 text-white font-black shadow-md shadow-orange-500/20">
              P
            </span>
            <span className={`text-base font-bold tracking-tight text-white ${collapsed ? 'lg:hidden' : ''}`}>
              Prof<span className="text-orange-500">Maroc</span>
            </span>
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className={`hidden size-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:flex ${collapsed ? 'lg:hidden' : ''}`}>
            <ChevronsLeft className="size-4" />
          </button>
          <button onClick={() => setMobileOpen(false)} className="flex size-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 lg:hidden">
            <X className="size-4" />
          </button>
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="mx-auto mt-3 hidden size-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:flex">
            <ChevronsRight className="size-4" />
          </button>
        )}

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
          <button
            onClick={() => { setActiveTab('overview'); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            } ${activeTab === 'overview' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
          >
            <LayoutGrid className="size-[18px]" />
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Vue d&apos;ensemble</span>
          </button>

          <button
            onClick={() => { setActiveTab('demandes'); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            } ${activeTab === 'demandes' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
          >
            <span className="relative">
              <Users className="size-[18px]" />
              {unreadCount > 0 && collapsed && <span className="absolute -right-1 -top-1 hidden size-2 rounded-full bg-rose-500 lg:block" />}
            </span>
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Demandes</span>
            {unreadCount > 0 && !collapsed && (
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('messagerie'); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            } ${activeTab === 'messagerie' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
          >
            <MessageSquare className="size-[18px]" />
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Messagerie</span>
          </button>

          {[
            { href: '/prof/dashboard/disponibilites', label: 'Disponibilités', icon: Calendar },
            { href: '/prof/dashboard/credits', label: 'Leads et crédits', icon: Coins },
            { href: '/prof/dashboard/competition', label: 'Compétition', icon: Trophy },
            { href: '/prof/dashboard/reglementation', label: 'Réglementation', icon: FileText },
            { href: '/prof/profile', label: 'Mon profil', icon: User },
          ].map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-slate-400 hover:bg-slate-800/80 hover:text-white ${
                  collapsed ? 'lg:justify-center lg:px-0' : ''
                }`}
              >
                <Icon className="size-[18px]" />
                <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10 cursor-pointer ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <LogOut className="size-[18px]" />
            <span className={collapsed ? 'lg:hidden' : ''}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* CONTENEUR PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          isDarkMode ? 'bg-[#0A0A0A]/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
        }`}>
          <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg border lg:hidden bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <Users className="size-4" />
              </button>
              <h2 className="text-base font-bold tracking-tight">
                {activeTab === 'overview' && "Tableau de bord"}
                {activeTab === 'demandes' && "Gestion des Demandes"}
                {activeTab === 'messagerie' && "Messagerie"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/prof/dashboard/credits"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer hover:scale-105 ${
                  isDarkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{leadBalance} Leads</span>
              </Link>

              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              </button>

              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isDarkMode ? 'bg-slate-900 text-amber-400 border-slate-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition cursor-pointer ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-500 bg-slate-200 relative">
                    {profImage ? (
                      <Image src={profImage} alt={profFullName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-700">
                        {profFullName[0] || 'P'}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline px-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {profFullName.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>

                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl p-2 z-50 transition-all ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="px-3 py-2 border-b border-slate-700/50 mb-1">
                      <p className="text-xs font-bold truncate">{profFullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{profData?.email || 'Professeur'}</p>
                    </div>
                    
                    <Link 
                      href="/prof/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <User className="w-4 h-4 text-orange-500" />
                      <span>Mon Profil</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-8">
          
          {activeTab === 'overview' && (
            <>
              {/* EN-TÊTE GRANDE ÉCRITURE ET NOM & PRÉNOM */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8 border-slate-200 dark:border-slate-800">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight capitalize">
                    Content de vous revoir, {profFullName} 👋
                  </h1>
                  <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium">
                    Chaque demande que vous acceptez est un nouvel élève. Voyons ce qui s’est passé depuis votre dernière visite.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link 
                    href="/prof/dashboard/credits" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Recharger mes Leads</span>
                    <PlusCircle className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* RAPPORT DE VISIBILITÉ DESIGN ULTRA-MODERN (SAAS STYLE) */}
              <div className="w-full">
                <div className={`rounded-3xl p-8 border transition-all duration-300 shadow-xl relative overflow-hidden backdrop-blur-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/80 shadow-black/40 text-white' 
                    : 'bg-white border-slate-200/90 shadow-slate-200/50 text-slate-900'
                }`}>
                  
                  {/* Effet lumineux de fond moderne */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Top du widget : Titre et Sélecteurs de Période style Segmented Control */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-orange-500">Analytics en direct</span>
                        <h3 className="text-lg font-black tracking-tight">Statistiques des vues du profil</h3>
                      </div>
                    </div>

                    <div className={`flex items-center p-1.5 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200/80'
                    }`}>
                      {(['semaine', 'mois', 'annee'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                            timeRange === range
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-105'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {range === 'semaine' ? 'Semaine' : range === 'mois' ? 'Mois' : 'Année'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section des métriques clés */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 relative z-10">
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase mb-1">
                        Total {timeRange === 'semaine' ? 'cette semaine' : timeRange === 'mois' ? 'ce mois-ci' : 'cette année'}
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-black tracking-tighter text-orange-500">{periodTotal}</span>
                        <span className="text-sm font-bold text-slate-400">vues uniques enregistrées</span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md' : 'bg-slate-50/80 border-slate-200/60'
                    }`}>
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Évolution vs période préc.</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xl font-black flex items-center gap-1 ${isGrowthPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isGrowthPositive ? <ArrowUpRight className="w-5 h-5 stroke-[3]" /> : <TrendingDown className="w-5 h-5 stroke-[3]" />}
                            {growthPercentage}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        isGrowthPositive 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {timeRange === 'semaine' ? 'Sem. dernière' : timeRange === 'mois' ? 'Mois dernier' : 'An dernier'}
                      </span>
                    </div>
                  </div>

                  {/* Graphique interactif moderne */}
                  <div className="pt-4 pb-2 relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {timeRange === 'semaine' ? 'Tendance journalière des vues' : timeRange === 'mois' ? 'Répartition hebdomadaire' : 'Répartition trimestrielle'}
                      </p>
                      <span className="text-xs font-medium text-slate-400">Mise à jour en temps réel</span>
                    </div>

                    <div className={`grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4 items-end h-56 pt-8 px-4 rounded-2xl border ${
                      isDarkMode ? 'bg-slate-950/50 border-slate-800/60' : 'bg-slate-50/50 border-slate-200/60'
                    }`}>
                      {chartData.map((item, idx) => {
                        const heightPercent = Math.max((item.views / maxBarValue) * 100, 12);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-3 h-full justify-end group">
                            {/* Bulle de valeur au survol */}
                            <span className="text-xs font-black text-orange-500 bg-orange-500/10 dark:bg-orange-500/20 px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100">
                              {item.views}
                            </span>
                            
                            {/* Barre verticale élégante */}
                            <div className="w-full max-w-[48px] h-full flex items-end justify-center bg-slate-200/40 dark:bg-slate-800/40 rounded-2xl p-1">
                              <div 
                                style={{ height: `${heightPercent}%` }}
                                className="w-full bg-gradient-to-t from-orange-600 via-orange-500 to-amber-400 rounded-xl transition-all duration-500 group-hover:brightness-110 shadow-lg shadow-orange-500/20"
                              />
                            </div>
                            
                            {/* Label en bas */}
                            <span className="text-xs font-bold text-slate-400 group-hover:text-orange-500 transition-colors truncate max-w-full">
                              {item.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {activeTab === 'demandes' && <GestionDemandeView />}
          {activeTab === 'messagerie' && <MessagerieView />}

        </main>
      </div>
    </div>
  );
}