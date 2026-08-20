import React from 'react';
import { Star, Heart, User } from 'lucide-react';
import { Professor } from '@/types/professor';

interface ProfessorCardProps {
  prof: Professor;
}

export const ProfessorCard: React.FC<ProfessorCardProps> = ({ prof }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group">
      <div className="relative h-72 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {prof.avatar_url ? (
          <img 
            src={prof.avatar_url} 
            alt={prof.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
            <User className="w-24 h-24 stroke-[1]" />
          </div>
        )}

        <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition z-10">
          <Heart className="w-5 h-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white drop-shadow-md">
          <h3 className="text-2xl font-bold leading-tight">{prof.name}</h3>
          <p className="text-xs font-medium text-gray-200">
            {prof.city} {prof.is_online ? '(face à face & webcam)' : '(face à face)'}
          </p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{prof.rating || 5}</span>
              <span className="text-gray-400 font-normal">({prof.total_reviews || 0} avis)</span>
            </div>

            {prof.is_approved && (
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                Confirmé
              </span>
            )}
          </div>

          <p className="text-sm text-gray-700 font-medium line-clamp-2">
            <strong className="text-gray-900">{prof.subject}</strong> - {prof.bio}
          </p>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-extrabold text-gray-900">{prof.price}MAD</span>
            <span className="text-xs text-gray-500">/h</span>
          </div>

          {prof.offers_free_trial && (
            <span className="text-xs font-semibold text-[#FF5A5F]">
              1<sup>er</sup> cours offert
            </span>
          )}
        </div>
      </div>
    </div>
  );
};