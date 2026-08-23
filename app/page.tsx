'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import StickyHeader from './components/StickyHeader';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { 
  Search, MapPin, Star, CheckCircle, BookOpen, Bookmark, 
  ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Zap, Award
} from 'lucide-react';

const MOCK_PROFS = [
  {
    id: 1,
    name: "Meriem",
    city: "Casablanca, Maârif",
    subject: "Soutien Scolaire Collège & Lycée",
    price: "150 DH",
    rating: 4.9,
    reviews: 18,
    isPremium: false,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    title: "Je suis une jeune étudiante motivée en Master Énergie à l'Université",
    bio: "Pour nos cours nous allons voir le nécessaire pour réussir vos études bien sur d'une façon amusante..."
  },
  {
    id: 2,
    name: "Youssef",
    city: "Rabat, Agdal",
    subject: "Mathématiques & Physique",
    price: "120 DH",
    rating: 5.0,
    reviews: 12,
    isPremium: false,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    title: "Ingénieur d'État donne cours de soutien en Maths et Physique",
    bio: "Excellente pédagogie axée sur la résolution des examens nationaux et concours..."
  },
  {
    id: 3,
    name: "Murielle",
    city: "Marrakech (En ligne)",
    subject: "Soutien Scolaire Primaire",
    price: "200 DH",
    rating: 5.0,
    reviews: 3,
    isPremium: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    title: "Aide aux devoirs et boost pédagogique pour préparer vos enfants",
    bio: "Diplômée BAC + 5 dans les domaines scientifiques. Passionnée par le partage de connaissances..."
  }
];

export default function Home() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('acceptee');

  const handleLogout = () => {
    localStorage.removeItem('user_email');
    router.replace('/connexion');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(`/professeurs?subject=${encodeURIComponent(subject)}&location=${encodeURIComponent(location)}`);
  };

  const handleSelectCity = (city: string) => {
    setLocation(city);
    router.push(`/professeurs?location=${encodeURIComponent(city)}`);
  };

  const handleSelectSubject = (subj: string) => {
    setSubject(subj);
    router.push(`/professeurs?subject=${encodeURIComponent(subj)}`);
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans flex flex-col justify-between overflow-x-hidden relative">
      <StickyHeader 
        isScrolled={isScrolled}
        searchTerm={subject}
        setSearchTerm={setSubject}
        locationTerm={location}
        setLocationTerm={setLocation}
        onSearch={handleSearch}
        onLogoutClick={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Navbar 
        isLoggedIn={true}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
        onSelectCity={handleSelectCity}
        onSelectSubject={handleSelectSubject}
      />

      {/* --- HERO SECTION : PRESENTATION ET VALEUR DU SITE --- */}
      <section className="bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        
        {/* Éléments de fond décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Texte & Titre */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-200 shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Plateforme 100% Gratuite pour les Élèves & Parents</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              Trouvez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-amber-300">Professeur Particulier Ideal</span> au Maroc.
            </h1>

            <p className="text-sm sm:text-base text-blue-100/80 max-w-2xl leading-relaxed font-normal">
              Recherchez librement parmi des centaines de professeurs qualifiés. **Aucun frais d’agence, aucun paiement requis de la part de l’élève** : contactez directement votre professeur pour des cours à domicile ou en ligne.
            </p>

            {/* Barre de Recherche Intégrée au Hero */}
            <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl">
              <div className="flex-1 bg-white rounded-xl px-3 py-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Matière (ex: Maths, Physique...)" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex-1 bg-white rounded-xl px-3 py-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Ville (ex: Casablanca, Rabat...)" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Trouver un prof</span>
              </button>
            </form>

            {/* Badges Avantages Élèves */}
            <div className="pt-2 grid grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-blue-100">Profils Vérifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-blue-100">0 DH de frais</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs font-medium text-blue-100">Contact Direct</span>
              </div>
            </div>

          </div>

          {/* Visuel & Carte Image Interactive */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Image d'illustration principale */}
              <div className="rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                  alt="Étudiants Maroc" 
                  className="w-full h-72 sm:h-80 object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              </div>

              {/* Badge Flottant Interactif 1 */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 text-gray-800 text-left">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Premier cours offert</p>
                  <p className="text-[10px] text-gray-500">Par la plupart des enseignants</p>
                </div>
              </div>

              {/* Badge Flottant Interactif 2 */}
              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2 text-left">
                <div className="flex -space-x-2">
                  <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" alt="Prof" />
                  <img className="w-7 h-7 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Prof" />
                </div>
                <div className="text-[11px] font-bold text-gray-800">
                  +1 200 Profs <span className="block text-[9px] text-emerald-600 font-semibold">Disponibles</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* --- LISTE DES PROFESSEURS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex flex-col md:flex-row gap-6">
        
        {/* FILTRES ÉLÈVE (GAUCHE) */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <button className="w-full border border-blue-600 text-blue-600 bg-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-blue-50 transition cursor-pointer">
            <Bookmark className="w-4 h-4" />
            <span>Sauvegarder recherche</span>
          </button>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Quelle matière ?</label>
              <input 
                type="text"
                placeholder="Ex: Soutien scolaire, maths..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-blue-600 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Où (Ville ou Code Postal) ?</label>
              <input 
                type="text"
                placeholder="Ex: Casablanca, 20250..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Lieu du cours</label>
              <div className="space-y-1.5 text-xs text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  <span>je me déplace</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  <span>à mon domicile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                  <span>cours en ligne</span>
                </label>
              </div>
            </div>

            <button 
              onClick={() => handleSearch()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filtrer les profs</span>
            </button>
          </div>
        </aside>

        {/* LISTE DES PROFESSEURS */}
        <section className="flex-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 text-left">Professeurs disponibles au Maroc</h2>
            <span className="text-xs text-gray-500 font-medium">Affichage de {MOCK_PROFS.length} professeurs</span>
          </div>

          {MOCK_PROFS.map((prof) => (
            <div 
              key={prof.id} 
              onClick={() => router.push(`/professeurs/${prof.id}`)}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer relative flex flex-col sm:flex-row items-start gap-5 overflow-hidden text-left"
            >
              {prof.isPremium && (
                <div className="absolute top-0 left-0 bg-blue-500 text-white text-[11px] font-bold px-8 py-0.5 rounded-br-lg shadow-sm">
                  Premium
                </div>
              )}

              <div className={`shrink-0 mx-auto sm:mx-0 ${prof.isPremium ? 'mt-4 sm:mt-2' : ''}`}>
                <img 
                  src={prof.avatar} 
                  alt={prof.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-gray-100 shadow-inner"
                />
              </div>

              <div className={`flex-1 space-y-1.5 w-full ${prof.isPremium ? 'mt-2 sm:mt-0' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                      {prof.name}
                      {prof.isPremium && <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {prof.city}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>{prof.subject}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg font-extrabold text-gray-900 block">{prof.price}<span className="text-xs font-normal text-gray-500">/h</span></span>
                    <span className="text-[11px] font-bold text-blue-600">Premier cours offert</span>
                    
                    {prof.rating > 0 && (
                      <div className="flex items-center justify-end gap-1 text-xs text-amber-500 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-gray-800">{prof.rating}</span>
                        <span className="text-gray-400">({prof.reviews} avis)</span>
                      </div>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-blue-900 line-clamp-1 pt-1">
                  {prof.title}
                </h4>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {prof.bio}
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>

      <Footer 
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
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