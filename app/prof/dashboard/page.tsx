'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Edit3, Calendar, Users, ArrowRight, 
  X, GraduationCap
} from 'lucide-react';

const STEPS = [
  {
    targetId: "step-welcome",
    title: "Bienvenue dans votre Espace !",
    description: "Bonjour ! Je suis Profy 🦉. Je vais vous montrer comment piloter votre compte et trouver rapidement des élèves.",
    placement: "bottom"
  },
  {
    targetId: "step-status",
    title: "1. Votre Statut de Visibilité",
    description: "Activez votre profil 'En Ligne' pour apparaître immédiatement dans les résultats de recherche des élèves et parents.",
    placement: "bottom"
  },
  {
    targetId: "step-leads",
    title: "2. Demandes d'Élèves",
    description: "C'est ici que vous recevez toutes les demandes. Vous pouvez échanger directement avec les élèves et accepter leurs cours.",
    placement: "bottom"
  },
  {
    targetId: "step-calendar",
    title: "3. Vos Disponibilités",
    description: "Indiquez vos jours et créneaux horaires libres pour permettre aux parents de planifier les séances à l'avance.",
    placement: "bottom"
  },
  {
    targetId: "step-profile",
    title: "4. Modification de Profil",
    description: "Ajustez vos tarifs horaires, votre biographie, votre photo de profil et vos matières à tout moment.",
    placement: "bottom"
  }
];

export default function ProfDashboard() {
  const [profData, setProfData] = useState<any>(null);
  const [profName, setProfName] = useState('');
  const [profImage, setProfImage] = useState('');
  const [profNiveau, setProfNiveau] = useState<any>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  // ÉTATS DU GUIDE INTERACTIF
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [owlPosition, setOwlPosition] = useState({ top: 200, left: 300 });

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
            setProfNiveau(prof.niveau || []);
            setIsAvailable(prof.available ?? true);
          }
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

  // CALCUL DE LA POSITION DU HIBOU
  useEffect(() => {
    if (!showTutorial) return;

    const updatePosition = () => {
      const targetElement = document.getElementById(STEPS[currentStep].targetId);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        
        setOwlPosition({
          top: rect.bottom + window.scrollY + 20,
          left: Math.max(20, rect.left + rect.width / 2 - 160)
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
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
      
      {/* 1. FOND SOMBRE DE SURBRILLANCE */}
      {showTutorial && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-[2px] z-30 transition-opacity duration-500 pointer-events-auto" />
      )}

      {/* Zone centrale principale (Page Blanche) */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-5xl mx-auto space-y-8 relative">
        
        {/* EN-TÊTE BIENVENUE & STATUT */}
        <div 
          id="step-welcome"
          className={`px-2 py-2 transition-all duration-500 rounded-3xl ${
            showTutorial && activeTarget === 'step-welcome'
              ? 'relative z-40 bg-white/90 p-6 ring-4 ring-orange-500 shadow-2xl'
              : ''
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
                showTutorial && activeTarget === 'step-status'
                  ? 'relative z-40 bg-white border-orange-500 ring-4 ring-orange-500 shadow-2xl scale-110'
                  : 'bg-white border-slate-200/80 shadow-xs'
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

        {/* TITRE DE SECTION CENTRÉ AVEC ÉCRITURE PLUS DOUCE ET GRISÉE */}
        <div className="text-center py-2">
          <h2 className="text-base font-medium text-slate-400 tracking-wide">Que souhaitez-vous faire ?</h2>
        </div>

        {/* CARTES DE RACCOURCIS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Demandes */}
          <div
            id="step-leads"
            className={`transition-all duration-500 rounded-3xl ${
              showTutorial && activeTarget === 'step-leads'
                ? 'relative z-40 ring-4 ring-orange-500 shadow-2xl scale-[1.04] bg-white'
                : ''
            }`}
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
            className={`transition-all duration-500 rounded-3xl ${
              showTutorial && activeTarget === 'step-calendar'
                ? 'relative z-40 ring-4 ring-blue-500 shadow-2xl scale-[1.04] bg-white'
                : ''
            }`}
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
            className={`transition-all duration-500 rounded-3xl ${
              showTutorial && activeTarget === 'step-profile'
                ? 'relative z-40 ring-4 ring-emerald-500 shadow-2xl scale-[1.04] bg-white'
                : ''
            }`}
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

        {/* APERÇU SIMPLE DU PROFIL */}
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

      {/* --- HIBOU VOLANT SANS LE BADGE PROFY --- */}
      {showTutorial && (
        <div 
          className="absolute z-50 transition-all duration-700 ease-in-out pointer-events-auto flex items-start gap-4 max-w-md"
          style={{ 
            top: `${owlPosition.top}px`, 
            left: `${owlPosition.left}px` 
          }}
        >
          {/* HIBOU VOLANT AVEC LE CHAPEAU BIEN CENTRÉ SUR LA TÊTE */}
          <div className="relative animate-bounce duration-1000 shrink-0 select-none">
            <span className="text-6xl drop-shadow-2xl leading-none block filter">
              🦉
            </span>
            <div className="absolute -top-3.5 left-[42%] -translate-x-1/2 -rotate-6 text-orange-400 drop-shadow-md pointer-events-none">
              <GraduationCap className="w-7 h-7 fill-slate-900 stroke-orange-500 stroke-[2.5]" />
            </div>
          </div>

          {/* TEXTE LIBRE SANS BADGE */}
          <div className="space-y-2 text-white drop-shadow-md pt-1">
            <div className="flex items-center justify-end">
              <button 
                onClick={() => setShowTutorial(false)}
                className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-base font-black text-white -mt-2">{STEPS[currentStep].title}</h4>
            <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-xs">
              {STEPS[currentStep].description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition cursor-pointer"
              >
                ← Précédent
              </button>

              <button
                onClick={handleNextStep}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-lg shadow-orange-500/30 cursor-pointer flex items-center gap-1"
              >
                <span>{currentStep === STEPS.length - 1 ? "J'ai tout compris !" : "Suivant"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BOUTON FLOTTANT EN BAS À DROITE */}
      {!showTutorial && (
        <button
          onClick={restartTutorial}
          className="fixed bottom-6 right-6 bg-slate-900 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 flex items-center gap-2.5 border-2 border-orange-500 cursor-pointer group"
          title="Relancer le guide interactif"
        >
          <span className="text-2xl group-hover:rotate-12 transition-transform">🦉</span>
          <span className="text-xs font-extrabold pr-1 hidden sm:inline text-orange-400">Besoin d'aide ?</span>
        </button>
      )}

    </div>
  );
}