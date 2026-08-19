'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Menu, 
  X, 
  HelpCircle, 
  BookOpen, 
  Star, 
  Heart, 
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Repeat
} from 'lucide-react';

const SUPABASE_URL = 'https://ydrswexzawreqrnuqwkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tiN8U5jsxtqe-F10_98DTw_jdcEf-IX';

interface Professor {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  subject: string;
  city: string;
  price: number;
  bio: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  is_approved: boolean;
  created_at: string;
  offers_free_trial?: boolean;
  is_online?: boolean;
}

const subjectsList = [
  'Maths',
  'Anglais',
  'Français',
  'Arabe',
  'Soutien scolaire',
  'SVT',
  'Physique',
  'Physique - Chimie'
];

const steps = [
  {
    number: 1,
    title: 'Trouvez un Prof',
    description: 'Explorez notre annuaire de professeurs qualifiés et choisissez celui qui correspond à vos besoins académiques.',
    borderColor: 'border-t-[#4338CA]',
    numberBg: 'bg-[#4338CA]'
  },
  {
    number: 2,
    title: 'Rejoignez un Groupe',
    description: "Intégrez un groupe d'étude collaboratif avec d'autres élèves partageant les mêmes objectifs académiques.",
    borderColor: 'border-t-[#EC4899]',
    numberBg: 'bg-[#F59E0B]'
  },
  {
    number: 3,
    title: 'Collaborez et Progressez',
    description: "Participez aux discussions, partagez des ressources et bénéficiez d'un accompagnement personnalisé pour réussir.",
    borderColor: 'border-t-[#4338CA]',
    numberBg: 'bg-[#4338CA]'
  }
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'header' | null>(null);
  
  // Hero Slider State (0 = Search Hero, 1 = Comment ça marche)
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  const headerDropdownRef = useRef<HTMLFormElement>(null);

  // Swipe handling
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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        headerDropdownRef.current && !headerDropdownRef.current.contains(target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveDropdown(null);
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* ===== HEADER STICKY ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300 transform ${
        isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          
          <span className="text-xl font-extrabold text-[#FF5A5F] tracking-tight shrink-0">
            profmaroc
          </span>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative" ref={headerDropdownRef}>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
              <div className="flex items-center gap-2 flex-1 border-r border-gray-300 pr-3">
                <BookOpen className="w-4 h-4 text-[#FF5A5F]" />
                <input
                  type="text"
                  placeholder="Matière"
                  value={searchTerm}
                  onFocus={() => setActiveDropdown('header')}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
              
              <div className="flex items-center gap-2 flex-1 pl-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Lieu du cours"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>

              <button 
                type="submit" 
                className="bg-[#FF5A5F] hover:bg-[#E0484C] text-white p-2 rounded-full transition ml-1 shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {activeDropdown === 'header' && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                {subjectsList
                  .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        setSearchTerm(subject);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition font-medium"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>{subject}</span>
                    </button>
                ))}
              </div>
            )}
          </form>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-gray-600 hover:text-black">
              <HelpCircle className="w-5 h-5" />
            </button>
            <Link 
              href="/donner-cours" 
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-full transition inline-block"
            >
              Donner des cours
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION WITH SWIPE CAROUSEL ===== */}
      <div className="min-h-screen flex flex-col relative select-none">
        
        {/* TOP NAVIGATION BAR */}
        <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
          <div className="flex items-center cursor-pointer">
            <span className="text-2xl md:text-3xl font-extrabold text-[#FF5A5F] tracking-tight">
              profmaroc
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button className="text-gray-700 hover:text-black transition p-1 rounded-full">
              <HelpCircle className="w-6 h-6 stroke-[1.8]" />
            </button>
            <Link 
              href="/donner-cours" 
              className="text-gray-900 font-bold hover:text-[#FF5A5F] transition text-sm"
            >
              Donner des cours
            </Link>
            <button 
              onClick={() => setShowLogin(true)}
              className="text-gray-900 font-bold hover:text-[#FF5A5F] transition text-sm"
            >
              Connexion
            </button>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-black/5 rounded-lg transition"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* SLIDER CONTAINER */}
        <div 
          className="flex-1 relative w-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex w-[200%] h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 50}%)` }}
          >
            
            {/* SLIDE 1: MAIN HERO SEARCH */}
            <div className="w-1/2 flex flex-col items-center justify-center px-4 py-8 text-center max-w-5xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-10 max-w-3xl">
                Trouvez le<br />professeur parfait
              </h1>

              <div className="w-full max-w-3xl relative">
                <form onSubmit={handleSearch} className="bg-white rounded-full p-2 pl-6 shadow-xl flex items-center gap-3 border border-red-100/50">
                  <BookOpen className="w-6 h-6 text-[#FF5A5F] shrink-0" />
                  <input
                    type="text"
                    placeholder="apprendre l'anglais"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-3 text-gray-800 placeholder-gray-400 focus:outline-none text-base sm:text-lg bg-transparent font-medium"
                  />
                  <button 
                    type="submit"
                    className="px-8 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-full transition-colors duration-200 text-base shrink-0 shadow-md"
                  >
                    Rechercher
                  </button>
                </form>

                <div className="mt-6 w-full bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-gray-100/80 p-3 px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                  {subjectsList.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => setSearchTerm(subject)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-red-50/50 transition group shrink-0 min-w-[70px]"
                    >
                      <div className="w-9 h-9 rounded-full bg-red-50 text-[#FF5A5F] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap">
                        {subject}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SLIDE 2: COMMENT ÇA MARCHE + POUR ÉTUDIANTS / PROFESSEURS */}
            <div className="w-1/2 flex flex-col items-center justify-center px-4 sm:px-8 py-6 text-center max-w-6xl mx-auto overflow-y-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">
                Comment ça marche ?
              </h2>

              {/* 3 ÉTAPES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                {steps.map((step) => (
                  <div 
                    key={step.number}
                    className={`bg-white rounded-3xl p-6 pt-8 shadow-sm border-t-4 ${step.borderColor} border-x border-b border-gray-100 flex flex-col items-center text-center relative`}
                  >
                    <div className={`w-12 h-12 ${step.numberBg} text-white font-bold text-lg rounded-full flex items-center justify-center shadow-md mb-4`}>
                      {step.number}
                    </div>

                    <h3 className="text-lg font-extrabold text-gray-900 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* CARTES ÉTUDIANTS & PROFESSEURS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                {/* Pour les Étudiants */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h3 className="text-2xl font-extrabold text-[#4338CA] mb-6">
                    Pour les Étudiants
                  </h3>

                  <ul className="space-y-4 text-sm text-gray-800 font-medium">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Accédez à des groupes d'étude pour tous les niveaux scolaires</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Parcourez les profils détaillés des professeurs pour faire le meilleur choix</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Participez aux discussions et partagez des ressources avec d'autres élèves</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Consultez les annonces importantes et les sessions à venir</span>
                    </li>
                  </ul>
                </div>

                {/* Pour les Professeurs */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">
                    Pour les Professeurs
                  </h3>

                  <ul className="space-y-4 text-sm text-gray-800 font-medium">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Créez votre profil détaillé avec votre biographie, spécialités et expérience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Formez des groupes d'étude adaptés aux besoins de vos élèves</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Partagez du contenu pédagogique et communiquez facilement avec vos élèves</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Suivez l'engagement et les progrès de vos groupes via un tableau de bord</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

          </div>

          {/* SIDE NAVIGATION ARROWS */}
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

        {/* CAROUSEL NAVIGATION DOTS */}
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

      {/* ===== CONTENU SLIDE 1 (BANNIÈRE CERTIFICATION + PROFESSEURS) ===== */}
      {currentSlide === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-12">
          
          {/* BANNIÈRE D'INFORMATION */}
          <div className="bg-gradient-to-r from-[#2A2B88] via-[#3B38B0] to-[#2E2882] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 tracking-tight leading-snug">
              Des professeurs certifiés que vous pouvez vraiment choisir
            </h2>

            <div className="space-y-5">
              {/* Point 1 */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  <strong className="text-white font-extrabold">Seulement 8%</strong> des profs passent notre sélection rigoureuse
                </p>
              </div>

              {/* Point 2 */}
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  Ils maîtrisent le système scolaire marocain et enseignent <strong className="text-white font-extrabold">plus de 30 matières</strong>
                </p>
              </div>

              {/* Point 3 */}
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

          {/* SECTION PROFESSEURS */}
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
                  <div 
                    key={prof.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group"
                  >
                    {/* Image / Avatar */}
                    <div className="relative h-72 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                      {prof.avatar_url ? (
                        <img 
                          src={prof.avatar_url} 
                          alt={prof.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                          <User className="w-24 h-24 stroke-[1]" />
                        </div>
                      )}

                      <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition z-10">
                        <Heart className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white drop-shadow-md">
                        <h3 className="text-2xl font-bold leading-tight">{prof.name}</h3>
                        <p className="text-xs font-medium text-gray-200">
                          {prof.city} {prof.is_online ? '(face à face & webcam)' : '(face à face)'}
                        </p>
                      </div>
                    </div>

                    {/* Info prof */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{prof.rating || 5}</span>
                            <span className="text-gray-400 font-normal">({prof.total_reviews || 0} avis)</span>
                          </div>

                          {prof.is_approved && (
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                              Confirmé
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 font-medium line-clamp-2">
                          <strong className="text-gray-900">{prof.subject}</strong> - {prof.bio}
                        </p>
                      </div>

                      {/* Prix et 1er cours offert */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-extrabold text-gray-900">{prof.price}MAD</span>
                          <span className="text-xs text-gray-500">/h</span>
                        </div>

                        {prof.offers_free_trial && (
                          <span className="text-xs font-semibold text-[#FF5A5F]">
                            1<sup>er</sup> cours offert
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-200">
        © 2026 ProfMaroc. Tous droits réservés.
      </footer>
    </main>
  );
}