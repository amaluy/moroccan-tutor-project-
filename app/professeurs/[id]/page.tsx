'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HelpModal from '../../components/HelpModal';
import { 
  MapPin, BookOpen, Clock, ShieldCheck, CheckCircle2, 
  Send, Sparkles, AlertCircle, Share2, Phone, Lock
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

  // Données de démonstration du professeur
  const prof = {
    id: params.id,
    name: "Meriem",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    title: "Je suis une jeune étudiante motivée en Master Énergie à l'Université",
    price: "150 DH",
    rating: 4.9,
    reviewsCount: 18,
    isVerified: true,
    experience: "3 ans d'expérience en tant que professeur",
    subjects: ["Soutien Scolaire Collège", "Soutien Scolaire Lycée", "Physique-Chimie"],
    cities: ["Casablanca", "Maârif", "Anfa", "Gauthier", "En ligne"],
    pricingDetails: [
      { label: "Premier cours offert", value: "Gratuit (30 min)" },
      { label: "Tarif horaire", value: "150 DH / h" },
      { label: "Supplément déplacement", value: "20 DH" }
    ],
    levels: ["Primaire", "Collège", "Lycée"],
    description: "Pour nos cours nous allons voir le nécessaire pour réussir vos études bien sur d'une façon amusante pour ne pas s'ennuyer et approfondir vos connaissances et les améliorer. Ma méthode repose sur la révision des concepts clés et l'entraînement intensif sur des exercices types et examens originaux."
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ICI : Vous enregistrez le message en base de données avec le statut "LOCKED" (déblocable par le prof avec ses crédits)
    console.log("Lead généré pour le prof :", { profId: prof.id, ...formData });

    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans flex flex-col justify-between">
      
      <Navbar 
        isLoggedIn={true}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => router.replace('/connexion')}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* --- EN-TÊTE DU PROFIL --- */}
      <section className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Avatar + Infos principales */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img 
              src={prof.avatar} 
              alt={prof.name} 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-50 shadow-md"
            />
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-gray-900">{prof.name}</h1>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  Profil vérifié
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {prof.cities.slice(0, 3).join(', ')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  {prof.subjects[0]}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-gray-600 pt-1">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  {prof.isVerified ? "Données vérifiées" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {prof.experience}
                </span>
              </div>
            </div>
          </div>

          {/* Tarif + Bouton Action rapide */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center shrink-0 w-full md:w-auto min-w-[220px]">
            <div className="text-2xl font-black text-gray-900 mb-1">
              {prof.price} <span className="text-xs font-normal text-gray-500">/h</span>
            </div>
            
            <button 
              onClick={() => {
                document.getElementById('formulaire-contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition shadow-md cursor-pointer"
            >
              Contacter le prof
            </button>

            <span className="inline-block mt-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              1er cours offert
            </span>
          </div>

        </div>
      </section>

      {/* --- CORPS DE LA PAGE --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* COLONNE GAUCHE (DÉTAILS & INFORMATIONS) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Bloc Prix */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span>💰</span> Prix & Offres
            </h3>
            <div className="space-y-2 text-xs divide-y divide-gray-100">
              {prof.pricingDetails.map((item, idx) => (
                <div key={idx} className="pt-2 flex justify-between text-gray-600">
                  <span className="font-medium">{item.label}</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bloc Villes */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Villes où se déroulent les cours
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {prof.cities.map((city, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Bloc Niveaux */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Niveaux enseignés
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {prof.levels.map((lvl, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-lg">
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          {/* Partager */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-600 mb-2 flex items-center justify-center gap-1">
              <Share2 className="w-3.5 h-3.5" />
              Partagez ce professeur
            </p>
            <div className="flex justify-center gap-2">
              <button className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition text-xs font-bold">
                WhatsApp
              </button>
              <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition text-xs font-bold">
                Facebook
              </button>
            </div>
          </div>

        </aside>

        {/* COLONNE DROITE (DESCRIPTION & FORMULAIRE DE CONTACT) */}
        <section className="lg:col-span-8 space-y-8">
          
          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-blue-900 leading-snug">
              {prof.title}
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Description des cours</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {prof.description}
              </p>
            </div>
          </div>

          {/* --- FORMULAIRE DE CONTACT ÉLÈVE (LEAD SYSTEM) --- */}
          <div id="formulaire-contact" className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-blue-600/30 shadow-xl space-y-6 relative overflow-hidden">
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Contactez {prof.name} directement
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Service 100% gratuit pour les élèves. Envoie ton message et le professeur te recontactera directement sur ton numéro.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">Message transmis avec succès !</h4>
                <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
                  Votre demande a bien été envoyée à <strong>{prof.name}</strong>. Il/Elle examinera votre message et vous rappellera dans les plus brefs délais au numéro fourni.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block"
                >
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Votre Nom & Prénom *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Amine Bennani" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Votre Adresse E-mail *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Ex: amine@gmail.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Votre Numéro Téléphone (WhatsApp) *</label>
                  <div className="flex gap-2">
                    <span className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-600 flex items-center shrink-0">
                      🇲🇦 +212
                    </span>
                    <input 
                      type="tel" 
                      required
                      placeholder="06 12 34 56 78" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Votre Message au professeur *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder={`Bonjour ${prof.name}, j'aimerais en savoir plus sur vos disponibilités et vos tarifs pour un élève en classe de Lycée. Merci d'avance.`}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                  ></textarea>
                </div>

                <div className="bg-blue-50/60 p-3 rounded-xl flex items-start gap-2 text-[11px] text-blue-800">
                  <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Vos coordonnées ne seront pas publiées publiquement. Seul le professeur pourra les consulter.
                  </span>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Contacter maintenant</span>
                </button>
              </form>
            )}

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