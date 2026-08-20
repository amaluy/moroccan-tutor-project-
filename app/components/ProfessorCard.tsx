'use client';

import Link from 'next/link';
import { Star, Heart, User } from 'lucide-react';

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
      className="block group cursor-pointer transition-all duration-300 hover:-translate-y-1"
    >
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
        
        {/* IMAGE / HEADER DU PROF */}
        <div className="relative h-64 bg-slate-200 flex items-center justify-center overflow-hidden">
          {prof.avatarUrl ? (
            <img 
              src={prof.avatarUrl} 
              alt={prof.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            /* Icone de remplacement si pas de photo */
            <User className="w-20 h-20 text-slate-400 stroke-[1.5]" />
          )}

          {/* DÉGRADÉ NOIR SUR L'IMAGE POUR LE NOM */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
            <h3 className="text-xl font-black leading-tight group-hover:text-red-400 transition-colors">
              {prof.name}
            </h3>
            <p className="text-xs text-gray-200 mt-0.5 font-medium">
              {prof.location}
            </p>
          </div>

          {/* BOUTON FAVORIS (CŒUR) */}
          <button 
            onClick={(e) => {
              e.preventDefault(); // Empêche d'ouvrir le lien quand on clique sur le cœur
              // Gestion des favoris
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* CORPS DE LA CARTE */}
        <div className="p-5 space-y-4">
          
          {/* NOTE ET BADGE CONFIRMÉ */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{prof.rating}</span>
              <span className="text-gray-400 font-normal">({prof.reviewsCount} avis)</span>
            </div>

            {prof.isConfirmed && (
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                Confirmé
              </span>
            )}
          </div>

          {/* DESCRIPTION & MATIÈRE */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            <strong className="text-gray-900 font-bold">{prof.subject}</strong> - {prof.description}
          </p>

          {/* SEPARATEUR */}
          <hr className="border-gray-100" />

          {/* TARIF ET OFFRE */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-base font-black text-gray-900">{prof.price} MAD</span>
              <span className="text-xs text-gray-500 font-medium">/h</span>
            </div>

            {prof.firstLessonFree && (
              <span className="text-xs font-bold text-[#FF5A5F]">
                1er cours offert
              </span>
            )}
          </div>

        </div>
      </div>
    </Link>
  );
}