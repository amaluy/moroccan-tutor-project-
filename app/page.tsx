'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import StickyHeader from './components/StickyHeader';
import SearchSection from './components/SearchSection';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import ProfessorCard from './components/ProfessorCard';
import { Professor } from '@/types/professor';
import { BookOpen, ChevronLeft, ChevronRight, Check, Repeat } from 'lucide-react';

const SUPABASE_URL = 'https://ydrswexzawreqrnuqwkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tiN8U5jsxtqe-F10_98DTw_jdcEf-IX';

export default function Home() {
  const router = useRouter();
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

  // Action de déconnexion : renvoie vers la page de connexion/inscription
  const handleLogout = () => {
    router.replace('/connexion');
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
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between overflow-x-hidden relative">
      <StickyHeader 
        isScrolled={isScrolled}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        locationTerm={locationTerm}
        setLocationTerm={setLocationTerm}
        onSearch={handleSearch}
        onLogoutClick={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <div className="min-h-screen flex flex-col relative select-none">
        <Navbar 
          isLoggedIn={true}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onLogoutClick={handleLogout}
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
            <div className="w-1/2 flex flex-col items-center justify-center px-4 py-8 text-center max-w-5xl mx-auto">
              <SearchSection
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
                onViewAllSubjects={() => {}}
              />
            </div>
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

        <div className="py-6 flex items-center justify-center gap-2 z-20">
          <button 
            onClick={() => setCurrentSlide(0)}
            className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === 0 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
          />
          <button 
            onClick={() => setCurrentSlide(1)}
            className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === 1 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
          />
        </div>
      </div>

      {currentSlide === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-12">
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
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
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