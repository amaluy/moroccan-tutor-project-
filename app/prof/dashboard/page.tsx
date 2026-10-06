'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Edit3, Calendar, Users, ArrowRight, 
  X, ArrowDown, Sun, Moon, LogOut, ChevronDown, User, Coins, PlusCircle, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import birdAnimation from '@/app/bird.json';

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

interface Lead {
  id: string | number;
  professor_email?: string;
  is_read?: boolean;
}

const STEPS = [
  {
    targetId: "step-welcome",
    title: "Bienvenue dans votre Espace !",
    description: "Bonjour ! Je suis Profy 🦉. Je vais vous montrer comment piloter votre compte et trouver rapidement des élèves.",
  },
  {
    targetId: "step-status",
    title: "1. Votre Statut de Visibilité",
    description: "Cliquez sur ce témoin coloré dans la barre du haut pour passer 'En Ligne' ou 'Masqué' instantanément.",
  },
  {
    targetId: "step-leads",
    title: "2. Demandes d'Élèves",
    description: "C'est ici que vous recevez toutes les demandes principales. Vous pouvez échanger directement avec les élèves.",
  },
  {
    targetId: "step-credits",
    title: "3. Solde de Leads Restants",
    description: "Suivez ici vos leads restants directement depuis votre base de données pour répondre aux cours.",
  },
  {
    targetId: "step-calendar",
    title: "4. Vos Disponibilités",
    description: "Indiquez vos jours et créneaux horaires libres pour permettre aux parents de planifier les séances.",
  },
  {
    targetId: "step-profile",
    title: "5. Modification de Profil",
    description: "Ajustez vos tarifs horaires, votre biographie, votre photo de profil et vos matières à tout moment.",
  }
];

export default function ProfDashboard() {
  const router = useRouter();
  const [profData, setProfData] = useState<Professor | null>(null);
  const [profName, setProfName] = useState('');
  const [profImage, setProfImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingDemandesCount, setPendingDemandesCount] = useState(0);

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
    let leadsSubscription: ReturnType<typeof supabase.channel> | null = null;

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
              .eq('professor_email', profEmailTarget);

            if (leadsData) {
              setPendingDemandesCount(leadsData.length);
              const unreadLeads = leadsData.filter((lead: Lead) => lead.is_read === false).length;
              setUnreadCount(unreadLeads);
            }

            leadsSubscription = supabase
              .channel(`realtime-leads-table-${profEmailTarget}`)
              .on(
                'postgres_changes', 
                { event: '*', schema: 'public', table: 'leads', filter: `professor_email=eq.${profEmailTarget}` }, 
                async () => {
                  const { data: updatedLeads } = await supabase
                    .from('leads')
                    .select('*')
                    .eq('professor_email', profEmailTarget);

                  if (updatedLeads) {
                    setPendingDemandesCount(updatedLeads.length);
                    const unreadLeads = updatedLeads.filter((lead: Lead) => lead.is_read === false).length;
                    setUnreadCount(unreadLeads);
                  }
                }
              )
              .subscribe();
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

    return () => {
      if (leadsSubscription) {
        supabase.removeChannel(leadsSubscription);
      }
    };
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
        Chargement...
      </div>
    );
  }

  const activeTarget = STEPS[currentStep].targetId;
  const leadBalance = profData?.leads_restants ?? 0;

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* --- TOPBAR --- */}
      <header className={`sticky top-0 z-40 border-b px-6 py-3.5 flex items-center justify-between transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0A0A0A]/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
      }`}>
        <div className="flex items-center gap-8">
          <Link href="/prof/dashboard" className="flex items-center gap-2.5 group">
            <span className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Prof<span className="text-orange-500">Maroc</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/prof/dashboard" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${isDarkMode ? 'text-white bg-slate-800/60' : 'text-slate-900 bg-slate-100'}`}>
              Dashboard
            </Link>

            <Link 
              href="/prof/dashboard/demandes" 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 relative ${
                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Demandes</span>
              {pendingDemandesCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingDemandesCount}
                </span>
              )}
            </Link>
            
            <Link 
              href="/prof/dashboard/messagerie" 
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 relative group ${
                isDarkMode 
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800/60' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="relative flex items-center">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2.5 -right-3.5 bg-rose-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="ml-1">Messagerie</span>
            </Link>

            <Link href="/prof/dashboard/disponibilites" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
              Disponibilités
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div id="step-status" className={`${showTutorial && activeTarget === 'step-status' ? 'relative z-40' : ''}`}>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative ${
                isDarkMode ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              title={isAvailable ? "En ligne" : "Masqué"}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 shadow-md ${
                isAvailable ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-rose-500 shadow-rose-500/50'
              }`} />
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-500 bg-slate-200 shrink-0 relative">
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
      </header>

      {/* --- ANIMATION HIBOU --- */}
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
                <p className="text-sm font-black text-orange-600 tracking-wide">Bonjour, je suis votre assistant d&apos;aide ! 🦉</p>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">Clique ici pour accéder à mes services et découvrir l&apos;espace.</p>
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

      {/* ZONE CENTRALE */}
      <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto space-y-8 relative w-full">
        
        <div id="step-welcome" className="pt-2 text-center">
          <h2 className="text-lg font-medium text-slate-400 tracking-wide">Que souhaitez-vous faire ?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* DEMANDES D'ÉLÈVES */}
          <div id="step-leads" className={`md:col-span-2 ${showTutorial && activeTarget === 'step-leads' ? 'relative z-40' : ''}`}>
            <Link 
              href="/prof/dashboard/demandes"
              className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block relative overflow-hidden ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform relative">
                  <Users className="w-7 h-7" />
                  {pendingDemandesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                      {pendingDemandesCount}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Demandes d&apos;élèves</h3>
                    {pendingDemandesCount > 0 && (
                      <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {pendingDemandesCount} nouvelle{pendingDemandesCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1 max-w-lg">
                    Consultez et répondez instantanément aux élèves qui ont demandé un cours avec vous. Échangez directement via votre messagerie.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-center text-xs font-extrabold text-orange-500 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Voir les demandes</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* LEADS RESTANTS */}
          <div id="step-credits" className={`md:col-span-1 ${showTutorial && activeTarget === 'step-credits' ? 'relative z-40' : ''}`}>
            <Link 
              href="/prof/dashboard/credits"
              className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mes Leads Restants</h3>
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Solde actuel :</span>
                    <p className={`text-2xl font-black mt-0.5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                      {leadBalance} Leads
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-amber-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <PlusCircle className="w-4 h-4" />
                <span>Recharger mes leads</span>
              </div>
            </Link>
          </div>

          {/* DISPONIBILITÉS */}
          <div id="step-calendar" className={`md:col-span-1 ${showTutorial && activeTarget === 'step-calendar' ? 'relative z-40' : ''}`}>
            <Link 
              href="/prof/dashboard/disponibilites"
              className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mes Disponibilités</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                    Ajustez vos jours et horaires de cours selon votre emploi du temps.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-blue-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Gérer mon planning</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* PROFIL */}
          <div id="step-profile" className={`md:col-span-2 ${showTutorial && activeTarget === 'step-profile' ? 'relative z-40' : ''}`}>
            <Link 
              href="/prof/profile"
              className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Modifier mon Profil</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
                    Mettez à jour vos tarifs, votre bio et vos matières enseignées à tout moment.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-emerald-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Éditer ma fiche</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

        </div>

      </main>

      {/* --- MODALE DU GUIDE INTERACTIF --- */}
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

      {/* BOUTON FLOTTANT POUR RELANCER LE GUIDE */}
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
  );
}