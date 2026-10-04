'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { 
  Edit3, Calendar, Users, ArrowRight, 
  X, ArrowDown, Sun, Moon, LogOut, ChevronDown, User 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import birdAnimation from '@/app/bird.json';

const LottieAnimation = dynamic(() => import('@/app/components/LottieAnimation'), { ssr: false });

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
    description: "C'est ici que vous recevez toutes les demandes. Vous pouvez échanger directement avec les élèves et accepter leurs cours.",
  },
  {
    targetId: "step-calendar",
    title: "3. Vos Disponibilités",
    description: "Indiquez vos jours et créneaux horaires libres pour permettre aux parents de planifier les séances à l'avance.",
  },
  {
    targetId: "step-profile",
    title: "4. Modification de Profil",
    description: "Ajustez vos tarifs horaires, votre biographie, votre photo de profil et vos matières à tout moment.",
  }
];

export default function ProfDashboard() {
  const [profData, setProfData] = useState<any>(null);
  const [profName, setProfName] = useState('');
  const [profImage, setProfImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading]  = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('prof_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('prof_theme', nextMode ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = '/connexion';
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
          window.location.href = '/connexion';
          return;
        }

        const { data: allProfs } = await supabase.from('professors').select('*');

        if (allProfs) {
          let prof = null;
          if (storedId) {
            prof = allProfs.find((p: any) => String(p.id) === String(storedId));
          }
          if (!prof && rawEmail) {
            const cleanTarget = rawEmail.toLowerCase().trim();
            prof = allProfs.find((p: any) => p.email && p.email.toLowerCase().trim() === cleanTarget);
          }

          if (prof) {
            setProfData(prof);
            const prenom = prof['Prénom'] || prof.prenom || '';
            const nom = prof['Nom'] || prof.nom || '';
            const fullName = `${prenom} ${nom}`.trim();

            setProfName(fullName || prof.email || 'Professeur');
            setProfImage(prof.photo_URL || prof.photo_url || prof.image_url || prof.photo || '');
            setIsAvailable(prof.available ?? true);
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
  }, []);

  useEffect(() => {
    if (!showTutorial) return;
    const targetElement = document.getElementById(STEPS[currentStep].targetId);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
    }
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

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* --- TOPBAR STYLE SUPABASE --- */}
      <header className={`sticky top-0 z-40 border-b px-6 py-3.5 flex items-center justify-between transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0A0A0A]/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
      }`}>
        {/* Nom de la plateforme sans le carré P */}
        <div className="flex items-center gap-8">
          <Link href="/prof/dashboard" className="flex items-center gap-2.5 group">
            <span className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Prof<span className="text-orange-500">Maroc</span>
            </span>
          </Link>

          {/* Menu de navigation central */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/prof/dashboard" className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${isDarkMode ? 'text-white bg-slate-800/60' : 'text-slate-900 bg-slate-100'}`}>
              Dashboard
            </Link>
            <Link href="/prof/dashboard/demandes" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
              Demandes
            </Link>
            <Link href="/prof/dashboard/disponibilites" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
              Disponibilités
            </Link>
          </nav>
        </div>

        {/* Actions Droite : Statut lumineux + Thème + Profil */}
        <div className="flex items-center gap-3">
          
          {/* Bouton Statut Lumineux (Sans texte "Statut") */}
          <div id="step-status" className={`${showTutorial && activeTarget === 'step-status' ? 'relative z-40' : ''}`}>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
              title={isAvailable ? "En ligne (cliquez pour masquer)" : "Masqué (cliquez pour mettre en ligne)"}
            >
              <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 shadow-md ${
                isAvailable ? 'bg-emerald-500 shadow-emerald-500/50 animate-pulse' : 'bg-rose-500 shadow-rose-500/50'
              }`} />
            </button>
          </div>

          {/* Bouton Dark / Light */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode 
                ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profil Utilisateur (Avatar + Dropdown) */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition cursor-pointer ${
                isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-orange-500 bg-slate-200 shrink-0">
                {profImage ? (
                  <img src={profImage} alt={profName} className="w-full h-full object-cover" />
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

            {/* Menu Déroulant Profil */}
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

      {/* --- ANIMATION DU HIBOU --- */}
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
                <p className="text-sm font-black text-orange-600 tracking-wide">Bonjour, je suis votre assistant d'aide ! 🦉</p>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">Clique ici pour accéder à mes services et découvrir l'espace.</p>
                <div className="absolute -bottom-7 left-8 bg-slate-900 text-white p-2 rounded-full shadow-xl animate-bounce border-2 border-orange-500">
                  <ArrowDown className="w-5 h-5 stroke-[3]" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SPOTLIGHT DU TUTORIEL --- */}
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
        
        <div id="step-welcome" className="pt-4 text-center">
          <h2 className="text-lg font-medium text-slate-400 tracking-wide">Que souhaitez-vous faire ?</h2>
        </div>

        {/* CARTES DE RACCOURCIS (Grille Bento) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Carte Demandes */}
          <div id="step-leads" className={`${showTutorial && activeTarget === 'step-leads' ? 'relative z-40' : ''}`}>
            <Link 
              href="/prof/dashboard/demandes"
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-lg'
              }`}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Demandes d'élèves</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Consultez et répondez aux élèves qui ont demandé un cours avec vous.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-orange-500 gap-1 group-hover:translate-x-1 transition-transform">
                <span>Voir les demandes</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Carte Disponibilités */}
          <div id="step-calendar" className={`${showTutorial && activeTarget === 'step-calendar' ? 'relative z-40' : ''}`}>
            <Link 
              href="/prof/dashboard/disponibilites"
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-lg'
              }`}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Mes Disponibilités</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Ajustez vos jours et horaires de cours selon votre emploi du temps.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
                <span>Gérer mon planning</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Carte Profil */}
          <div id="step-profile" className={`${showTutorial && activeTarget === 'step-profile' ? 'relative z-40' : ''}`}>
            <Link 
              href="/prof/profile"
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between group h-full block ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900' 
                  : 'bg-white border-slate-200/80 shadow-xs hover:shadow-lg'
              }`}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Edit3 className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Modifier mon Profil</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Mettez à jour vos tarifs, votre bio, votre photo et vos matières.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-emerald-600 gap-1 group-hover:translate-x-1 transition-transform">
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
          <span className="text-xs font-extrabold pr-1 hidden sm:inline text-orange-500">Besoin d'aide ?</span>
        </motion.button>
      )}

    </div>
  );
}