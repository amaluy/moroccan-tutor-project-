'use client';

import { Search, Menu, X, ChevronDown, HelpCircle } from 'lucide-react';

interface NavbarProps {
  isLoggedIn: boolean;
  currentPage?: 'landing' | 'about' | 'subjects';
  setCurrentPage?: (page: 'landing' | 'about' | 'subjects') => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onOpenHelp?: () => void;
}

export default function Navbar({
  isLoggedIn,
  currentPage,
  setCurrentPage,
  isMenuOpen,
  setIsMenuOpen,
  onLoginClick,
  onLogoutClick,
  onOpenHelp
}: NavbarProps) {
  
  // NAVBAR MODE NON CONNECTÉ (LANDING / ABOUT / SUBJECTS)
  if (!isLoggedIn) {
    return (
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <span 
            onClick={() => setCurrentPage?.('landing')} 
            className="text-2xl font-extrabold text-[#FF5A5F] tracking-tight cursor-pointer"
          >
            profmaroc
          </span>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <button 
              onClick={() => setCurrentPage?.('about')} 
              className={`transition ${currentPage === 'about' ? 'text-[#FF5A5F] font-bold' : 'hover:text-black'}`}
            >
              Qui sommes nous
            </button>
            
            <button 
              onClick={() => setCurrentPage?.('subjects')} 
              className={`transition flex items-center gap-1 ${currentPage === 'subjects' ? 'text-[#FF5A5F] font-bold' : 'hover:text-black'}`}
            >
              <span>Matières</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-black transition">
              <span>Villes</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition" />
            </div>

            <button onClick={() => setCurrentPage?.('landing')} className="hover:text-black transition">
              Tarifs
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3" />
            <input 
              type="text" 
              placeholder="Rechercher une matière..." 
              className="bg-gray-200/60 focus:bg-white border border-transparent focus:border-gray-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-500 focus:outline-none transition w-48 focus:w-60"
            />
            <span className="absolute right-2 text-[10px] bg-gray-300/60 text-gray-600 px-1.5 py-0.5 rounded font-mono">/</span>
          </div>

          <button 
            onClick={onLoginClick} 
            className="text-sm font-bold text-gray-800 hover:text-[#FF5A5F] px-3 py-2 transition"
          >
            Se connecter
          </button>

          <button 
            onClick={onLoginClick} 
            className="text-sm font-bold text-white bg-[#FF5A5F] hover:bg-[#E0484C] px-4 py-2 rounded-lg transition shadow-sm"
          >
            S'inscrire
          </button>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
    );
  }

  // NAVBAR MODE CONNECTÉ
  return (
    <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
      <div className="flex items-center cursor-pointer" onClick={onLogoutClick}>
        <span className="text-2xl md:text-3xl font-extrabold text-[#FF5A5F] tracking-tight">
          profmaroc
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <button 
          onClick={onOpenHelp}
          className="text-gray-700 hover:text-[#FF5A5F] transition p-1 rounded-full cursor-pointer flex items-center gap-1"
          title="Besoin d'aide ?"
        >
          <HelpCircle className="w-6 h-6 stroke-[1.8]" />
        </button>

        <span className="text-gray-900 font-bold hover:text-[#FF5A5F] transition text-sm cursor-pointer">
          Donner des cours
        </span>
        <button 
          onClick={onLogoutClick}
          className="text-gray-900 font-bold hover:text-[#FF5A5F] transition text-sm"
        >
          Déconnexion
        </button>
      </div>

      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 hover:bg-black/5 rounded-lg transition"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </nav>
  );
}