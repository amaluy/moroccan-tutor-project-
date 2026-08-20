'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import StickyHeader from './components/StickyHeader';
import SearchSection from './components/SearchSection';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { ProfessorCard } from './components/ProfessorCard';
import { Professor } from '@/types/professor';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Repeat, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  Target, 
  Award 
} from 'lucide-react';

const SUPABASE_URL = 'https://ydrswexzawreqrnuqwkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tiN8U5jsxtqe-F10_98DTw_jdcEf-IX';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'landing' | 'about'>('landing');
  const [email, setEmail] = useState('berradaOamal@gmail.com');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('acceptee');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() !== '') {
      setIsLoggedIn(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    touchEndX.current = clientX;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (swipeDistance > 50) {
      setCurrentSlide(1);
    } else if (swipeDistance < -50) {
      setCurrentSlide(0);
    }
  };

  useEffect(() => {
    async function fetchProfessors() {
      setLoading(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/professors?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfessors(data);
        } else {
          console.error('Erreur Supabase :', response.statusText);
        }
      } catch (error) {
        console.error('Erreur chargement professeurs :', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfessors();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // VUE VISITEUR NON CONNECTÉ
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white">
        <Navbar 
          isLoggedIn={false}
          currentPage={currentPage}
          setCurrentPage={(page) => {
            if (page === 'about' || page === 'landing') {
              setCurrentPage(page);
            }
          }}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onLoginClick={() => setIsLoggedIn(true)}
        />

        {/* SECTION QUI SOMMES-NOUS */}
        {currentPage === 'about' && (
          <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-16 text-center max-w-5xl mx-auto my-auto animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#FF5A5F] flex items-center justify-center text-white text-3xl font-black shadow-lg mb-6 ring-4 ring-red-100">
              P
            </div>

            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-6 text-xs font-bold text-[#FF5A5F]">
              <span>À propos de ProfMaroc</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-6 max-w-3xl">
              La 1ère plateforme de soutien scolaire sur-mesure au Maroc
            </h1>

            <p className="text-base sm:text-lg text-gray-600 font-medium max-w-2xl mb-12 leading-relaxed">
              ProfMaroc a été créé avec une ambition simple : révolutionner le soutien scolaire au Maroc en offrant aux élèves et aux étudiants un accès direct aux meilleurs enseignants certifiés, quel que soit leur niveau.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-12">
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Notre Mission</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Faciliter l'excellence académique en rendant la recherche de professeurs qualifiés fluide, rapide et transparente pour toutes les familles marocaines.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Rigueur & Qualité</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Nous sélectionnons rigoureusement chaque profil d'enseignant. Diplômes, pédagogie et expérience sont systématiquement vérifiés par nos équipes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Une Communauté</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Plus qu'un annuaire, une communauté active d'entraide, de cours en groupe et de suivi personnalisé pour accompagner le parcours de chaque élève.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setCurrentPage('landing')}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
          </section>
        )}

        {/* SECTION LANDING D'ACCUEIL */}
        {currentPage === 'landing' && (
          <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center max-w-5xl mx-auto my-auto animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-8 text-xs font-bold text-[#FF5A5F] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
              <span>La 1ère communauté de soutien scolaire au Maroc</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-6 max-w-4xl">
              L’excellence scolaire se construit ensemble
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-2xl mb-10 leading-relaxed">
              Les élèves, les professeurs qualifiés et les meilleurs cours de soutien réunis sur une seule et même plateforme.
            </p>

            <form onSubmit={handleSignUp} className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-xl border border-gray-200/80 mb-8">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse e-mail" 
                className="w-full px-4 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent text-sm sm:text-base focus:outline-none font-medium"
              />
              <button 
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl transition text-sm sm:text-base shrink-0 shadow-md flex items-center justify-center gap-2"
              >
                <span>S'inscrire sur ProfMaroc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-500 font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF5A5F]" />
                <span>Profs vérifiés & certifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#FF5A5F]" />
                <span>Tous niveaux scolaires</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF5A5F]" />
                <span>Groupes & Cours particuliers</span>
              </div>
            </div>
          </section>
        )}

        <Footer 
          onNavigateHome={() => setCurrentPage('landing')} 
          onOpenHelp={() => setIsHelpOpen(true)} 
        />
      </main>
    );
  }

  // VUE UTILISATEUR CONNECTÉ
  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between overflow-x-hidden relative">
      <StickyHeader 
        isScrolled={isScrolled}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        locationTerm={locationTerm}
        setLocationTerm={setLocationTerm}
        onSearch={handleSearch}
        onLogoutClick={() => setIsLoggedIn(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <div className="min-h-screen flex flex-col relative select-none">
        <Navbar 
          isLoggedIn={true}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onLogoutClick={() => setIsLoggedIn(false)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        <div 
          className="flex-1 relative w-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex w-[200%] h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 50}%)` }}
          >
            {/* SLIDE 1 - RECHERCHE */}
            <div className="w-1/2 flex flex-col items-center justify-center px-4 py-8 text-center max-w-5xl mx-auto">
              <SearchSection
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
                onViewAllSubjects={() => {}}
              />
            </div>

            {/* SLIDE 2 - COMMENT ÇA MARCHE */}
            <HowItWorks />
          </div>

          {currentSlide === 0 ? (
            <button 
              onClick={() => setCurrentSlide(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2.5 rounded-full shadow-md transition border border-gray-100 hidden sm:flex items-center justify-center z-30"
              title="Comment ça marche ?"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => setCurrentSlide(0)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2.5 rounded-full shadow-md transition border border-gray-100 hidden sm:flex items-center justify-center z-30"
              title="Retour à la recherche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* INDICATEURS DE SLIDE */}
        <div className="py-6 flex items-center justify-center gap-2 z-20">
          <button 
            onClick={() => setCurrentSlide(0)}
            aria-label="Slide 1 - Recherche"
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === 0 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
          <button 
            onClick={() => setCurrentSlide(1)}
            aria-label="Slide 2 - Comment ça marche"
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === 1 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        </div>
      </div>

      {currentSlide === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-12">
          {/* BANNIÈRE D'INFORMATION */}
          <div className="bg-gradient-to-r from-[#2A2B88] via-[#3B38B0] to-[#2E2882] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 tracking-tight leading-snug">
              Des professeurs certifiés que vous pouvez vraiment choisir
            </h2>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  <strong className="text-white font-extrabold">Seulement 8%</strong> des profs passent notre sélection rigoureuse
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  Ils maîtrisent le système scolaire marocain et enseignent <strong className="text-white font-extrabold">plus de 30 matières</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <Repeat className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  Vous pouvez changer si ça ne vous convient pas — <strong className="text-white font-extrabold">gratuitement</strong>
                </p>
              </div>
            </div>
          </div>

          {/* LISTE DES PROFESSEURS */}
          <section className="w-full">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span>Nos professeurs particuliers évalués</span>
              <span className="text-[#FF5A5F] text-xl">★★★★★</span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {professors.map((prof) => (
                  <ProfessorCard key={prof.id} prof={prof} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <Footer 
        onNavigateHome={() => setCurrentPage('landing')} 
        onOpenHelp={() => setIsHelpOpen(true)} 
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        helpSection={helpSection} 
        setHelpSection={setHelpSection} 
      />
    </main>
  );
}