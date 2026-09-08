'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, GraduationCap } from 'lucide-react';

interface ProfPanelProps {
  profName: string;
  profImage?: string;
  niveau?: string[] | string;
}

export default function ProfPanel({ profName, profImage, niveau }: ProfPanelProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Tableau de bord', href: '/prof/dashboard', icon: LayoutDashboard },
    { name: "Demandes d'élèves", href: '/prof/dashboard/demandes', icon: Users },
    { name: 'Disponibilités', href: '/prof/dashboard/disponibilites', icon: Calendar },
    { name: 'Modifier mon profil', href: '/prof/profile', icon: Settings },
  ];

  const formatNiveau = (niv: string[] | string | undefined) => {
    if (!niv) return 'Professeur';
    if (Array.isArray(niv)) {
      if (niv.length === 0 || (niv.length === 1 && niv[0] === '[]')) return 'Professeur';
      return niv.join(', ');
    }
    return niv;
  };

  return (
    <aside className="w-28 md:w-72 bg-[#1b222c] text-white min-h-screen p-4 md:p-6 flex flex-col justify-between shrink-0 shadow-xl transition-all">
      <div>
        {/* LOGO EXACT COMME SUR L'IMAGE 2 */}
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-orange-50/10 p-2 rounded-2xl border border-orange-500/20 hidden md:flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-orange-500" />
          </div>
          <div className="hidden md:flex items-center text-xl font-black tracking-tight">
            <span className="text-white">prof</span>
            <span className="text-orange-500">maroc</span>
          </div>
          {/* Version mobile compacte */}
          <div className="md:hidden flex items-center justify-center w-full">
            <GraduationCap className="w-7 h-7 text-orange-500" />
          </div>
        </div>

        {/* Profil du professeur (Sans le like) */}
        <div className="flex flex-col items-center mb-10 bg-[#252e3d]/50 p-4 rounded-3xl border border-gray-800/60 relative">
          
          <div className="relative mb-3 mt-1">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 via-cyan-400 to-blue-500 shadow-lg">
              {profImage ? (
                <img 
                  src={profImage} 
                  alt={profName} 
                  className="w-full h-full rounded-full object-cover bg-[#1b222c]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1b222c] flex items-center justify-center text-lg font-bold text-white">
                  {profName.charAt(0)}
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#1b222c] rounded-full"></span>
          </div>

          <h2 className="font-bold text-sm md:text-base text-white text-center capitalize tracking-tight line-clamp-1">{profName}</h2>
          
          <span className="text-[11px] md:text-xs text-gray-400 font-medium mt-1 capitalize bg-gray-800/80 px-2.5 py-0.5 rounded-full border border-gray-700/50">
            {formatNiveau(niveau)}
          </span>
        </div>

        {/* Liens de navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.name}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-100 text-gray-900 shadow-md font-bold'
                    : 'text-gray-400 hover:bg-[#252e3d] hover:text-white'
                }`}
              >
                <div className={`p-1 rounded-xl ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Déconnexion */}
      <div className="pt-4 border-t border-gray-800/60">
        <button 
          onClick={() => {
            localStorage.removeItem('profEmail');
            window.location.href = '/prof/login';
          }}
          className="w-full flex items-center justify-center md:justify-start gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="hidden md:inline">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}