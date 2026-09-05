'use client';

import { RefreshCw, Bell, Menu } from 'lucide-react';

interface AdminNavbarProps {
  onOpenMobileMenu: () => void;
  onRefreshData: () => void;
  isLoading?: boolean;
  unreadCount?: number;
}

export default function AdminNavbar({ 
  onOpenMobileMenu, 
  onRefreshData, 
  isLoading = false,
  unreadCount = 0 
}: AdminNavbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 w-full shadow-2xs">
      {/* Partie Gauche : Menu burger & Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenMobileMenu} 
          className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 transition cursor-pointer flex items-center justify-center shadow-2xs"
          title="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-black text-base tracking-tight text-gray-900">profmaroc</span>
          <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-md">ADMIN</span>
        </div>
      </div>

      {/* Partie Droite : Actions & Profil */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onRefreshData} 
          title="Actualiser les données" 
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            ÉM
          </div>
          <div>
            <p className="font-bold text-xs text-gray-900 leading-none">Émil</p>
            <p className="text-[10px] text-gray-400 mt-0.5">berrada0amal@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}