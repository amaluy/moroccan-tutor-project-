'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, BookOpen, ChevronDown, 
  ShieldAlert, LogOut, HelpCircle, Menu, X, GraduationCap, Sparkles 
} from 'lucide-react';

const VILLES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", 
  "Fès", "Meknès", "Kénitra", "Mohammedia", "Oujda", "En ligne"
];

const MATIERES = [
  "Maths", "Physique", "Chimie", "SVT / Biologie", "Français", 
  "Anglais", "Arabe", "Économie", "Informatique", "Aide aux devoirs"
];

interface NavbarProps {
  isLoggedIn?: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onLogoutClick: () => void;
  onOpenHelp: () => void;
  onSelectCity?: (city: string) => void;
  onSelectSubject?: (subject: string) => void;
}

export default function Navbar({
  isLoggedIn = true,
  isMenuOpen,
  setIsMenuOpen,
  onLogoutClick,
  onOpenHelp,
  onSelectCity,
  onSelectSubject
}: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<'villes' | 'matieres' | null>(null);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo en Orange */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-orange-50 p-1.5 rounded-xl border border-orange-100 group-hover:bg-orange-100 transition">
              <GraduationCap className="w-6 h-6 text-[#FF5733]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              prof<span className="text-[#FF5733]">maroc</span>
            </span>
          </Link>

          {/* Navigation Principale Desktop */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-700">
            <Link href="/" className="hover:text-[#FF5733] transition">
              ACCUEIL
            </Link>

            {/* Dropdown VILLES */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('villes')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-[#FF5733] py-2 transition cursor-pointer">
                <MapPin className="w-3.5 h-3.5 text-[#FF5733]" />
                <span>VILLES</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'villes' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'villes' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {VILLES.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onSelectCity) onSelectCity(v);
                        setOpenDropdown(null);
                      }}
                      className="text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-orange-50 hover:text-[#FF5733] transition cursor-pointer"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown MATIÈRES */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('matieres')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-1 hover:text-[#FF5733] py-2 transition cursor-pointer">
                <BookOpen className="w-3.5 h-3.5 text-[#FF5733]" />
                <span>MATIÈRES</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === 'matieres' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'matieres' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  {MATIERES.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onSelectSubject) onSelectSubject(m);
                        setOpenDropdown(null);
                      }}
                      className="text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-orange-50 hover:text-[#FF5733] transition cursor-pointer"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/qui-sommes-nous" className="hover:text-[#FF5733] transition">
              QUI SOMMES NOUS ?
            </Link>

            <button onClick={onOpenHelp} className="hover:text-[#FF5733] transition flex items-center gap-1 cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5 text-[#FF5733]" />
              <span>AIDE</span>
            </button>
          </div>

          {/* Actions Côté Droit Desktop */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Bouton Donner des cours clean */}
            <Link 
              href="/donner-cours"
              className="border border-[#FF5733] text-[#FF5733] hover:bg-[#FF5733] hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
            >
              Donner des cours
            </Link>

            {/* BOUTON ESPACE ADMIN */}
            <Link
              href="/admin"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-2 shadow-sm border border-slate-700"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Espace Admin</span>
            </Link>

            {/* Bouton Déconnexion */}
            {isLoggedIn && (
              <button
                onClick={onLogoutClick}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bouton Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* --- MENU MOBILE SLIDE-DOWN --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 font-bold text-sm text-gray-700 pt-2">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-[#FF5733] transition py-1"
            >
              ACCUEIL
            </Link>

            <Link 
              href="/qui-sommes-nous" 
              onClick={() => setIsMenuOpen(false)}
              className="hover:text-[#FF5733] transition py-1"
            >
              QUI SOMMES NOUS ?
            </Link>

            <button 
              onClick={() => {
                setIsMenuOpen(false);
                onOpenHelp();
              }} 
              className="text-left hover:text-[#FF5733] transition flex items-center gap-2 py-1"
            >
              <HelpCircle className="w-4 h-4 text-[#FF5733]" />
              <span>AIDE</span>
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2.5">
            <Link 
              href="/donner-cours"
              onClick={() => setIsMenuOpen(false)}
              className="w-full bg-[#FF5733] text-white font-extrabold text-xs py-3 rounded-xl text-center shadow-sm flex items-center justify-center gap-2"
            >
              Devenir Enseignant
            </Link>

            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Espace Admin</span>
            </Link>

            {isLoggedIn && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogoutClick();
                }}
                className="w-full text-red-600 bg-red-50 hover:bg-red-100 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}