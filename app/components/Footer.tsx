'use client';

import React from 'react';

interface FooterProps {
  onNavigateHome?: () => void;
  onOpenHelp?: () => void;
}

export default function Footer({ onNavigateHome, onOpenHelp }: FooterProps) {
  return (
    <footer className="py-6 px-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm w-full">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span 
            className="font-bold text-[#FF5A5F] cursor-pointer hover:opacity-80 transition"
            onClick={onNavigateHome}
          >
            profmaroc
          </span>
          <span>© 2026. Tous droits réservés.</span>
        </div>
        
        <div className="flex items-center gap-6 font-medium">
          <button 
            type="button"
            onClick={onNavigateHome} 
            className="hover:text-black transition cursor-pointer"
          >
            Confidentialité
          </button>
          <button 
            type="button"
            onClick={onNavigateHome} 
            className="hover:text-black transition cursor-pointer"
          >
            Conditions
          </button>
          {onOpenHelp && (
            <button 
              type="button"
              onClick={onOpenHelp} 
              className="hover:text-black transition cursor-pointer"
            >
              Aide & Contact
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}