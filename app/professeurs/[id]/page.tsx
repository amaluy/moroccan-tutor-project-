'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HelpModal from '../../components/HelpModal';
import { 
  MapPin, Clock, CheckCircle2, Send, Lock, Calendar, Share2
} from 'lucide-react';

export default function ProfessorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('acceptee');

  // Formulaire de l'élève
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Données du professeur
  const prof = {
    id: params.id,
    name: "Meriem",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    title: "Je suis une jeune étudiante motivée en Master Énergie à l'université de lorraine",
    price: "15€/h",
    isVerified: true,
    experience: "3 ans d'expérience en tant que professeur",
    subjects: ["Cours particuliers de Soutien Scolaire Collège"],
    cities: [
      "Vandœuvre-lès-Nancy", "Heillecourt", "Houdemont", 
      "Jarville-la-Malgrange", "Laxou", "Nancy", "Tomblaine", "Villers-lès-Nancy"
    ],
    pricingDetails: [
      { label: "Premier cours offert", value: "Gratuit" },
      { label: "Tarif horaire", value: "15€/h" },
      { label: "Supplément de déplacement", value: "5 €" }
    ],
    levels: ["Primaire", "Adolescents"],
    description: "Pour notre Cours nous allons voir le nécessaire pour réussir vos études bien sur d'une façon amusante pour ne pas s'ennuyer et approfondir vos connaissances et les améliorer",
    availability: {
      days: ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"],
      matin:      [false, false, false, false, false, true, true],
      midi:       [false, false, false, false, false, true, true],
      apresMidi:  [true,  true,  true,  true,  true,  true, true]
    }
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      <Navbar 
        isLoggedIn={true}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => router.replace('/connexion')}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* --- EN-TÊTE DU PROFIL (STYLE CV ÉPURÉ) --- */}
      <section className="bg-white border-b border-gray-100 py-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <img 
              src={prof.avatar} 
              alt={prof.name} 
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover shadow-sm border border-gray-100 shrink-0"
            />
            
            <div className="space-y-2 pt-1">
              <div className="flex items-baseline justify-center sm:justify-start gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">{prof.name}</h1>
                <Link href="#" className="text-xs text-blue-600 hover:underline font-medium">Voir le profil ↗</Link>
              </div>

              <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1 flex-wrap max-w-2xl">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {prof.cities.join(', ')}
              </p>

              <p className="text-xs text-gray-600 font-medium">
                📚 {prof.subjects[0]}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-600 pt-1 flex-wrap">
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Données vérifiées
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {prof.experience}
                </span>
              </div>
            </div>
          </div>

          {/* Bloc Tarif Haut Droite */}
          <div className="text-center shrink-0 w-full md:w-auto min-w-[200px] space-y-2">
            <div className="text-2xl font-black text-blue-950">{prof.price}</div>
            
            <button 
              onClick={() => document.getElementById('formulaire-contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3 px-8 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              Contacter
            </button>

            <div className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">
              <span>Premier cours offert</span>
              <span className="text-gray-400">→</span>
            </div>
          </div>

        </div>
      </section>

      {/* Breadcrumb style minimaliste */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 w-full text-[11px] text-gray-500 flex items-center gap-1 flex-wrap">
        <Link href="#" className="hover:underline">Vos cours</Link>
        <span>›</span>
        <Link href="#" className="hover:underline">Soutien Scolaire Collège</Link>
        <span>›</span>
        <Link href="#" className="hover:underline">Vandœuvre-lès-Nancy</Link>
        <span>›</span>
        <span className="text-gray-400 truncate max-w-xs">{prof.title}</span>
      </div>

      {/* --- CORPS STYLE JOURNAL / AÉRÉ --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        
        {/* COLONNE GAUCHE (INFOS CV ÉPURÉES) */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Section Prix */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">€</span>
              Prix
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600 pl-7">
              {prof.pricingDetails.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-bold text-gray-800 text-xs mb-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Villes */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Villes où se déroulent les cours
            </h3>
            <ul className="space-y-1 text-xs text-gray-600 pl-7">
              {prof.cities.map((city, idx) => (
                <li key={idx} className="hover:text-blue-600 transition cursor-default">
                  {city}
                </li>
              ))}
            </ul>
          </div>

          {/* Section Niveaux */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="text-blue-600 font-bold">⫸</span>
              Niveaux des cours
            </h3>
            <ul className="space-y-1 text-xs text-gray-600 pl-7">
              {prof.levels.map((lvl, idx) => (
                <li key={idx}>{lvl}</li>
              ))}
            </ul>
          </div>

          {/* --- SECTION DISPONIBILITÉ --- */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900">
              Disponibilité
            </h3>

            <div className="w-full text-xs max-w-[280px]">
              {/* En-tête Jours */}
              <div className="grid grid-cols-8 gap-1 pb-2 border-b border-gray-200 text-center font-bold text-gray-700">
                <span></span>
                {prof.availability.days.map((day, i) => (
                  <span key={i}>{day}</span>
                ))}
              </div>

              {/* Ligne Matin */}
              <div className="grid grid-cols-8 gap-1 py-2 border-b border-gray-100 items-center">
                <span className="font-medium text-gray-600 text-[11px]">Matin</span>
                {prof.availability.matin.map((available, i) => (
                  <div key={i} className="flex justify-center">
                    {available && <span className="w-3.5 h-3.5 rounded-full bg-blue-200" />}
                  </div>
                ))}
              </div>

              {/* Ligne Midi */}
              <div className="grid grid-cols-8 gap-1 py-2 border-b border-gray-100 items-center">
                <span className="font-medium text-gray-600 text-[11px]">Midi</span>
                {prof.availability.midi.map((available, i) => (
                  <div key={i} className="flex justify-center">
                    {available && <span className="w-3.5 h-3.5 rounded-full bg-blue-200" />}
                  </div>
                ))}
              </div>

              {/* Ligne Après-midi */}
              <div className="grid grid-cols-8 gap-1 py-2 items-center">
                <span className="font-medium text-gray-600 text-[11px]">Après-midi</span>
                {prof.availability.apresMidi.map((available, i) => (
                  <div key={i} className="flex justify-center">
                    {available && <span className="w-3.5 h-3.5 rounded-full bg-blue-200" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partage */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h3 className="text-xs font-bold text-gray-800">Partagez ce professeur</h3>
            <div className="flex gap-3 text-gray-400">
              <button className="hover:text-blue-600 transition text-xs flex items-center gap-1 font-medium">
                <Share2 className="w-3.5 h-3.5" /> Partager
              </button>
            </div>
          </div>

        </aside>

        {/* COLONNE DROITE (GRAND TITRE + JOURNAL + FORMULAIRE) */}
        <section className="lg:col-span-8 space-y-10">
          
          {/* Grand Titre Style Journal */}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-900 leading-tight">
              {prof.title}
            </h2>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Description des cours</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {prof.description}
              </p>
            </div>
          </div>

          {/* Bloc Reconnaissances */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Reconnaissances</h3>
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img src={prof.avatar} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-gray-900">Tu veux en savoir plus sur {prof.name} ?</p>
                  <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Données vérifiées
                  </p>
                </div>
              </div>
              <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-5 py-2 rounded-xl text-xs transition">
                Voir le profil ↗
              </button>
            </div>
          </div>

          {/* Localisation approximative */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Localisation approximative des cours de {prof.name}</h3>
            <p className="text-xs text-gray-500">Villes où les cours peuvent se dérouler</p>
            <div className="flex flex-wrap gap-2">
              {prof.cities.map((city, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-md font-medium">
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* --- GRAND FORMULAIRE DE CONTACT (STYLE IMAGE 1) --- */}
          <div id="formulaire-contact" className="bg-white p-6 sm:p-10 rounded-3xl border border-blue-200 shadow-xl space-y-6">
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Contactez {prof.name} directement
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Service 100% gratuit pour les élèves. Envoie ton message et le professeur te recontactera directement sur ton numéro.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">Message envoyé à {prof.name} !</h4>
                <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
                  Le professeur examinera votre demande et vous recontactera directement sur votre numéro de téléphone/WhatsApp.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Nom & Prénom *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="amal" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Adresse E-mail *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="berrada0amal@gmail.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Numéro Téléphone (WhatsApp) *</label>
                  <div className="flex gap-2">
                    <span className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-600 flex items-center shrink-0">
                      MA +212
                    </span>
                    <input 
                      type="tel" 
                      required
                      placeholder="06 12 34 56 78" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-blue-500 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Message au professeur *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder={`Bonjour ${prof.name}, j'aimerais en savoir plus sur vos disponibilités et vos tarifs pour un élève en classe de Lycée. Merci d'avance.`}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-4 text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                  ></textarea>
                </div>

                <div className="bg-blue-50/60 p-3.5 rounded-xl flex items-center gap-2.5 text-[11px] text-blue-900">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Vos coordonnées ne seront pas publiées publiquement. Seul le professeur pourra les consulter.</span>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-4 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Envoi en cours...' : 'Contacter maintenant'}</span>
                </button>
              </form>
            )}

          </div>

          <div className="text-center">
            <button className="text-xs text-gray-400 hover:underline">
              Des problèmes avec ce profil ? Signalez-le
            </button>
          </div>

        </section>

      </div>

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