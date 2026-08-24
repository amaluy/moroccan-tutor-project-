'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { 
  Search, MapPin, BookOpen, CheckCircle2, Star, 
  Sparkles, Filter, ChevronRight, ShieldCheck, PhoneCall,
  GraduationCap, DollarSign, Laptop, Home
} from 'lucide-react';

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('recherche');

  // Filtres de recherche uniques
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [locationType, setLocationType] = useState('');

  // Options prédéfinies pour les filtres
  const subjects = [
    "Maths", 
    "Physique", 
    "Physique et Chimie", 
    "Arabe", 
    "Anglais", 
    "Français", 
    "Coach sportif", 
    "SVT", 
    "Étude supérieur"
  ];

  const levels = [
    "Primaire", 
    "Collège", 
    "Secondaire", 
    "Niveau Supérieur"
  ];

  // Liste de professeurs
  const professors = [
    {
      id: '1',
      name: "Meriem",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      city: "Casablanca, Maârif",
      level: "Collège & Secondaire",
      subject: "Physique et Chimie",
      title: "Je suis une jeune étudiante motivée en Master Énergie à l'Université",
      price: "150 DH/h",
      rating: 4.9,
      reviewsCount: 18,
      firstLessonFree: true,
      mode: "À domicile & En ligne"
    },
    {
      id: '2',
      name: "Youssef",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      city: "Rabat, Agdal",
      level: "Niveau Supérieur",
      subject: "Maths",
      title: "Ingénieur d'État expérimenté donne cours particuliers personnalisés",
      price: "200 DH/h",
      rating: 5.0,
      reviewsCount: 24,
      firstLessonFree: true,
      mode: "À domicile"
    },
    {
      id: '3',
      name: "Fatima-Zohra",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
      city: "Marrakech, Guéliz",
      level: "Secondaire",
      subject: "Français",
      title: "Professeur certifiée avec 8 ans d'expérience en enseignement secondaire",
      price: "120 DH/h",
      rating: 4.8,
      reviewsCount: 12,
      firstLessonFree: false,
      mode: "En ligne"
    }
  ];

  const handleReset = () => {
    setSelectedSubject('');
    setSelectedCity('');
    setSelectedLevel('');
    setPriceRange('');
    setLocationType('');
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <Navbar 
        isLoggedIn={false}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* --- HERO SECTION BLANCHE (SANS DEUXIÈME BARRE DE RECHERCHE) --- */}
      <section className="bg-white border-b border-gray-100 py-12 lg:py-16 px-4 sm:px-8 relative overflow-hidden">
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Colonne Gauche : Titre & Badges uniquement */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tag Badge Orange */}
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF5733] border border-orange-200/60 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5733]" />
              <span>Plateforme 100% Gratuite pour les Élèves & Parents</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              Trouvez le <span className="text-[#FF5733]">Professeur Particulier Idéal</span> au Maroc.
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Recherchez librement parmi des centaines de professeurs qualifiés. <strong className="text-gray-900">Aucun frais d'agence, aucun paiement requis de la part de l'élève</strong> : contactez directement votre professeur pour des cours à domicile ou en ligne.
            </p>

            {/* Badges de Réassurance */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-600 pt-2 font-semibold">
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

            {/* Floating Badge 1 */}
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

            {/* Floating Badge 2 */}
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

      {/* --- SECTION PRINCIPALE AVEC L'UNIQUE FILTRE VERTICAL ET LES RÉSULTATS --- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LE SEUL ET UNIQUE FILTRE VERTICAL (GAUCHE) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5 sticky top-6">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-[#FF5733]" />
                Filtrer les professeurs
              </h3>
              <button 
                onClick={handleReset}
                className="text-[11px] text-[#FF5733] hover:underline font-medium cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>

            {/* 1. Matière */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#FF5733]" />
                Matière
              </label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-[#FF5733] focus:outline-none transition cursor-pointer"
              >
                <option value="">Toutes les matières</option>
                {subjects.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* 2. Ville */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5733]" />
                Ville
              </label>
              <input 
                type="text" 
                placeholder="Ex: Casablanca, Rabat, Marrakech..." 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            {/* 3. Niveau d'études */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#FF5733]" />
                Niveau d'études
              </label>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-[#FF5733] focus:outline-none transition cursor-pointer"
              >
                <option value="">Tous les niveaux</option>
                {levels.map((lvl, idx) => (
                  <option key={idx} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* 4. Tarif horaire */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#FF5733]" />
                Tarif horaire (DH/h)
              </label>
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-[#FF5733] focus:outline-none transition cursor-pointer"
              >
                <option value="">Tous les tarifs</option>
                <option value="0-100">Moins de 100 DH/h</option>
                <option value="100-150">100 DH - 150 DH/h</option>
                <option value="150-200">150 DH - 200 DH/h</option>
                <option value="200+">Plus de 200 DH/h</option>
              </select>
            </div>

            {/* 5. Lieu du cours */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Lieu du cours</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType(locationType === 'domicile' ? '' : 'domicile')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    locationType === 'domicile'
                      ? 'bg-orange-50 border-[#FF5733] text-[#FF5733]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4 mb-1" />
                  À domicile
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType(locationType === 'en_ligne' ? '' : 'en_ligne')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    locationType === 'en_ligne'
                      ? 'bg-orange-50 border-[#FF5733] text-[#FF5733]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Laptop className="w-4 h-4 mb-1" />
                  En ligne
                </button>
              </div>
            </div>

            {/* Bouton Appliquer */}
            <button className="w-full bg-[#FF5733] hover:bg-[#e04824] text-white font-extrabold py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer pt-2">
              <Search className="w-4 h-4" />
              Appliquer les filtres
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

          {/* CARTE PROFESSEUR */}
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

                    <div className="flex flex-wrap gap-1.5 items-center text-[11px]">
                      <span className="bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-md">
                        {prof.subject}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-[#FF5733] font-semibold">
                        {prof.level}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-md">
                      {prof.title}
                    </p>
                  </div>
                </div>

                {/* Bloc Prix & Bouton Action */}
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