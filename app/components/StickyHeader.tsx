'use client';

import { useRef, useState, useEffect } from 'react';
import { Search, BookOpen, MapPin, HelpCircle } from 'lucide-react';
import { subjectsData } from '../data/subjectsData';

interface StickyHeaderProps {
  isScrolled: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  locationTerm: string;
  setLocationTerm: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onLogoutClick: () => void;
  onOpenHelp: () => void;
}

export default function StickyHeader({
  isScrolled,
  searchTerm,
  setSearchTerm,
  locationTerm,
  setLocationTerm,
  onSearch,
  onLogoutClick,
  onOpenHelp
}: StickyHeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<'header' | null>(null);
  const headerDropdownRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        headerDropdownRef.current && !headerDropdownRef.current.contains(target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    onSearch(e);
    setActiveDropdown(null);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300 transform ${
      isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <span 
          className="text-xl font-extrabold text-[#FF5A5F] tracking-tight shrink-0 cursor-pointer" 
          onClick={onLogoutClick}
        >
          profmaroc
        </span>

        <form onSubmit={handleFormSubmit} className="flex-1 max-w-xl relative" ref={headerDropdownRef}>
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <div className="flex items-center gap-2 flex-1 border-r border-gray-300 pr-3">
              <BookOpen className="w-4 h-4 text-[#FF5A5F]" />
              <input
                type="text"
                placeholder="Matière"
                value={searchTerm}
                onFocus={() => setActiveDropdown('header')}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-1 pl-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Lieu du cours"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
              />
            </div>

            <button 
              type="submit" 
              className="bg-[#FF5A5F] hover:bg-[#E0484C] text-white p-2 rounded-full transition ml-1 shrink-0"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {activeDropdown === 'header' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              {subjectsData
                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((subject) => (
                  <button
                    key={subject.name}
                    type="button"
                    onClick={() => {
                      setSearchTerm(subject.name);
                      setActiveDropdown(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition font-medium"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{subject.name}</span>
                  </button>
              ))}
            </div>
          )}
        </form>

        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={onOpenHelp} 
            className="text-gray-600 hover:text-black p-1 transition"
            title="Centre d'aide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-full transition cursor-pointer">
            Donner des cours
          </span>
        </div>
      </div>
    </header>
  );
}