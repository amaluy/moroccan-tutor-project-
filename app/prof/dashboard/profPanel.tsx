'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, MoreVertical } from 'lucide-react';

export default function ProfPanel() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Tableau de bord', href: '/prof/dashboard', icon: LayoutDashboard },
    { name: "Demandes d'élèves", href: '/prof/dashboard/demandes', icon: Users },
    { name: 'Disponibilités', href: '/prof/dashboard/disponibilites', icon: Calendar },
    { name: 'Modifier mon profil', href: '/prof/dashboard/profil', icon: Settings },
  ];

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Le bouton avec les 3 points */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 transition shadow-xs cursor-pointer flex items-center justify-center"
        aria-label="Menu options"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Le menu déroulant qui s'affiche au clic */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
          <div>
            {/* En-tête du menu */}
            <div className="mb-4 px-2 pb-3 border-b border-gray-100">
              <h2 className="text-base font-black text-gray-900 tracking-tight">Espace Prof</h2>
              <p className="text-xs text-gray-400 mt-0.5">Amal Berrada</p>
            </div>

            {/* Liens de navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#0f2922] text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bouton de déconnexion en bas */}
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}