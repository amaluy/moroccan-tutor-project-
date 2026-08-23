'use client';

import { useState, useEffect } from 'react';
import { Search, Menu, X, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

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
  
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdminPage(window.location.pathname.startsWith('/admin'));
    }
  }, []);

  // NAVBAR MODE NON CONNECTÉ
  if (!isLoggedIn) {
    return (
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-extrabold text-[#FF5A5F] tracking-tight cursor-pointer">
            profmaroc
          </Link>

          {/* MENU CENTRAL (4 LIENS) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-800 tracking-wider">
            <Link href="/" className="hover:text-[#FF5A5F] transition uppercase">
              ACCUEIL
            </Link>

            <Link href="/about" className="hover:text-[#FF5A5F] transition uppercase">
              QUI SOMMES NOUS ?
            </Link>

            <Link href="/professeurs" className="hover:text-[#FF5A5F] transition uppercase">
              COURS PARTICULIERS
            </Link>

            <button onClick={onOpenHelp} className="hover:text-[#FF5A5F] transition uppercase font-bold text-left">
              CENTRE D'AIDE
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
    <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-25">
      
      {/* 1. LOGO A GAUCHE */}
      <div className="flex items-center cursor-pointer">
        <Link href="/" className="text-2xl md:text-3xl font-extrabold text-[#FF5A5F] tracking-tight">
          profmaroc
        </Link>
      </div>

      {/* 2. MENU DU MILIEU (4 liens en majuscules) */}
      <div className="hidden lg:flex items-center gap-8 text-xs font-extrabold text-gray-900 tracking-wider">
        <Link href="/" className="hover:text-[#FF5A5F] transition uppercase">
          ACCUEIL
        </Link>

        <Link href="/about" className="hover:text-[#FF5A5F] transition uppercase">
          QUI SOMMES NOUS ?
        </Link>

        <Link href="/professeurs" className="hover:text-[#FF5A5F] transition uppercase">
          COURS PARTICULIERS
        </Link>

        <button onClick={onOpenHelp} className="hover:text-[#FF5A5F] transition uppercase font-bold text-left">
          CENTRE D'AIDE
        </button>
      </div>

      {/* 3. DROITE (Uniquement le bouton Espace Admin) */}
      <div className="hidden md:flex items-center gap-4">
        {!isAdminPage && (
          <Link 
            href="/admin" 
            className="px-4 py-2 bg-[#0B132B] text-white font-bold text-xs rounded-full hover:bg-gray-800 transition flex items-center gap-2 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-[#FF5A5F]" />
            <span>Espace Admin</span>
          </Link>
        )}
      </div>

      {/* Menu mobile hamburger */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-2 hover:bg-black/5 rounded-lg transition"
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </nav>
  );
}