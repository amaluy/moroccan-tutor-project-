"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HelpModal from '../../components/HelpModal';
import { 
  MapPin, Clock, CheckCircle2, Send, Lock, Share2, User, Heart, Upload, Star, AlertCircle
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfessorProfilePage() {
  const router = useRouter();
  const params = useParams();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('acceptee');

  const [prof, setProf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // États pour la notation interactive
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProf() {
      if (!params?.id) return;

      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        console.log("DONNÉES BRUTES SUPABASE :", data);
        
        const prenom = data.prenom || data.Prénom || '';
        const nom = data.nom || data.Nom || '';
        const fullName = `${prenom} ${nom}`.trim() || "Professeur";
        const villeProf = data.ville || data.city || data.location || "Maroc";
        const photoProf = data.photo_URL || data.avatar || null;
        
        // Récupération de l'email du prof
        const profEmail = data.email || data.mail || '';

        const rawTarif = data.tarif || data.price || data.tarif_horaire;
        const formattedPrice = rawTarif ? `${rawTarif} DH` : "Sur demande";

        const professorBio = data.bio || data.description || "";

        let rawDispos: string[] = [];
        const dbDispoField = data.disponibilities || data.disponibilites || data.dispos;
        
        if (Array.isArray(dbDispoField)) {
          rawDispos = dbDispoField;
        } else if (typeof dbDispoField === 'string') {
          rawDispos = dbDispoField.replace(/[{}"']/g, '').split(',').map(s => s.trim());
        }

        const availabilityGridMap: Record<string, boolean> = {};
        
        rawDispos.forEach((item: string) => {
          if (item && typeof item === 'string') {
            const cleanItem = item.trim().toLowerCase();
            availabilityGridMap[cleanItem] = true;
            
            if (cleanItem.includes('apres-midi') || cleanItem.includes('après-midi') || cleanItem.includes('apresmidi')) {
              const baseDay = cleanItem.split('-').pop();
              if (baseDay) {
                availabilityGridMap[`apresmidi-${baseDay}`] = true;
                availabilityGridMap[`apres-midi-${baseDay}`] = true;
                availabilityGridMap[`après-midi-${baseDay}`] = true;
              }
            }
          }
        });

        setProf({
          id: data.id,
          email: profEmail,
          name: fullName,
          avatar: photoProf,
          tags: data.tags || [data.matiere || "Soutien Scolaire", "Pédagogie"],
          title: data.title || data.matiere || "Cours particuliers et soutien scolaire adaptés à vos besoins",
          price: formattedPrice,
          rating: Number(data.rating) || 5,
          reviewsCount: Number(data.reviews_count) || 1,
          responseTime: data.response_time || "1h",
          studentsCount: data.students_count || "2",
          cities: [villeProf],
          levels: data.levels || ["Primaire", "Collège", "Lycée"],
          bio: professorBio,
          hasBio: !!data.bio && data.bio.trim().length > 0,
          availabilityGrid: availabilityGridMap
        });
      } else {
        setProf({
          id: String(params.id),
          email: "",
          name: "Professeur",
          avatar: null,
          tags: ["Soutien Scolaire"],
          title: "Professeur particulier motivé",
          price: "Sur demande",
          rating: 5,
          reviewsCount: 1,
          responseTime: "1h",
          studentsCount: "2",
          cities: ["Maroc"],
          levels: ["Primaire", "Collège", "Lycée"],
          bio: "",
          hasBio: false,
          availabilityGrid: {}
        });
      }
      setLoading(false);
    }

    fetchProf();
  }, [params?.id]);

  const handleRate = (rateValue: number) => {
    if (hasVoted) return;
    setUserRating(rateValue);
    setHasVoted(true);

    const currentTotalScore = prof.rating * prof.reviewsCount;
    const newReviewsCount = prof.reviewsCount + 1;
    const newRating = Number(((currentTotalScore + rateValue) / newReviewsCount).toFixed(1));

    setProf((prev: any) => ({
      ...prev,
      rating: newRating,
      reviewsCount: newReviewsCount
    }));
  };

  // Envoi du formulaire de contact avec la colonne message dédiée
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from('leads').insert([
      {
        professor_email: prof.email,
        student_name: formData.fullName,
        student_email: formData.email,
        student_phone: formData.phone,
        message: formData.message, // Enregistrement du message de l'élève
        status: 'pending'
      }
    ]);

    if (error) {
      console.error("Erreur lors de l'insertion du lead :", error);
    } else {
      console.log("Lead et message insérés avec succès !");
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500 text-base">
        Chargement du profil...
      </div>
    );
  }

  if (!prof) return null;

  const JOURS = [
    { label: 'Lu', key: 'lu' },
    { label: 'Ma', key: 'ma' },
    { label: 'Me', key: 'me' },
    { label: 'Je', key: 'je' },
    { label: 'Ve', key: 've' },
    { label: 'Di', key: 'di' }
  ];

  const CRENEAUX = [
    { label: 'Matin', key: 'matin' },
    { label: 'Midi', key: 'midi' },
    { label: 'Après-midi', key: 'apresmidi' }
  ];

  const availabilityGrid = prof.availabilityGrid || {};

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      <Navbar 
        isLoggedIn={true}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => router.replace('/connexion')}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 text-left relative items-start">
        
        <section className="lg:col-span-7 space-y-10">
          
          <div className="flex flex-wrap gap-2">
            {prof.tags.map((tag: string, idx: number) => (
              <span key={idx} className="bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
            {prof.title}
          </h1>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900">Lieux du cours</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 bg-white shadow-xs">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>Chez {prof.name} : {prof.cities[0]}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">À propos de {prof.name}</h3>
            </div>

            {prof.hasBio ? (
              <p className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {prof.bio}
              </p>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Ajoutez votre biographie pour attirer plus d'élèves !</span>
                </div>
                <p className="text-sm text-amber-700">
                  {prof.bio || "Aucune description détaillée n'a encore été renseignée. Rédigez votre parcours, votre méthodologie et votre passion pour inspirer confiance aux futurs élèves."}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">À propos du cours</h3>
            <div className="flex flex-wrap gap-2 pb-2">
              <span className="border border-gray-200 text-gray-700 text-xs px-3.5 py-1.5 rounded-full font-medium">Tous niveaux</span>
              <span className="border border-gray-200 text-gray-700 text-xs px-3.5 py-1.5 rounded-full font-medium">Français</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Concernant mes cours, je vise tous les niveaux. Mon but est de donner une meilleure formation aux élèves tout en travaillant sur leur réflexe artistique ou académique.
            </p>
          </div>

          {/* SECTION DISPONIBILITÉ */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">
              Disponibilité
            </h3>

            <div className="w-full text-xs max-w-md bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-8 gap-1 pb-3 border-b border-gray-200 text-center font-bold text-gray-800 text-sm">
                <span></span>
                {JOURS.map((day) => (
                  <span key={day.key}>{day.label}</span>
                ))}
              </div>

              {CRENEAUX.map((creneau) => (
                <div key={creneau.key} className="grid grid-cols-8 gap-1 py-3 border-b border-gray-200/60 items-center">
                  <span className="font-semibold text-gray-700 text-xs">{creneau.label}</span>
                  {JOURS.map((jour) => {
                    const keyString = `${creneau.key}-${jour.key}`;
                    const isAvailable = !!availabilityGrid[keyString];
                    
                    return (
                      <div key={jour.key} className="flex justify-center">
                        {isAvailable && <span className="w-4 h-4 rounded-full bg-orange-500 shadow-sm" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        </section>

        <aside className="lg:col-span-5 sticky top-6">
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xl space-y-6">
            
            <div className="flex items-start justify-between relative">
              <div className="flex gap-2 text-gray-400 absolute right-0 top-0">
                <button className="p-2 hover:text-gray-600 transition cursor-pointer"><Heart className="w-5 h-5" /></button>
                <button className="p-2 hover:text-gray-600 transition cursor-pointer"><Upload className="w-5 h-5" /></button>
              </div>

              <div className="flex flex-col items-center w-full pt-2">
                {prof.avatar ? (
                  <img src={prof.avatar} className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-orange-100" alt={prof.name} />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white">
                    {prof.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                
                <h2 className="text-xl font-bold text-gray-900 mt-3">{prof.name}</h2>
                <div className="flex items-center gap-1 text-sm font-bold text-gray-800 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{prof.rating}</span>
                  <span className="text-gray-400 font-normal">({prof.reviewsCount} avis)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tarif</span>
                <span className="font-extrabold text-gray-900 text-base">{prof.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Réponse</span>
                <span className="font-bold text-gray-800">{prof.responseTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Élèves</span>
                <span className="font-bold text-gray-800">{prof.studentsCount}</span>
              </div>
            </div>

            <button 
              onClick={() => document.getElementById('formulaire-contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl text-base transition shadow-md cursor-pointer"
            >
              Contacter
            </button>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center space-y-2">
              <span className="text-xs font-bold text-gray-700 block">
                {hasVoted ? "Merci pour votre avis !" : `Donner votre avis sur ${prof.name}`}
              </span>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    disabled={hasVoted}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => !hasVoted && setHoverRating(star)}
                    onMouseLeave={() => !hasVoted && setHoverRating(0)}
                    className={`transition-transform duration-150 ${hasVoted ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        (hoverRating || userRating) >= star 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              {hasVoted && (
                <p className="text-[11px] text-emerald-600 font-semibold">
                  Votre note de {userRating}/5 a bien été enregistrée.
                </p>
              )}
            </div>

          </div>
        </aside>

      </div>

      <section className="bg-gray-50/50 border-t border-gray-100 py-16 px-4 sm:px-8">
        <div id="formulaire-contact" className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-orange-200 shadow-xl space-y-6">
          
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2.5">
              <Send className="w-5 h-5 text-orange-600" />
              Contactez {prof.name} directement
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Service 100% gratuit pour les élèves. Envoie ton message et le professeur te recontactera directement.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-emerald-900">Message envoyé à {prof.name} !</h4>
              <p className="text-sm text-emerald-700 leading-relaxed max-w-md mx-auto">
                Le professeur examinera votre demande et vous recontactera directement sur votre numéro de téléphone.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-sm font-bold text-emerald-800 hover:underline pt-2 inline-block cursor-pointer"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitContact} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">Votre Nom & Prénom *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nom & Prénom" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-orange-50/30 border border-orange-100 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:border-orange-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5">Votre Adresse E-mail *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="email@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-orange-50/30 border border-orange-100 rounded-xl px-4 py-3 text-sm text-gray-800 focus:bg-white focus:border-orange-600 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Votre Numéro Téléphone (WhatsApp) *</label>
                <div className="flex gap-2">
                  <span className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 flex items-center shrink-0">
                    MA +212
                  </span>
                  <input 
                    type="tel" 
                    required
                    placeholder="06 12 34 56 78" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white border border-orange-500 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Votre Message au professeur *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder={`Bonjour ${prof.name}, j'aimerais en savoir plus sur vos disponibilités...`}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 focus:bg-white focus:border-orange-600 focus:outline-none transition"
                ></textarea>
              </div>

              <div className="bg-orange-50/60 p-4 rounded-xl flex items-center gap-3 text-xs text-orange-900 font-medium">
                <Lock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Vos coordonnées ne seront pas publiées publiquement. Seul le professeur pourra les consulter.</span>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-4 rounded-xl text-base transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'Envoi en cours...' : 'Contacter maintenant'}</span>
              </button>
            </form>
          )}

        </div>
      </section>

      <Footer 
        onNavigateHome={() => router.push('/')} 
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