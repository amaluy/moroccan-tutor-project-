'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Card, Metric, Text, Badge, ProgressBar, Flex, Grid 
} from '@tremor/react';
import { 
  Edit3, Calendar, Users, ArrowRight, 
  X, Sun, Moon, LogOut, ChevronDown, User, Coins, PlusCircle, MessageSquare, ShieldCheck, Lightbulb, Zap,
  LayoutGrid, ChevronsLeft, ChevronsRight, Globe, Trophy, FileText
} from 'lucide-react';

// Importation des composants du dashboard
import ProfileViewsCard from '@/app/components/profdashboard/ProfileViewsCard';
import LeaderboardWidget from '@/app/components/profdashboard/LeaderboardWidget';
import QuestWidget from '@/app/components/profdashboard/QuestWidget';
import BadgesWidget from '@/app/components/profdashboard/BadgesWidget';
import ReferralCard from '@/app/components/profdashboard/ReferralCard';
import LeadsQualityCard from '@/app/components/profdashboard/LeadsQualityCard';

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
  const pathname = usePathname();
  const [profData, setProfData] = useState<Professor | null>(null);
  const [profName, setProfName] = useState('');
  const [profImage, setProfImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [profLeadsList, setProfLeadsList] = useState<any[]>([]);

  // ÉTATS CLASSEMENT / LEADERBOARD
  const [profRank, setProfRank] = useState<number>(1);
  const [profScore, setProfScore] = useState<number>(140);
  const [profLeague, setProfLeague] = useState<string>('Ligue Or 🥇');
  const [topProfessors, setTopProfessors] = useState<any[]>([]);

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
    async function fetchProfData() {
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

            setProfName(fullName || prof.email || 'Professeur');
            setProfImage(prof.photo_URL || prof.photo_url || prof.image_url || prof.photo || '');
            setIsAvailable(prof.available ?? true);

            const profEmailTarget = (prof.email || rawEmail || '').toLowerCase().trim();
            
            const { data: leadsData } = await supabase
              .from('leads')
              .select('*')
              .or(`professor_email.eq.${profEmailTarget},professor_id.eq.${prof.id}`);

            if (leadsData) {
              const unreadLeads = leadsData.filter((lead: any) => lead.is_read === false).length;
              setUnreadCount(unreadLeads);
              setProfLeadsList(leadsData);
            }

            const { data: leaderboardData } = await supabase
              .from('professor_leaderboard')
              .select('*')
              .order('rank', { ascending: true });

            if (leaderboardData && leaderboardData.length > 0) {
              const currentProfInBoard = leaderboardData.find((p: any) => String(p.id) === String(prof?.id));
              if (currentProfInBoard) {
                setProfRank(currentProfInBoard.rank);
                setProfScore(currentProfInBoard.total_score);
                setProfLeague(currentProfInBoard.league || 'Ligue Or 🥇');
              }

              const formattedTop = leaderboardData.slice(0, 5).map((p: any) => ({
                id: p.id,
                name: `${p['Prénom'] || p.prenom || ''} ${p['Nom'] || p.nom || ''}`.trim() || 'Professeur',
                score: p.total_score,
                rank: p.rank,
                league: p.league,
                isCurrentProf: String(p.id) === String(prof?.id)
              }));
              setTopProfessors(formattedTop);
            }
          }
        }
      } catch (err) {
        console.error("Erreur dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfData();
  }, [router]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-[#0A0A0A] text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        Chargement de l&apos;espace enseignant...
      </div>
    );
  }

  const leadBalance = profData?.leads_restants ?? 0;

  // MISE À JOUR DE LA NAVIGATION AVEC COMPÉTITION ET RÉGLEMENTATION
  const navItems = [
    { href: '/prof/dashboard', label: "Vue d'ensemble", icon: LayoutGrid },
    { href: '/prof/dashboard/gestion_demande', label: 'Demandes', icon: Users },
    { href: '/prof/dashboard/messagerie', label: 'Messagerie', icon: MessageSquare, badge: unreadCount },
    { href: '/prof/dashboard/disponibilites', label: 'Disponibilités', icon: Calendar },
    { href: '/prof/dashboard/credits', label: 'Leads et crédits', icon: Coins },
    { href: '/prof/dashboard/competition', label: 'Compétition', icon: Trophy },
    { href: '/prof/dashboard/reglementation', label: 'Réglementation', icon: FileText },
    { href: '/prof/profile', label: 'Mon profil', icon: User },
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* SIDEBAR FIXE ANTHRACITE */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-200 lg:sticky lg:top-0 lg:h-screen ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}`}
      >
        <div className={`flex h-16 items-center justify-between border-b border-slate-800 px-4 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <Link href="/prof/dashboard" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500 text-white font-black shadow-md shadow-orange-500/20">
              P
            </span>
            <span className={`text-base font-bold tracking-tight text-white ${collapsed ? 'lg:hidden' : ''}`}>
              Prof<span className="text-orange-500">Maroc</span>
            </span>
          </Link>
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={`hidden size-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 lg:flex ${collapsed ? 'lg:hidden' : ''}`}
          >
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
          {navItems.map((n) => {
            const active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  collapsed ? 'lg:justify-center lg:px-0' : ''
                } ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
              >
                <span className="relative">
                  <Icon className="size-[18px]" />
                  {!!n.badge && collapsed && <span className="absolute -right-1 -top-1 hidden size-2 rounded-full bg-rose-500 lg:block" />}
                </span>
                <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>{n.label}</span>
                {!!n.badge && !collapsed && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                    {n.badge > 9 ? '9+' : n.badge}
                  </span>
                )}
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

      {/* CONTENEUR PRINCIPAL DROIT */}
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
              <h2 className="text-base font-bold tracking-tight">Tableau de bord</h2>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/" className={`hidden items-center gap-2 px-3 text-xs font-semibold text-slate-500 hover:underline md:flex`}>
                <Globe className="size-4" /> Accueil du site
              </Link>

              <Link 
                href="/prof/dashboard/credits"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  isDarkMode 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' 
                    : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
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
                      <Image src={profImage} alt={profName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-700">
                        {profName[0] || 'P'}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline px-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {profName.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>

                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-xl p-2 z-50 transition-all ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}>
                    <div className="px-3 py-2 border-b border-slate-700/50 mb-1">
                      <p className="text-xs font-bold truncate">{profName}</p>
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

        {/* CONTENEUR PRINCIPAL MAX-W-[1600PX] */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-8">
          
          {/* TOP BANNER : BIENVENUE & ACTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Bonjour, {profName.split(' ')[0]} 👋</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Gérez vos demandes de cours et maximisez votre visibilité au Maroc.</p>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                href="/prof/dashboard/credits" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Coins className="w-4 h-4" />
                <span>Solde : {leadBalance} Leads</span>
                <PlusCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* SECTION HERO DES KPI TREMOR (3 CARTES ANALYTIQUES DYNAMIQUES) */}
          <Grid numItemsSm={1} numItemsLg={3} className="gap-6">
            
            {/* KPI 1 : Demandes Reçues */}
            <Card className="rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <Flex alignItems="start">
                <div>
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Demandes d&apos;Élèves</Text>
                  <Metric className="text-3xl font-black mt-1 text-slate-900 dark:text-white">
                    {profLeadsList.length} <span className="text-sm font-bold text-slate-400">reçues</span>
                  </Metric>
                </div>
                <Badge color="orange" size="xs">+24% ce mois</Badge>
              </Flex>
              <div className="mt-4">
                <Flex className="mb-1 text-xs">
                  <Text className="text-slate-400">Taux de réponse WhatsApp</Text>
                  <Text className="font-bold text-orange-500">85%</Text>
                </Flex>
                <ProgressBar value={85} color="orange" className="h-2" />
              </div>
            </Card>

            {/* KPI 2 : Qualité des Leads */}
            <Card className="rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <Flex alignItems="start">
                <div>
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Indice de Sérénité</Text>
                  <Metric className="text-3xl font-black mt-1 text-emerald-500">
                    Intention Élevée 🔥
                  </Metric>
                </div>
                <Badge color="emerald" size="xs">Élèves vérifiés</Badge>
              </Flex>
              <div className="mt-4">
                <Flex className="mb-1 text-xs">
                  <Text className="text-slate-400">Fiabilité des numéros</Text>
                  <Text className="font-bold text-emerald-500">98%</Text>
                </Flex>
                <ProgressBar value={98} color="emerald" className="h-2" />
              </div>
            </Card>

            {/* KPI 3 : Consommation des Crédits / Leads */}
            <Card className="rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <Flex alignItems="start">
                <div>
                  <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Solde de Crédits</Text>
                  <Metric className="text-3xl font-black mt-1 text-amber-500">
                    {leadBalance} <span className="text-sm font-bold text-slate-400">Leads restants</span>
                  </Metric>
                </div>
                <Badge color="amber" size="xs">Prêt à répondre</Badge>
              </Flex>
              <div className="mt-4">
                <Flex className="mb-1 text-xs">
                  <Text className="text-slate-400">Autonomie estimée</Text>
                  <Text className="font-bold text-amber-500">12 Jours</Text>
                </Flex>
                <ProgressBar value={Math.min((leadBalance / 20) * 100, 100)} color="amber" className="h-2" />
              </div>
            </Card>

          </Grid>

          {/* LAYOUT EN 12 COLONNES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SECTEUR GAUCHE (8 COLONNES) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* GRAPHIQUE DE VISIBILITÉ TREMOR */}
              <ProfileViewsCard isDarkMode={isDarkMode} />

              {/* ACCÈS GESTION DES DEMANDES */}
              <Link 
                href="/prof/dashboard/gestion_demande"
                className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group block relative overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/20 border-slate-800 hover:border-orange-500/40' 
                    : 'bg-white border-slate-200/80 shadow-xs hover:shadow-xl hover:border-orange-200'
                }`}
              >
                <div className="space-y-3 relative z-10">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/50 text-orange-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Gestion des Demandes d&apos;Élèves</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                      Accédez aux détails des élèves intéressés par vos cours avant de débloquer leurs numéros.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-xs font-black text-orange-600 gap-2 group-hover:translate-x-1.5 transition-transform relative z-10">
                  <span>Consulter la liste complète</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              {/* QUALITÉ DES LEADS & INDICE DE SÉRIEUX */}
              <LeadsQualityCard isDarkMode={isDarkMode} leads={profLeadsList} />

              {/* GRILLE DUAL (LEADS & DISPONIBILITÉS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <Link 
                  href="/prof/dashboard/credits"
                  className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                    isDarkMode 
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mes Leads Restants</h3>
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Solde Actuel :</span>
                        <p className={`text-3xl font-black mt-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                          {leadBalance} <span className="text-xs font-semibold text-slate-400">Leads</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-xs font-extrabold text-amber-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                    <PlusCircle className="w-4 h-4" />
                    <span>Recharger mon solde</span>
                  </div>
                </Link>

                <Link 
                  href="/prof/dashboard/disponibilites"
                  className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                    isDarkMode 
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' 
                      : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mes Disponibilités</h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                        Mettez à jour vos créneaux pour continuer à figurer en tête de liste.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center text-xs font-extrabold text-blue-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Mettre à jour mon emploi du temps</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>

              </div>

              {/* ÉDITION DU PROFIL */}
              <Link 
                href="/prof/profile"
                className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group block ${
                  isDarkMode 
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700' 
                    : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Modifier mon Profil</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                      Ajustez vos tarifs horaires, votre biographie et vos matières enseignées.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center text-xs font-extrabold text-emerald-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                  <span>Éditer les informations</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <ReferralCard isDarkMode={isDarkMode} />

            </div>

            {/* SECTEUR DROIT LATÉRAL (4 COLONNES) */}
            <div className="lg:col-span-4 space-y-8">
              
              <LeaderboardWidget 
                isDarkMode={isDarkMode}
                profRank={profRank}
                profScore={profScore}
                profLeague={profLeague}
                topProfessors={topProfessors}
              />

              <QuestWidget isDarkMode={isDarkMode} />

              <BadgesWidget isDarkMode={isDarkMode} />

              <div className={`p-6 rounded-3xl border transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-900 to-amber-950/20 border-slate-800 text-white' 
                  : 'bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-200/60 text-slate-900'
              }`}>
                <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Astuce de Visibilité</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Les enseignants qui mettent à jour leurs disponibilités 2 fois par semaine reçoivent en moyenne <strong>+40% de demandes directes</strong>.
                </p>
              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}