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
      {/* Container horizontal sur desktop, vertical sur mobile avec design épuré */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start relative">
        
        {/* 1. PHOTO & STATUT EN LIGNE (Ronde à gauche) */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-100 flex items-center justify-center shadow-inner">
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
          <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
            Disponible
          </span>
        </div>

        {/* 2. DÉTAILS DU PROFESSEUR (Milieu) */}
        <div className="flex-1 space-y-2 text-center sm:text-left w-full">
          
          {/* Nom & Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors">
              {prof.name}
            </h3>
            
            {prof.isConfirmed && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Vérifié
              </span>
            )}
          </div>

          {/* Localisation & Matière */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {prof.location}
            </span>
            <span>•</span>
            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {prof.subject}
            </span>
          </div>

          {/* Note & Avis */}
          <div className="flex items-center justify-center sm:justify-start gap-1 text-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-slate-900">{prof.rating}</span>
            <span className="text-slate-400">({prof.reviewsCount} avis)</span>
          </div>

          {/* Description / Accroche */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
            {prof.description}
          </p>
        </div>

        {/* 3. PRIX ET BOUTON ACTION (Droite) */}
        <div className="w-full sm:w-auto flex sm:flex-col justify-between sm:justify-between items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 self-stretch">
          
          {/* Bouton Favoris sur Desktop */}
          <button 
            onClick={(e) => {
              e.preventDefault();
            }}
            className="hidden sm:flex w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 items-center justify-center transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Tarif */}
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-xl font-black text-slate-900">
              {prof.price} DH<span className="text-xs text-slate-400 font-normal">/h</span>
            </div>
            {prof.firstLessonFree && (
              <span className="text-[11px] font-bold text-emerald-600 block">
                1er cours offert
              </span>
            )}
          </div>

          {/* Bouton Contacter */}
          <span className="bg-slate-900 group-hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs">
            Contacter
          </span>

        </div>

      </div>
    </Link>
  );
}