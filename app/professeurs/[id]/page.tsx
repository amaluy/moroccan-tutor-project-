'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../components/Footer';
import HelpModal from '../../components/HelpModal';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, Star, Share2, Heart, Loader2, 
  AlertTriangle, ArrowLeft
} from 'lucide-react';

interface Professor {
  id: string;
  Nom?: string;
  Prénom?: string;
  nom?: string;
  prenom?: string;
  name?: string;
  email?: string;
  Email?: string;
  photo_URL?: string;
  photo_url?: string;
  avatar_url?: string;
  photo?: string;
  ville?: string;
  city?: string;
  niveau?: string;
  level?: string;
  matiere?: string;
  subject?: string;
  title?: string;
  tarif?: number | string;
  price?: number | string;
  lieu?: string;
  location?: string;
  bio?: string;
  description?: string;
}

export default function ProfessorDetail() {
  const params = useParams();
  const id = params?.id as string;

  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('recherche');

  useEffect(() => {
    if (!id) return;

    const fetchProfessor = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('professors')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Erreur Supabase:', error);
          setProfessor(null);
        } else {
          setProfessor(data);
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessor();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Chargement du profil...</p>
        </div>
      </main>
    );
  }

  if (!professor) {
    return (
      <main className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-900">Professeur introuvable</h1>
        <p className="text-sm text-slate-500">Le profil que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link href="/" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow">
          Retour à l'accueil
        </Link>
      </main>
    );
  }

  const nomField = professor.Nom || professor.nom || '';
  const prenomField = professor.Prénom || professor.prenom || '';
  const fullName = (nomField || prenomField)
    ? `${prenomField} ${nomField}`.trim()
    : (professor.name || 'Professeur');

  const photo = professor.photo_URL || professor.photo_url || professor.photo || professor.avatar_url;
  const city = professor.ville || professor.city || "Casablanca";
  const subject = professor.matiere || professor.subject || "math";
  const price = Number(professor.tarif !== undefined && professor.tarif !== null ? professor.tarif : professor.price) || 44;
  const bio = professor.bio || professor.description || "";
  const level = professor.niveau || professor.level || "Tous niveaux";

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Top Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" /> Retour aux recherches
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-black tracking-wider text-slate-900 flex items-center gap-1">
            <span className="text-rose-500 text-base">🎓</span> profmaroc
          </Link>
        </div>
      </header>

      {/* SECTION PLEINE LARGEUR AVEC IMAGE DE FOND */}
      <div className="w-full relative border-b border-slate-200/40 pt-10 pb-16 min-h-[420px] flex items-center bg-[#faf9f6]">
        
        {/* Image de fond visible et correctement positionnée */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img 
            src="/minimaal.jpg" 
            alt="Arrière-plan minimaliste" 
            className="w-full h-full object-cover opacity-35"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Colonne Gauche : Nom, Tags, Lieux et Tarif */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-rose-500 text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-sm capitalize">
                {subject.toLowerCase()}
              </span>
              <span className="bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 px-3.5 py-1 rounded-full text-xs font-bold shadow-2xs">
                Pédagogie
              </span>
            </div>

            {/* Nom et Prénom du professeur à la place de Math */}
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 capitalize tracking-tight">
              {fullName.toLowerCase()}
            </h1>

            {/* Lieux du cours */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900">Lieux du cours</h3>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200/80 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 shadow-xs">
                <MapPin className="w-4 h-4 text-rose-500" />
                Chez {fullName.toLowerCase()} : {city.toLowerCase()}
              </div>
            </div>

            {/* Tarif placé avant la bio */}
            <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200/80 px-5 py-3 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-400">Tarif horaire :</span>
              <span className="text-lg font-black text-slate-900">{price} DH</span>
            </div>

          </div>

          {/* Colonne Droite : Grand rectangle pour la photo du professeur */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm h-[320px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              {photo ? (
                <img 
                  src={photo} 
                  alt={fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-4xl">
                  {getInitials(fullName)}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* RESTE DU CONTENU */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        
        {/* Colonne de gauche (Suite : Biographie & Cours) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* À propos & Bloc "Ajouter votre biographie" */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900">À propos de {fullName.toLowerCase()}</h3>
            
            {!bio ? (
              <div className="bg-amber-50/95 backdrop-blur-md border border-amber-200/90 rounded-2xl p-4 flex gap-3 text-amber-900 shadow-md">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <p className="font-bold">Ajoutez votre biographie pour attirer plus d'élèves !</p>
                  <p className="text-amber-700 leading-relaxed">
                    Aucune description détaillée n'a encore été renseignée. Rédigez votre parcours, votre méthodologie et votre passion pour inspirer confiance aux futurs élèves.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-700 leading-relaxed shadow-md">
                {bio}
              </div>
            )}
          </div>

          {/* À propos du cours */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">À propos du cours</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
                {level}
              </span>
              <span className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-medium text-slate-600">
                Français
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Concernant mes cours, je vise tous les niveaux. Mon but est de donner une meilleure formation aux élèves tout en travaillant sur leur réflexe artistique ou académique.
            </p>
          </div>

          {/* Disponibilité Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900">Disponibilité</h3>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 overflow-x-auto shadow-2xs">
              <table className="w-full text-center text-xs text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium">
                    <th className="pb-3 text-left"></th>
                    <th className="pb-3">Lu</th>
                    <th className="pb-3">Ma</th>
                    <th className="pb-3">Me</th>
                    <th className="pb-3">Je</th>
                    <th className="pb-3">Ve</th>
                    <th className="pb-3">Sa</th>
                    <th className="pb-3">Di</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="py-3 text-left font-bold text-slate-700">Matin</td>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                  <tr>
                    <td className="py-3 text-left font-bold text-slate-700">Midi</td>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                  <tr>
                    <td className="py-3 text-left font-bold text-slate-700">Après-midi</td>
                    <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Colonne de droite : Carte Flottante de Contact */}
        <div className="lg:col-span-5 relative">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl sticky top-24 space-y-6 z-20">
            
            {/* Top Action Icons */}
            <div className="flex justify-end gap-2 text-slate-400">
              <button className="p-2 hover:bg-slate-50 rounded-full transition cursor-pointer">
                <Heart className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-full transition cursor-pointer">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Name & Stars */}
            <div className="flex flex-col items-center text-center space-y-2">
              <h2 className="text-xl font-black text-slate-900 capitalize">{fullName.toLowerCase()}</h2>
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>5</span>
                <span className="text-slate-400 font-normal">(1 avis)</span>
              </div>
            </div>

            {/* Price and Stats */}
            <div className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-400">Tarif</span>
                <span className="text-base font-black text-slate-900">{price} DH</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-400">Réponse</span>
                <span className="font-bold text-slate-800">1h</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <span className="text-slate-400">Élèves</span>
                <span className="font-bold text-slate-800">2</span>
              </div>
            </div>

            {/* Action CTA Button */}
            <button className="w-full bg-[#ff2d55] hover:bg-[#e02447] text-white font-extrabold py-3.5 rounded-2xl text-sm transition shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer">
              Contacter
            </button>

            {/* Review Input Box */}
            <div className="border border-slate-200/80 rounded-2xl p-4 text-center space-y-2 bg-slate-50/50">
              <p className="text-[11px] font-bold text-slate-600">Donner votre avis sur {fullName.toLowerCase()}</p>
              <div className="flex justify-center gap-1 text-slate-300">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 hover:text-amber-400 hover:fill-amber-400 cursor-pointer transition" />
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      <Footer 
        onNavigateHome={() => {}} 
        onOpenHelp={() => setIsHelpOpen(true)} 
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        helpSection={helpSection} 
        setHelpSection={setHelpSection} 
      />

    </main>
  );
}