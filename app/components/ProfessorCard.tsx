'use client';

import Link from 'next/link';
import { Star, Heart, User, MapPin, CheckCircle } from 'lucide-react';

interface ProfessorProps {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  subject: string;
  description: string;
  price: number;
  isConfirmed?: boolean;
  firstLessonFree?: boolean;
  avatarUrl?: string;
}

export default function ProfessorCard({ prof }: { prof: ProfessorProps }) {
  return (
    <Link 
      href={`/professeurs/${prof.id}`}
      className="block group cursor-pointer transition-all duration-300"
    >
      {/* Container horizontal sur desktop, vertical sur mobile */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start relative">
        
        {/* 1. PHOTO & STATUT EN LIGNE (Ronde à gauche) */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-gray-100 bg-slate-100 flex items-center justify-center">
            {prof.avatarUrl ? (
              <img 
                src={prof.avatarUrl} 
                alt={prof.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <User className="w-12 h-12 text-slate-400 stroke-[1.5]" />
            )}
          </div>

          {/* Pastille En ligne / Badge */}
          <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
            Disponible
          </span>
        </div>

        {/* 2. DÉTAILS DU PROFESSEUR (Milieu) */}
        <div className="flex-1 space-y-2 text-center sm:text-left w-full">
          
          {/* Nom & Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-lg font-black text-gray-900 group-hover:text-[#FF5A5F] transition-colors">
              {prof.name}
            </h3>
            
            {prof.isConfirmed && (
              <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-purple-100">
                <CheckCircle className="w-3 h-3 text-purple-600" />
                Vérifié
              </span>
            )}
          </div>

          {/* Localisation & Matière */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {prof.location}
            </span>
            <span>•</span>
            <span className="font-bold text-gray-700">
              {prof.subject}
            </span>
          </div>

          {/* Note & Avis */}
          <div className="flex items-center justify-center sm:justify-start gap-1 text-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-gray-900">{prof.rating}</span>
            <span className="text-gray-400">({prof.reviewsCount} avis)</span>
          </div>

          {/* Description / Accroche */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pt-1">
            {prof.description}
          </p>
        </div>

        {/* 3. PRIX ET BOUTON ACTION (Droite) */}
        <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:justify-between items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0 self-stretch">
          
          {/* Bouton Favoris sur Desktop */}
          <button 
            onClick={(e) => {
              e.preventDefault();
            }}
            className="hidden sm:flex w-8 h-8 rounded-full bg-gray-50 hover:bg-rose-50 hover:text-rose-500 text-gray-400 items-center justify-center transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Tarif */}
          <div className="text-left sm:text-right">
            <div className="text-xl font-black text-gray-900">
              {prof.price} MAD<span className="text-xs text-gray-400 font-normal">/h</span>
            </div>
            {prof.firstLessonFree && (
              <span className="text-[11px] font-bold text-emerald-600 block">
                1er cours offert
              </span>
            )}
          </div>

          {/* Bouton Contacter */}
          <span className="bg-[#FF5A5F] group-hover:bg-[#e0484d] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm">
            Contacter
          </span>

        </div>

      </div>
    </Link>
  );
}