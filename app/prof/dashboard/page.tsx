'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Edit3, Calendar, Users, ArrowRight, 
  X, ArrowDown, Sun, Moon, LogOut, ChevronDown, User, Coins, PlusCircle, MessageSquare, ShieldCheck, Lightbulb, Zap,
  LayoutGrid, ChevronsLeft, ChevronsRight, Globe, Bell, Target, Trophy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import birdAnimation from '@/app/bird.json';

// Importation des composants du dashboard
import ProfileViewsCard from '@/app/components/profdashboard/ProfileViewsCard';
import LeaderboardWidget from '@/app/components/profdashboard/LeaderboardWidget';
import QuestWidget from '@/app/components/profdashboard/QuestWidget';
import BadgesWidget from '@/app/components/profdashboard/BadgesWidget';
import ReferralCard from '@/app/components/profdashboard/ReferralCard';
import LeadsQualityCard from '@/app/components/profdashboard/LeadsQualityCard';

const LottieAnimation = dynamic(() => import('@/app/components/LottieAnimation'), { ssr: false });

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

const STEPS = [
  {
    targetId: "step-welcome",
    title: "Bienvenue dans votre Espace !",
    description: "Bonjour ! Je suis Profy 🦉. Je vais vous montrer comment piloter votre compte et trouver rapidement des élèves.",
  },
  {
    targetId: "step-views",
    title: "1. Vues & Visibilité du Profil",
    description: "Consultez le nombre de parents et d'élèves qui recherchent vos cours chaque jour.",
  },
  {
    targetId: "step-competition",
    title: "2. Votre Ligue & Classement",
    description: "Suivez votre position en temps réel et gagnez des XP pour passer dans la ligue supérieure !",
  },
  {
    targetId: "step-quests",
    title: "3. Objectifs & Quêtes",
    description: "Complétez des défis mensuels pour accumuler des bonus de visibilité.",
  },
  {
    targetId: "step-leads",
    title: "4. Demandes d'Élèves & Sérieux",
    description: "Suivez l'indice de sérieux des étudiants avant d'engager vos crédits.",
  },
  {
    targetId: "step-credits",
    title: "5. Leads Restants",
    description: "Suivez votre solde de crédits/leads pour répondre aux élèves.",
  },
  {
    targetId: "step-calendar",
    title: "6. Planning",
    description: "Gérez vos jours et créneaux de cours en toute simplicité.",
  },
  {
    targetId: "step-profile",
    title: "7. Édition de Profil",
    description: "Ajustez vos tarifs et vos informations à tout moment.",
  }
];

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

  const [showCartoonWalkOwl, setShowCartoonWalkOwl] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

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

        const hasSeenIntro = sessionStorage.getItem('hasSeenCartoonWalkOwl');
        if (!hasSeenIntro) {
          setShowCartoonWalkOwl(true);
          sessionStorage.setItem('hasSeenCartoonWalkOwl', 'true');
          setTimeout(() => {
            setShowCartoonWalkOwl(false);
          }, 7000);
        }

        const hasSeenTour = localStorage.getItem('hasSeenFreeOwlTour');
        if (!hasSeenTour) {
          setShowTutorial(true);
        }

      } catch (err) {
        console.error("Erreur dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfData();
  }, [router]);

  useEffect(() => {
    if (!showTutorial) return;

    const updateRect = () => {
      const targetElement = document.getElementById(STEPS[currentStep].targetId);
      if (targetElement) {
        setTargetRect(targetElement.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentStep, showTutorial]);

  const handleNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem('hasSeenFreeOwlTour', 'true');
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setShowTutorial(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-[#0A0A0A] text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        Chargement de l&apos;espace enseignant...
      </div>
    );
  }

  const activeTarget = STEPS[currentStep].targetId;
  const leadBalance = profData?.leads_restants ?? 0;

  const navItems = [
    { href: '/prof/dashboard', label: "Vue d'ensemble", icon: LayoutGrid },
    { href: '/prof/dashboard/gestion_demande', label: 'Demandes', icon: Users },
    { href: '/prof/dashboard/messagerie', label: 'Messagerie', icon: MessageSquare, badge: unreadCount },
    { href: '/prof/dashboard/disponibilites', label: 'Disponibilités', icon: Calendar, id: 'step-calendar' },
    { href: '/prof/dashboard/credits', label: 'Leads et crédits', icon: Coins },
    { href: '/prof/profile', label: 'Mon profil', icon: User, id: 'step-profile' },
  ];

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* --- SIDEBAR FIXE BLEUE (Inspirée du modèle SaaS Pro) --- */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0B2A6F] text-white transition-all duration-200 lg:sticky lg:top-0 lg:h-screen ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}`}
      >
        <div className={`flex h-16 items-center justify-between border-b border-white/10 px-4 ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          <Link href="/prof/dashboard" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white text-[#0B2A6F] font-black">
              P
            </span>
            <span className={`text-base font-bold tracking-tight ${collapsed ? 'lg:hidden' : ''}`}>
              Prof<span className="text-orange-400">Maroc</span>
            </span>
          </Link>
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={`hidden size-7 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 lg:flex ${collapsed ? 'lg:hidden' : ''}`} 
            aria-label="Réduire le menu"
          >
            <ChevronsLeft className="size-4" />
          </button>
          <button onClick={() => setMobileOpen(false)} className="flex size-7 items-center justify-center rounded-md bg-white/10 lg:hidden">
            <X className="size-4" />
          </button>
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="mx-auto mt-3 hidden size-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/20 lg:flex">
            <ChevronsRight className="size-4" />
          </button>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((n) => {
            const active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                id={n.id}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                title={n.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  collapsed ? 'lg:justify-center lg:px-0' : ''
                } ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="relative">
                  <Icon className="size-[18px]" />
                  {!!n.badge && collapsed && <span className="absolute -right-1 -top-1 hidden size-2 rounded-full bg-rose-500 lg:block" />}
                </span>
                <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>{n.label}</span>
                {!!n.badge && !collapsed && (
                  <span className="rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold leading-5 text-white">
                    {n.badge > 9 ? '9+' : n.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10 cursor-pointer ${
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
        
        {/* --- TOPBAR SAAS ÉPURÉE --- */}
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

              <div id="step-status" className={`${showTutorial && activeTarget === 'step-status' ? 'relative z-40' : ''}`}>
                <button
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                  title={isAvailable ? "En ligne" : "Masqué"}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                </button>
              </div>

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

        {/* --- ANIMATION HIBOU PROFY --- */}
        <AnimatePresence>
          {showCartoonWalkOwl && (
            <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.85, 0.85, 0] }}
                transition={{ duration: 7, times: [0, 0.1, 0.9, 1] }}
                className="absolute inset-0 bg-black/90 transition-opacity"
              />
              <motion.div
                initial={{ x: "-15vw", y: "55vh" }}
                animate={{ 
                  x: ["-15vw", "42vw", "42vw", "90vw"], 
                  y: ["55vh", "55vh", "55vh", "82vh"] 
                }}
                transition={{ duration: 7, times: [0, 0.4, 0.75, 1], ease: ["easeInOut", "easeInOut", "easeInOut"] }}
                className="absolute z-50 flex items-center"
              >
                <motion.div
                  animate={{ y: [0, -14, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.55, ease: "easeInOut" }}
                  className="relative flex items-center justify-center w-36 h-36 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                >
                  <LottieAnimation animationData={birdAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 15 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1, 1, 0.7], y: [15, 0, 0, 15] }}
                  transition={{ duration: 7, times: [0.38, 0.43, 0.72, 0.77] }}
                  className="absolute left-32 -top-12 bg-white text-slate-900 px-6 py-4 rounded-3xl border-4 border-orange-500 shadow-2xl flex flex-col gap-2 min-w-[300px]"
                >
                  <p className="text-sm font-black text-orange-600 tracking-wide">Bonjour, je suis votre assistant ! 🦉</p>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">Retrouvez toutes vos fonctionnalités directement sur votre tableau de bord.</p>
                  <div className="absolute -bottom-7 left-8 bg-slate-900 text-white p-2 rounded-full shadow-xl animate-bounce border-2 border-orange-500">
                    <ArrowDown className="w-5 h-5 stroke-[3]" />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- SPOTLIGHT TUTORIEL --- */}
        <AnimatePresence>
          {showTutorial && targetRect && (
            <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80" />
              <motion.div
                className="absolute bg-white rounded-3xl shadow-2xl transition-all duration-300 pointer-events-auto"
                style={{
                  top: targetRect.top - 8,
                  left: targetRect.left - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                }}
                layoutId="spotlight-box"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          )}
        </AnimatePresence>

        {/* --- CONTENEUR PRINCIPAL OPTIMISÉ GRAND ÉCRAN (MAX-W-[1600PX]) --- */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-8">
          
          {/* TOP BANNER : BIENVENUE & SOLDE */}
          <div id="step-welcome" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Bonjour, {profName.split(' ')[0]} 👋</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Gérez vos demandes de cours et maximisez vos opportunités d&apos;enseignement.</p>
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

          {/* RECAPITULATIF KPI (HERO SECTION) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Demandes reçues</span>
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-black text-orange-500">{profLeadsList.length} demandes</p>
            </div>

            <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Qualité des Leads</span>
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-500">Intention Élevée 🔥</p>
            </div>

            <div className={`p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'}`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Statut Enseignant</span>
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-purple-400">Profil Vérifié</p>
            </div>
          </div>

          {/* LAYOUT EN 12 COLONNES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SECTEUR GAUCHE (8 COLONNES) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* GRAPHIQUE DE VISIBILITÉ */}
              <div id="step-views" className={`${showTutorial && activeTarget === 'step-views' ? 'relative z-40' : ''}`}>
                <ProfileViewsCard isDarkMode={isDarkMode} />
              </div>

              {/* ACCÈS GESTION DES DEMANDES */}
              <div id="step-leads" className={`${showTutorial && activeTarget === 'step-leads' ? 'relative z-40' : ''}`}>
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
              </div>

              {/* QUALITÉ DES LEADS & INDICE DE SÉRIEUX */}
              <LeadsQualityCard isDarkMode={isDarkMode} leads={profLeadsList} />

              {/* GRILLE DUAL (LEADS & DISPONIBILITÉS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div id="step-credits" className={`${showTutorial && activeTarget === 'step-credits' ? 'relative z-40' : ''}`}>
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
                </div>

                <div id="step-calendar" className={`${showTutorial && activeTarget === 'step-calendar' ? 'relative z-40' : ''}`}>
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

              </div>

              {/* ÉDITION DU PROFIL */}
              <div id="step-profile" className={`${showTutorial && activeTarget === 'step-profile' ? 'relative z-40' : ''}`}>
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
              </div>

              <ReferralCard isDarkMode={isDarkMode} />

            </div>

            {/* SECTEUR DROIT LATÉRAL (4 COLONNES) */}
            <div className="lg:col-span-4 space-y-8">
              
              <div id="step-competition" className={`${showTutorial && activeTarget === 'step-competition' ? 'relative z-40' : ''}`}>
                <LeaderboardWidget 
                  isDarkMode={isDarkMode}
                  profRank={profRank}
                  profScore={profScore}
                  profLeague={profLeague}
                  topProfessors={topProfessors}
                />
              </div>

              <div id="step-quests" className={`${showTutorial && activeTarget === 'step-quests' ? 'relative z-40' : ''}`}>
                <QuestWidget isDarkMode={isDarkMode} />
              </div>

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

        {/* --- MODALE TUTORIEL INTERACTIF --- */}
        <AnimatePresence>
          {showTutorial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl shadow-2xl max-w-sm w-full pointer-events-auto space-y-4 text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Étape {currentStep + 1} sur {STEPS.length}
                  </span>
                  <button onClick={() => setShowTutorial(false)} className="text-slate-400 hover:text-white p-1 transition cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-black text-white">{STEPS[currentStep].title}</h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">{STEPS[currentStep].description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className="text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                  >
                    ← Précédent
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextStep}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{currentStep === STEPS.length - 1 ? "Terminer" : "Suivant"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* BOUTON FLOTTANT DU TUTORIEL */}
        {!showTutorial && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={restartTutorial}
            className={`fixed bottom-6 right-6 p-3.5 rounded-full shadow-2xl transition-all z-40 flex items-center gap-2.5 border-2 border-orange-500 cursor-pointer group ${
              isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
            }`}
            title="Relancer le guide interactif"
          >
            <div className="w-8 h-8 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <LottieAnimation animationData={birdAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
            </div>
            <span className="text-xs font-extrabold pr-1 hidden sm:inline text-orange-500">Besoin d&apos;aide ?</span>
          </motion.button>
        )}

      </div>
    </div>
  );
}