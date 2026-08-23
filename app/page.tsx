'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { 
  Search, MapPin, BookOpen, CheckCircle2, Star, 
  Sparkles, Filter, ChevronRight, ShieldCheck, PhoneCall
} from 'lucide-react';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('recherche');

  // Filtres de recherche
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'deplacement' | 'domicile'>('all');

  // Liste de professeurs
  const professors = [
    {
      id: '1',
      name: "Meriem",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      city: "Casablanca, Maârif",
      level: "Soutien Scolaire Collège & Lycée",
      title: "Je suis une jeune étudiante motivée en Master Énergie à l'Université",
      price: "150 DH/h",
      rating: 4.9,
      reviewsCount: 18,
      firstLessonFree: true,
      description: "Pour nos cours nous allons voir le nécessaire pour réussir vos études bien sur d'une façon amusante..."
    },
    {
      id: '2',
      name: "Youssef",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      city: "Rabat, Agdal",
      level: "Mathématiques & Physique",
      title: "Ingénieur d'État expérimenté donne cours particuliers personnalisés",
      price: "200 DH/h",
      rating: 5.0,
      reviewsCount: 24,
      firstLessonFree: true,
      description: "Méthodologie axée sur la compréhension approfondie et la résolution intensive d'exercices d'examen."
    },
    {
      id: '3',
      name: "Fatima-Zohra",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      city: "Marrakech, Guéliz",
      level: "Français & Arabe",
      title: "Professeur certifiée avec 8 ans d'expérience en enseignement secondaire",
      price: "120 DH/h",
      rating: 4.8,
      reviewsCount: 12,
      firstLessonFree: false,
      description: "Accompagnement pédagogique sur mesure pour maîtriser les langues et réussir les épreuves orales et écrites."
    }
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <Navbar 
        isLoggedIn={false}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* --- HERO SECTION BLANCHE AVEC ACCENTS ORANGE (#FF5733 / #FF4500) --- */}
      <section className="bg-white border-b border-gray-100 py-12 lg:py-16 px-4 sm:px-8 relative overflow-hidden">
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Colonne Gauche : Titre + Barre de Recherche */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tag Badge Orange */}
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF5733] border border-orange-200/60 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5733]" />
              <span>Plateforme 100% Gratuite pour les Élèves & Parents</span>
            </div>

            {/* Main Title avec accent Orange */}
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              Trouvez le <span className="text-[#FF5733]">Professeur Particulier Idéal</span> au Maroc.
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Recherchez librement parmi des centaines de professeurs qualifiés. <strong className="text-gray-900">Aucun frais d'agence, aucun paiement requis de la part de l'élève</strong> : contactez directement votre professeur pour des cours à domicile ou en ligne.
            </p>

            {/* BARRE DE RECHERCHE PRINCIPALE (BORDURE ORANGE) */}
            <div className="bg-white p-2.5 rounded-2xl border-2 border-orange-100 shadow-xl flex flex-col sm:flex-row gap-2">
              
              {/* Input Matière */}
              <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3.5 py-3 rounded-xl border border-gray-100 focus-within:bg-white focus-within:border-orange-300 transition">
                <BookOpen className="w-4 h-4 text-[#FF5733] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Matière (ex: Maths, Physique...)" 
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none placeholder-gray-400 font-medium"
                />
              </div>

              {/* Input Ville */}
              <div className="flex-1 flex items-center gap-2 bg-gray-50 px-3.5 py-3 rounded-xl border border-gray-100 focus-within:bg-white focus-within:border-orange-300 transition">
                <MapPin className="w-4 h-4 text-[#FF5733] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Ville (ex: Casablanca, Rabat...)" 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none placeholder-gray-400 font-medium"
                />
              </div>

              {/* Bouton Orange */}
              <button className="bg-[#FF5733] hover:bg-[#e04824] text-white font-extrabold px-6 py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer">
                <Search className="w-4 h-4" />
                <span>Trouver un prof</span>
              </button>

            </div>

            {/* Badges de Réassurance */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-600 pt-1 font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                Profils Vérifiés
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#FF5733]" />
                0 DH de frais
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <PhoneCall className="w-4 h-4 text-[#FF5733]" />
                Contact Direct
              </span>
            </div>

          </div>

          {/* Colonne Droite : Image Hero */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 max-w-md w-full">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
                alt="Étudiants en cours particulier" 
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Floating Badge 1: Profs dispo */}
            <div className="absolute -top-3 -right-2 bg-white text-gray-800 px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-3 border border-orange-100">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />
                <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-[#FF5733]">+1 200 Profs</p>
                <p className="text-[9px] text-gray-500 font-medium">Disponibles</p>
              </div>
            </div>

            {/* Floating Badge 2: Premier cours offert */}
            <div className="absolute -bottom-3 -left-2 bg-white text-gray-800 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 border border-orange-100">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5733] flex items-center justify-center font-bold text-xs">
                🎁
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900">Premier cours offert</p>
                <p className="text-[10px] text-gray-500">Par la plupart des enseignants</p>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* --- SECTION CONTENU PRINCIPAL --- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FILTRES LATÉRAUX (GAUCHE) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-[#FF5733]" />
                Filtrer les professeurs
              </h3>
              <button 
                onClick={() => { setSelectedSubject(''); setSelectedCity(''); setSelectedLocation('all'); }}
                className="text-[11px] text-[#FF5733] hover:underline font-medium"
              >
                Réinitialiser
              </button>
            </div>

            {/* Filtre Matière */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Quelle matière ?</label>
              <input 
                type="text" 
                placeholder="Ex: Soutien scolaire, maths..." 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            {/* Filtre Ville */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Où (Ville ou Code Postal) ?</label>
              <input 
                type="text" 
                placeholder="Ex: Casablanca, 20250..." 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            {/* Lieu du cours */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700">Lieu du cours</label>
              <div className="space-y-2 text-xs text-gray-600">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedLocation === 'deplacement'}
                    onChange={() => setSelectedLocation(selectedLocation === 'deplacement' ? 'all' : 'deplacement')}
                    className="rounded border-gray-300 text-[#FF5733] focus:ring-[#FF5733]" 
                  />
                  <span>Je me déplace chez le professeur</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedLocation === 'domicile'}
                    onChange={() => setSelectedLocation(selectedLocation === 'domicile' ? 'all' : 'domicile')}
                    className="rounded border-gray-300 text-[#FF5733] focus:ring-[#FF5733]" 
                  />
                  <span>À mon domicile</span>
                </label>
              </div>
            </div>

            {/* Bouton Sauvegarder recherche */}
            <button className="w-full border border-[#FF5733] text-[#FF5733] hover:bg-orange-50 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              Sauvegarder cette recherche
            </button>

          </div>
        </aside>

        {/* LISTE DES PROFESSEURS (DROITE) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <h2 className="text-lg font-black text-gray-900">
              Professeurs disponibles au Maroc
            </h2>
            <span>Affichage de {professors.length} professeurs</span>
          </div>

          {/* LISTE CARDS */}
          <div className="space-y-4">
            {professors.map((prof) => (
              <div 
                key={prof.id} 
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                
                <div className="flex gap-4 items-start sm:items-center">
                  <img 
                    src={prof.avatar} 
                    alt={prof.name} 
                    className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-orange-100"
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{prof.name}</h3>
                      <span className="text-[10px] bg-orange-50 text-[#FF5733] font-bold px-2 py-0.5 rounded-full border border-orange-100">Vérifié</span>
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF5733]" />
                      {prof.city}
                    </p>

                    <p className="text-xs text-[#FF5733] font-semibold">
                      📚 {prof.level}
                    </p>

                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-md">
                      {prof.title}
                    </p>
                  </div>
                </div>

                {/* Bloc Prix & Bouton */}
                <div className="w-full sm:w-auto flex sm:flex-col justify-between items-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0">
                  
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-gray-900">{prof.price}</span>
                    {prof.firstLessonFree && (
                      <p className="text-[10px] font-bold text-[#FF5733]">Premier cours offert</p>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 sm:justify-end mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-gray-800">{prof.rating}</span>
                      <span>({prof.reviewsCount} avis)</span>
                    </div>
                  </div>

                  <Link 
                    href={`/professeurs/${prof.id}`}
                    className="bg-[#FF5733] hover:bg-[#e04824] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-sm"
                  >
                    Voir le profil
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                </div>

              </div>
            ))}
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <Footer 
        onNavigateHome={() => {}} 
        onOpenHelp={() => setIsHelpOpen(true)} 
      />

      {/* MODAL AIDE */}
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        helpSection={helpSection} 
        setHelpSection={setHelpSection} 
      />

    </main>
  );
}