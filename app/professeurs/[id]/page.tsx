'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '../../components/Footer';
import HelpModal from '../../components/HelpModal';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, Star, Share2, Heart, Loader2, 
  AlertTriangle, ArrowLeft, Calendar, Clock
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
  statut?: string;
  type_cours?: string;
  experience?: string;
  dernier_diplome?: string;
  profession?: string;
  age?: number | string;
  total_etoiles?: number | string;
  disponibilites?: any;
  created_at?: string;
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
  const city = professor.ville || professor.city || "Marrakech";
  const subject = professor.matiere || professor.subject || "Français";
  const price = Number(professor.tarif !== undefined && professor.tarif !== null ? professor.tarif : professor.price) || 250;
  const bio = professor.bio || professor.description || "";
  const level = professor.niveau || professor.level || "lyceecollege";

  const statut = professor.statut || "Professeur Confirmé";
  const typeCours = professor.type_cours || "domicile";
  const experience = professor.experience || "1-3ans";
  const niveauEnseigne = level;
  const dernierDiplome = professor.dernier_diplome || "Licence / Master";
  const profession = professor.profession || "etudiant";
  const age = professor.age || "24 ans";
  const totalEtoiles = professor.total_etoiles || "15 étoiles";

  // --- TRAITEMENT ROBUSTE DES DISPONIBILITÉS ---
  let availabilities: string[] = [];
  if (Array.isArray(professor.disponibilites)) {
    availabilities = professor.disponibilites;
  } else if (typeof professor.disponibilites === 'string') {
    try {
      const parsed = JSON.parse(professor.disponibilites);
      if (Array.isArray(parsed)) availabilities = parsed;
    } catch {
      const cleaned = professor.disponibilites.replace(/[{}]/g, '');
      availabilities = cleaned.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
  }

  // Fonction pour rendre le format "matin-lu" lisible (ex: "Lundi - Matin")
  const formatSlot = (slot: string) => {
    const parts = slot.split('-');
    if (parts.length !== 2) return slot;
    const [time, day] = parts;

    const dayMap: Record<string, string> = {
      lu: 'Lundi', ma: 'Mardi', me: 'Mercredi', je: 'Jeudi', ve: 'Vendredi', sa: 'Samedi', di: 'Dimanche'
    };
    const timeMap: Record<string, string> = {
      matin: 'Matin', midi: 'Midi', apresmidi: 'Après-midi', 'apres-midi': 'Après-midi'
    };

    const readableDay = dayMap[day.toLowerCase()] || day;
    const readableTime = timeMap[time.toLowerCase()] || time;

    return `${readableDay} (${readableTime})`;
  };

  const createdAtFormatted = professor.created_at 
    ? new Date(professor.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "28 août 2026";

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
        
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img 
            src="/minimaal.jpg" 
            alt="Arrière-plan minimaliste" 
            className="w-full h-full object-cover opacity-35"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="bg-rose-500 text-white px-3.5 py-1 rounded-full text-xs font-bold shadow-sm capitalize">
                {subject.toLowerCase()}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 capitalize tracking-tight">
              {fullName.toLowerCase()}
            </h1>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Profil créé le {createdAtFormatted}</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900">Lieux du cours</h3>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200/80 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 shadow-xs">
                <MapPin className="w-4 h-4 text-rose-500" />
                Chez {fullName.toLowerCase()} : {city.toLowerCase()}
              </div>
            </div>

            <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200/80 px-5 py-3 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-400">Tarif horaire :</span>
              <span className="text-lg font-black text-slate-900">{price} DH</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm h-[320px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              {photo ? (
                <img src={photo} alt={fullName} className="w-full h-full object-cover" />
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
        
        {/* Colonne de gauche (Cours & Disponibilités en Boutons) */}
        <div className="lg:col-span-7 space-y-8">
          
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

          {/* Affichage des disponibilités sous forme de boutons */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900">Créneaux de disponibilité</h3>
            {availabilities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune disponibilité renseignée pour le moment.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {availabilities.map((slot, index) => (
                  <div 
                    key={index}
                    className="bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-2 hover:border-rose-500 transition cursor-default"
                  >
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {formatSlot(slot)}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Colonne de droite : Carte Flottante */}
        <div className="lg:col-span-5 relative">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl sticky top-24 space-y-6 z-20">
            
            <div className="flex justify-end gap-2 text-slate-400">
              <button className="p-2 hover:bg-slate-50 rounded-full transition cursor-pointer">
                <Heart className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-full transition cursor-pointer">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <h2 className="text-xl font-black text-slate-900 capitalize">{fullName.toLowerCase()}</h2>
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>5</span>
                <span className="text-slate-400 font-normal">(1 avis)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black text-slate-900">À propos de {fullName.toLowerCase()}</h3>
              {!bio ? (
                <div className="bg-amber-50/95 backdrop-blur-md border border-amber-200/90 rounded-2xl p-3 flex gap-2.5 text-amber-900 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-[11px]">
                    <p className="font-bold">Ajoutez votre biographie !</p>
                    <p className="text-amber-700 leading-relaxed">
                      Aucune description détaillée n'a encore été renseignée.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-[11px] text-slate-700 leading-relaxed">
                  {bio}
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Tarif</span>
                <span className="text-base font-black text-slate-900">{price} DH</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Total des étoiles</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {totalEtoiles}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Âge</span>
                <span className="font-bold text-slate-800">{age}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Statut</span>
                <span className="font-bold text-slate-800">{statut}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Type de cours</span>
                <span className="font-bold text-slate-800">{typeCours}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Expérience</span>
                <span className="font-bold text-slate-800">{experience}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Niveau enseigné</span>
                <span className="font-bold text-slate-800">{niveauEnseigne}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Dernier diplôme</span>
                <span className="font-bold text-slate-800">{dernierDiplome}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Profession</span>
                <span className="font-bold text-slate-800">{profession}</span>
              </div>
            </div>

            <button className="w-full bg-[#ff2d55] hover:bg-[#e02447] text-white font-extrabold py-3.5 rounded-2xl text-sm transition shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer">
              Contacter
            </button>

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