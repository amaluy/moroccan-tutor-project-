'use client';

import { 
  LayoutDashboard, CheckSquare, Coins, TrendingUp, UserCheck, 
  Calendar as CalendarIcon, BarChart3, Settings, HelpCircle, LogOut, GraduationCap 
} from 'lucide-react';
import Link from 'next/link';

interface AdminPanelProps {
  onClose?: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white text-gray-800 w-80">
      
      {/* En-tête du menu */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-orange-50 p-1.5 rounded-xl border border-orange-100">
            <GraduationCap className="w-5 h-5 text-[#FF5733]" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-gray-900">prof<span className="text-[#FF5733]">maroc</span></span>
            <p className="text-[9px] font-extrabold text-[#FF5733] uppercase tracking-widest leading-none mt-0.5">ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Liens du menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">PILOTAGE MARKETPLACE</div>
          <div className="space-y-1">
            <Link 
              href="/admin/dashboard"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#0f2922] text-white transition shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Dashboard Exécutif</span>
              </div>
            </Link>

            <Link 
              href="/admin/dashboard/requests"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-gray-400" />
                <span>Gérer les Demandes (Profs)</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Actif</span>
            </Link>

            <Link 
              href="/admin/leads"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Suivi des Leads & Soldes</span>
              </div>
              <span className="text-[9px] font-extrabold bg-orange-100 text-[#FF5733] px-2 py-0.5 rounded-md">10 MAD</span>
            </Link>

            <Link 
              href="/admin/performance"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Taux d'Acceptation Profs</span>
            </Link>

            <Link 
              href="/admin/professors"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-500" />
              <span>Annuaire Professeurs (100 MAD)</span>
            </Link>
          </div>
        </div>

        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 mb-2">OUTILS & SUIVI</div>
          <div className="space-y-1">
            <Link 
              href="/admin/calendar"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span>Calendrier</span>
            </Link>

            <Link 
              href="/admin/analytics"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <span>Analytics Avancés</span>
            </Link>

            <Link 
              href="/admin/settings"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Paramètres</span>
            </Link>

            <Link 
              href="/admin/help"
              onClick={onClose}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>Aide & Support</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Pied du menu */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <Link
          href="/"
          onClick={onClose}
          className="w-full py-2.5 px-3 hover:bg-red-50 text-red-600 text-sm font-semibold rounded-xl transition flex items-center gap-3 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Link>
      </div>

    </div>
  );
}