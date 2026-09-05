'use client';

import { useState } from 'react';
import { RefreshCw, Bell, Menu, X, LayoutDashboard, CheckSquare, Calendar as CalendarIcon, BarChart3, Users, Settings, HelpCircle, LogOut, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface AdminPanelProps {
  onRefreshData?: () => void;
  isLoading?: boolean;
  unreadCount?: number;
}

export default function AdminPanel({ 
  onRefreshData, 
  isLoading = false,
  unreadCount = 0 
}: AdminPanelProps) {
  // État local pour ouvrir/fermer le menu latéral (tiroir)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Barre supérieure du Dashboard */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 w-full shadow-2xs">
        {/* Partie Gauche : Menu burger (les 3 traits) & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
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
          {onRefreshData && (
            <button 
              onClick={onRefreshData} 
              title="Actualiser les données" 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

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

      {/* --- MENU LATÉRAL DU DASHBOARD (S'ouvre au clic sur le burger) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fond semi-transparent sombre */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Panneau latéral coulissant */}
          <div className="relative w-72 bg-white text-gray-800 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-gray-100">
            
            {/* En-tête du menu */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="bg-orange-50 p-1.5 rounded-xl border border-orange-100">
                  <GraduationCap className="w-5 h-5 text-[#FF5733]" />
                </div>
                <div>
                  <span className="text-base font-black tracking-tight text-gray-900">prof<span className="text-[#FF5733]">maroc</span></span>
                  <p className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest leading-none mt-0.5">ADMIN PANEL</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Liens du menu */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              
              {/* Section MENU */}
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">MENU</div>
                <div className="space-y-1">
                  <Link 
                    href="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#0f2922] text-white transition shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      <span>Dashboard</span>
                    </div>
                  </Link>

                  <Link 
                    href="/admin/tasks"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-4 h-4 text-gray-400" />
                      <span>Tasks</span>
                    </div>
                    <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">4</span>
                  </Link>

                  <Link 
                    href="/admin/calendar"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                  >
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>Calendar</span>
                  </Link>

                  <Link 
                    href="/admin/analytics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span>Analytics</span>
                  </Link>

                  <Link 
                    href="/admin/team"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Team</span>
                  </Link>
                </div>
              </div>

              {/* Section GENERAL */}
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">GENERAL</div>
                <div className="space-y-1">
                  <Link 
                    href="/admin/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Settings</span>
                  </Link>

                  <Link 
                    href="/admin/help"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                    <span>Help</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Pied du menu : Logout / Quitter */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-xl transition flex items-center gap-3 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}