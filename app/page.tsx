'use client';

import { useState } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  HelpCircle, 
  BookOpen, 
  ChevronRight, 
  Dumbbell, 
  GraduationCap,
  Atom
} from 'lucide-react';

// Catégories populaires avec leurs sous-titres/icônes
const popularSubjects = [
  { name: 'Maths', icon: <span className="font-serif italic font-bold text-lg">√x</span> },
  { name: 'Anglais', badge: 'EN' },
  { name: 'Français', badge: 'FR' },
  { name: 'Arabe', badge: 'AR' },
  { name: 'Soutien scolaire', icon: <GraduationCap className="w-5 h-5" /> },
  { name: 'SVT', icon: <span className="text-lg">🧫</span> },
  { name: 'Physique', icon: <Atom className="w-5 h-5" /> },
  { name: 'Physique - Chimie', icon: <Atom className="w-5 h-5" /> },
  { name: 'Soutien scolaire', icon: <GraduationCap className="w-5 h-5" /> },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recherche :', searchTerm);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF0F0] via-[#FFE4E4] to-[#FFD8D8] text-gray-900 font-sans flex flex-col justify-between">
      
      {/* Navigation Bar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo ProfMaroc */}
        <div className="flex items-center cursor-pointer">
          <span className="text-2xl md:text-3xl font-extrabold text-[#FF5A5F] tracking-tight">
            profmaroc
          </span>
        </div>

        {/* Desktop Navigation Links */}
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

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-black/5 rounded-lg transition"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md px-6 py-4 space-y-4 border-b border-gray-100 shadow-lg">
          <a href="#" className="block text-gray-800 font-semibold py-1">Aide</a>
          <a href="#" className="block text-gray-800 font-semibold py-1">Donner des cours</a>
          <button 
            onClick={() => { setShowLogin(true); setIsMenuOpen(false); }} 
            className="block w-full text-left text-gray-800 font-semibold py-1"
          >
            Connexion
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center max-w-5xl mx-auto w-full">
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-10 max-w-3xl">
          Trouvez le<br />professeur parfait
        </h1>

        {/* Search Bar Container */}
        <form onSubmit={handleSearch} className="w-full max-w-3xl mb-8">
          <div className="bg-white rounded-full p-2 pl-6 shadow-xl flex items-center gap-3 border border-red-100/50">
            <BookOpen className="w-6 h-6 text-[#FF5A5F] shrink-0" />
            <input
              type="text"
              placeholder='"Montage Vidéo"'
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
          </div>
        </form>

        {/* Categories Bar */}
        <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-full py-3 px-4 shadow-lg border border-white/60 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-around w-full gap-2 min-w-max px-2">
            {popularSubjects.map((subject) => (
              <button
                key={subject.name}
                onClick={() => setSearchTerm(subject.name)}
                className="flex flex-col items-center justify-center gap-1 px-3 py-1 text-gray-800 hover:text-[#FF5A5F] transition-colors group"
              >
                <div className="h-7 flex items-center justify-center text-gray-800 group-hover:text-[#FF5A5F] transition-colors">
                  {subject.badge ? (
                    <span className="border-2 border-current rounded-md text-[10px] font-extrabold px-1 py-[1px] leading-none">
                      {subject.badge}
                    </span>
                  ) : (
                    subject.icon
                  )}
                </div>
                <span className="text-xs font-semibold whitespace-nowrap">{subject.name}</span>
              </button>
            ))}
          </div>

         
        </div>

      </section>

      {/* Footer minimaliste */}
      <footer className="py-6 text-center text-xs text-gray-500">
        © 2026 ProfMaroc. Tous droits réservés.
      </footer>

      {/* Modal Connexion */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowLogin(false)} 
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">Connexion</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] transition" 
                  placeholder="exemple@email.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] transition" 
                  placeholder="••••••••" 
                />
              </div>
              <button className="w-full bg-[#FF5A5F] hover:bg-[#E0484C] text-white py-3.5 rounded-xl font-bold transition shadow-md">
                Se connecter
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}