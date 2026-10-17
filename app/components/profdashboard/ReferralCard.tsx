'use client';

import { Gift, Share2, ArrowRight } from 'lucide-react';

interface ReferralCardProps {
  isDarkMode?: boolean;
}

export default function ReferralCard({ isDarkMode = false }: ReferralCardProps) {
  return (
    <div className={`p-7 rounded-3xl border transition-all duration-300 flex flex-col justify-between group block ${
      isDarkMode 
        ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-white' 
        : 'bg-white border-slate-200/80 shadow-xs hover:shadow-md text-slate-900'
    }`}>
      <div className="space-y-4">
        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
          <Gift className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold">Parrainez un collègue professeur</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">
            Invitez d&apos;autres enseignants sur ProfMaroc et gagnez chacun <strong>5 leads gratuits</strong> dès leur première inscription.
          </p>
        </div>
      </div>

      <button 
        onClick={() => alert("Lien de parrainage copié dans le presse-papier !")}
        className="mt-6 flex items-center text-xs font-extrabold text-orange-600 gap-1.5 group-hover:translate-x-1 transition-transform cursor-pointer"
      >
        <Share2 className="w-4 h-4" />
        <span>Partager mon lien de parrainage</span>
        <ArrowRight className="w-4 h-4 ml-auto" />
      </button>
    </div>
  );
}