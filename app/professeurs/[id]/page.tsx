'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Heart, Share2, MapPin, Video, Sparkles, MessageCircle, Info, User, Loader2 } from 'lucide-react';
import ContactModal from '@/app/components/ContactModal';
import { supabase } from '@/lib/supabase';

interface Professor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  level?: string;
  subject?: string;
  city?: string;
  price?: number;
  bio?: string;
  avatar_url?: string;
  rating?: number;
  total_reviews?: number;
  offers_free_trial?: boolean;
  is_online?: boolean;
}

export default function ProfessorProfilePage() {
  const params = useParams();
  const profId = params?.id as string;

  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProfessorData() {
      if (!profId) return;

      try {
        setLoading(true);

        // Requête sur la vraie table 'professors' avec l'ID de l'URL
        const { data: profData, error: profError } = await supabase
          .from('professors')
          .select('*')
          .eq('id', profId)
          .single();

        if (profError) throw profError;

        if (profData) {
          setProfessor(profData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du professeur:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfessorData();
  }, [profId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC]">
        <Loader2 className="w-8 h-8 text-[#FF5A5F] animate-spin" />
      </div>
    );
  }

  if (!professor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFC] px-4 text-center">
        <h1 className="text-xl font-bold text-gray-800">Professeur introuvable</h1>
        <p className="text-gray-500 text-xs mt-1">Ce profil n'existe pas ou a été supprimé.</p>
        <a href="/" className="mt-4 px-5 py-2 bg-[#FF5A5F] text-white rounded-xl font-bold text-xs">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ================= COLONNE GAUCHE ================= */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* MATIÈRE */}
          {professor.subject && (
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-50 text-[#FF5A5F] text-xs font-semibold rounded-full">
                {professor.subject}
              </span>
              {professor.level && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full uppercase">
                  {professor.level.replace('_', ' ')}
                </span>
              )}
            </div>
          )}

          {/* TITRE PRINCIPAL */}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            Cours particuliers de {professor.subject || 'soutien'} avec {professor.name}
          </h1>

          {/* LIEUX DU COURS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Lieux du cours</h3>
            <div className="flex flex-wrap gap-3">
              {professor.city && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-800 shadow-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{professor.city}</span>
                </div>
              )}
              {professor.is_online && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-800 shadow-sm">
                  <Video className="w-4 h-4 text-gray-500" />
                  <span>Webcam / En ligne</span>
                </div>
              )}
            </div>
          </div>

          {/* BADGE DE CONFIANCE */}
          <div className="bg-[#EEF2FF] border border-indigo-100 rounded-2xl p-5 flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-indigo-950 text-sm">Professeur vérifié</h4>
              <p className="text-xs text-indigo-900/80 leading-relaxed font-normal">
                Profil validé. Pédagogie rigoureuse et suivi personnalisé garanti.
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* À PROPOS DE LA BIO */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-gray-900">À propos du cours</h2>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {professor.bio || "Aucune description renseignée pour le moment."}
            </div>
          </div>

        </div>

        {/* ================= COLONNE DROITE (CARTE PROFIL) ================= */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xl space-y-6 text-center relative">
            
            <div className="absolute top-5 right-5 flex gap-1">
              <button className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-50 transition">
                <Heart className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-50 transition">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* AVATAR OU ICONE */}
            <div className="pt-2 flex flex-col items-center">
              <div className="relative">
                {professor.avatar_url ? (
                  <img src={professor.avatar_url} alt={professor.name} className="w-28 h-28 rounded-2xl object-cover shadow-md" />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                    <User className="w-14 h-14" />
                  </div>
                )}
                <span className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* VRAI NOM DE LA BDD */}
              <h2 className="text-2xl font-black text-gray-900 mt-4">{professor.name}</h2>
              
              <div className="flex items-center gap-1 text-xs text-gray-600 font-medium mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-900">{professor.rating || 5.0}</span>
                <span className="text-gray-400">({professor.total_reviews || 0} avis)</span>
              </div>
            </div>

            {/* TARIFS DEPUIS LA BDD */}
            <div className="divide-y divide-gray-100 text-sm">
              <div className="py-2.5 flex justify-between items-center text-gray-600 font-medium">
                <span>Tarif</span>
                <span className="font-black text-gray-900 text-base">{professor.price || 0} MAD/h</span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-gray-600 font-medium">
                <span>Ville</span>
                <span className="font-bold text-gray-900">{professor.city || 'Non spécifié'}</span>
              </div>
            </div>

            {/* BOUTON CONTACTER */}
            <div className="space-y-2">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="w-full py-4 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-2xl transition shadow-lg shadow-red-200 flex items-center justify-center gap-2 text-base"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contacter {professor.name.split(' ')[0]}</span>
              </button>
              {professor.offers_free_trial && (
                <p className="text-xs text-[#FF5A5F] font-bold">1er cours offert</p>
              )}
            </div>

          </div>
        </div>

      </div>

      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
        professor={professor}
      />
    </div>
  );
}