'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  HelpCircle, 
  BookOpen, 
  Star, 
  Heart, 
  MapPin,
  User
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

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'header' | null>(null);
  
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  const headerDropdownRef = useRef<HTMLFormElement>(null);

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
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between">
      
      {/* ===== HEADER STICKY (La liste déroulante reste active ici) ===== */}
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
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-full transition">
              Donner des cours
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION (Pas de liste déroulante) ===== */}
      <div className="min-h-screen flex flex-col">
        <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center cursor-pointer">
            <span className="text-2xl md:text-3xl font-extrabold text-[#FF5A5F] tracking-tight">
              profmaroc
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button className="text-gray-700 hover:text-black transition p-1 rounded-full">
              <HelpCircle className="w-6 h-6 stroke-[1.8]" />
            </button>
            <a href="#" className="text-gray-900 font-bold hover:text-[#FF5A5F] transition text-sm">
              Donner des cours
            </a>
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

        <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center max-w-5xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-10 max-w-3xl">
            Trouvez le<br />professeur parfait
          </h1>

          <div className="w-full max-w-3xl relative">
            {/* BARRE DE RECHERCHE ACCUEIL */}
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

            {/* BARRE DES MODULES */}
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
        </section>
      </div>

      {/* ===== SECTION DES PROFESSEURS ===== */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
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

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-200">
        © 2026 ProfMaroc. Tous droits réservés.
      </footer>
    </main>
  );
}