'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, BookOpen, ChevronDown, 
  ShieldAlert, LogOut, HelpCircle, GraduationCap, User, Menu, X, Home, Info, ArrowRight
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
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onLogoutClick: () => void;
  onOpenHelp: () => void;
  onSelectCity?: (city: string) => void;
  onSelectSubject?: (subject: string) => void;
}

export default function Navbar({
  isMenuOpen,
  setIsMenuOpen,
  onLogoutClick,
  onOpenHelp,
  onSelectCity,
  onSelectSubject
}: NavbarProps) {
  const [openDropdown, setOpenDropdown] = useState<'villes' | 'matieres' | null>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    const profId = localStorage.getItem('professor_id');

    setUserEmail(email);

    const adminEmails = ['louizisalaheddine@gmail.com', 'berrada0amal@gmail.com'];
    const userIsAdmin = (email && adminEmails.includes(email)) || localStorage.getItem('is_admin') === 'true';
    setIsAdmin(userIsAdmin);

    if (userIsAdmin) {
      setIsProfessor(false);
      localStorage.removeItem('professor_id');
    } else {
      setIsProfessor(!!profId);
    }
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm w-full">
        {/* Bouton Burger collé à l'extrême gauche, reste de la navbar aligné proprement */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 w-full">
          
          {/* GAUCHE : Bouton Burger (Collé à l'extrême gauche) + Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-gray-700 hover:text-[#FF5733] hover:bg-orange-50 rounded-xl transition cursor-pointer border border-gray-200 shadow-xs flex items-center justify-center -ml-2 sm:ml-0"
              title="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-orange-50 p-1.5 rounded-xl border border-orange-100 group-hover:bg-orange-100 transition">
                <GraduationCap className="w-6 h-6 text-[#FF5733]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">
                prof<span className="text-[#FF5733]">maroc</span>
              </span>
            </Link>
          </div>

          {/* CENTRE : Menu Horizontal Classique */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-bold text-gray-700">
            <Link href="/" className="hover:text-[#FF5733] transition">
              ACCUEIL
            </Link>

            {/* Dropdown VILLES */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('villes')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-1.5 hover:text-[#FF5733] py-2 transition cursor-pointer">
                <MapPin className="w-4 h-4 text-[#FF5733]" />
                <span>VILLES</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'villes' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'villes' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 grid grid-cols-2 gap-1 z-50">
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
              <button className="flex items-center gap-1.5 hover:text-[#FF5733] py-2 transition cursor-pointer">
                <BookOpen className="w-4 h-4 text-[#FF5733]" />
                <span>MATIÈRES</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'matieres' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'matieres' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 grid grid-cols-2 gap-1 z-50">
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

            <button onClick={onOpenHelp} className="hover:text-[#FF5733] transition flex items-center gap-1.5 cursor-pointer">
              <HelpCircle className="w-4 h-4 text-[#FF5733]" />
              <span>AIDE</span>
            </button>
          </div>

          {/* DROITE : Actions contextuelles */}
          <div className="flex items-center gap-3">
            {!isProfessor && !isAdmin && (
              <Link 
                href="/donner-cours"
                className="hidden sm:inline-flex border border-[#FF5733] text-[#FF5733] hover:bg-[#FF5733] hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
              >
                Donner des cours
              </Link>
            )}

            {isProfessor && (
              <Link 
                href="/prof/dashboard"
                className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Mon Dashboard Prof</span>
              </Link>
            )}

            {!userEmail && (
              <Link
                href="/connexion"
                className="bg-[#FF5733] hover:bg-[#e0482b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <span>Se connecter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* --- PANNEAU LATÉRAL (DRAWER) --- */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="relative w-80 bg-gray-900 text-gray-200 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-[#FF5733]" />
                <span className="text-xl font-black text-white">prof<span className="text-[#FF5733]">maroc</span></span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              
              <div className="space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 px-3 mb-2">Navigation</div>
                <Link 
                  href="/" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:text-white transition"
                >
                  <Home className="w-4 h-4 text-[#FF5733]" />
                  <span>Accueil</span>
                </Link>
                <Link 
                  href="/qui-sommes-nous" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:text-white transition"
                >
                  <Info className="w-4 h-4 text-[#FF5733]" />
                  <span>Qui sommes-nous ?</span>
                </Link>
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenHelp();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:text-white transition text-left cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-[#FF5733]" />
                  <span>Aide & Support</span>
                </button>
              </div>

              {/* SECTION ADMIN (Espace Admin + Déconnexion) */}
              {isAdmin && (
                <div className="pt-4 border-t border-gray-800 space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 px-3 mb-2">Administration</div>
                  
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition border border-amber-500/20"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Espace Admin</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogoutClick();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}

            </div>

            {userEmail && (
              <div className="p-4 border-t border-gray-800 bg-gray-950/50 flex items-center justify-between">
                <div className="flex items-center gap-2 truncate text-xs text-gray-400">
                  <User className="w-4 h-4 text-[#FF5733] shrink-0" />
                  <span className="truncate">{userEmail}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}