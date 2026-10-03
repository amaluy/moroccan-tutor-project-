'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { 
  Edit3, Calendar, Users, ArrowRight, 
  X, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import birdAnimation from '@/app/bird.json';

// Import dynamique correct pointant vers app/components/LottieAnimation
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
    description: "Activez votre profil 'En Ligne' pour apparaître immédiatement dans les résultats de recherche des élèves et parents.",
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
  const [loading, setLoading] = useState(true);

  // Animation du hibou style Duolingo (marche dessin animé)
  const [showCartoonWalkOwl, setShowCartoonWalkOwl] = useState(false);

  // ÉTATS DU GUIDE INTERACTIF
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

        // Lancement de l'animation de marche style Duolingo au premier chargement
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

  // CALCUL DU RECTANGLE POUR LE FOCUS DU TUTORIEL CLASSIQUE
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">Chargement...</div>;
  }

  const activeTarget = STEPS[currentStep].targetId;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-x-hidden">
      
      {/* --- 1. ANIMATION DU HIBOU STYLE CARTOON / DUOLINGO (MARCHE & SPOTLIGHT) --- */}
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
              transition={{ 
                duration: 7, 
                times: [0, 0.4, 0.75, 1], 
                ease: ["easeInOut", "easeInOut", "easeInOut"] 
              }}
              className="absolute z-50 flex items-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -14, 0], 
                  rotate: [0, 3, -3, 0] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 0.55, 
                  ease: "easeInOut" 
                }}
                className="relative flex items-center justify-center w-36 h-36 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
              >
                <LottieAnimation 
                  animationData={birdAnimation} 
                  loop={true} 
                  autoplay={true} 
                  style={{ width: '100%', height: '100%' }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 15 }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.7, 1, 1, 0.7],
                  y: [15, 0, 0, 15] 
                }}
                transition={{ duration: 7, times: [0.38, 0.43, 0.72, 0.77] }}
                className="absolute left-32 -top-12 bg-white text-slate-900 px-6 py-4 rounded-3xl border-4 border-orange-500 shadow-2xl flex flex-col gap-2 min-w-[300px]"
              >
                <p className="text-sm font-black text-orange-600 tracking-wide">
                  Bonjour, je suis votre assistant d'aide ! 🦉
                </p>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  Clique ici pour accéder à mes services et découvrir l'espace.
                </p>

                <div className="absolute -bottom-7 left-8 bg-slate-900 text-white p-2 rounded-full shadow-xl animate-bounce border-2 border-orange-500">
                  <ArrowDown className="w-5 h-5 stroke-[3]" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 2. SPOTLIGHT DU TUTORIEL INTERACTIF CLASSIQUE --- */}
      <AnimatePresence>
        {showTutorial && targetRect && (
          <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
            />
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

      {/* ZONE CENTRALE (TABLEAU DE BORD) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto space-y-8 relative">
        
        {/* EN-TÊTE */}
        <div 
          id="step-welcome"
          className={`px-2 py-2 transition-all duration-500 rounded-3xl ${
            showTutorial && activeTarget === 'step-welcome' ? 'relative z-40 p-4' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 capitalize tracking-tight">
                Bonjour, {profName}
              </h1>
            </div>

            {/* Statut En ligne */}
            <div 
              id="step-status"
              className={`flex items-center gap-3 p-2 rounded-2xl border transition-all duration-500 ${
                showTutorial && activeTarget === 'step-status' ? 'relative z-40 border-transparent shadow-none' : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 pl-2">Statut :</span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                  isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isAvailable ? '🟢 En Ligne' : '🔴 Masqué'}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center py-2">
          <h2 className="text-base font-medium text-slate-400 tracking-wide">Que souhaitez-vous faire ?</h2>
        </div>

        {/* CARTES DE RACCOURCIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Demandes */}
          <div
            id="step-leads"
            className={`${showTutorial && activeTarget === 'step-leads' ? 'relative z-40' : ''}`}
          >
            <Link 
              href="/prof/dashboard/demandes"
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg flex flex-col justify-between group h-full block"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Demandes d'élèves</h3>
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
          <div
            id="step-calendar"
            className={`${showTutorial && activeTarget === 'step-calendar' ? 'relative z-40' : ''}`}
          >
            <Link 
              href="/prof/dashboard/disponibilites"
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg flex flex-col justify-between group h-full block"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Mes Disponibilités</h3>
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
          <div
            id="step-profile"
            className={`${showTutorial && activeTarget === 'step-profile' ? 'relative z-40' : ''}`}
          >
            <Link 
              href="/prof/profile"
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg flex flex-col justify-between group h-full block"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Edit3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Modifier mon Profil</h3>
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

        {/* APERÇU PROFIL */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-500 bg-slate-100 shrink-0">
              {profImage ? (
                <img src={profImage} alt={profName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                  {profName[0]}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{profName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{profData?.matiere || 'Professeur'} • {profData?.ville || 'Maroc'}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">Tarif réglé</span>
            <p className="text-xl font-black text-slate-900">{profData?.tarif || '200'} DH<span className="text-xs text-slate-400 font-normal">/h</span></p>
          </div>
        </div>

      </main>

      {/* --- 3. MODALE DU GUIDE INTERACTIF --- */}
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
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-black text-white">
                {STEPS[currentStep].title}
              </h3>
              
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {STEPS[currentStep].description}
              </p>

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

      {/* BOUTON FLOTTANT EN BAS À DROITE POUR RELANCER LE GUIDE */}
      {!showTutorial && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={restartTutorial}
          className="fixed bottom-6 right-6 bg-slate-900 text-white p-3.5 rounded-full shadow-2xl transition-all z-40 flex items-center gap-2.5 border-2 border-orange-500 cursor-pointer group"
          title="Relancer le guide interactif"
        >
          <div className="w-8 h-8 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <LottieAnimation 
              animationData={birdAnimation} 
              loop={true} 
              autoplay={true} 
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <span className="text-xs font-extrabold pr-1 hidden sm:inline text-orange-400">Besoin d'aide ?</span>
        </motion.button>
      )}

    </div>
  );
}