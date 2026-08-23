'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import StickyHeader from './components/StickyHeader';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { 
  Search, MapPin, Star, CheckCircle, BookOpen, Bookmark, 
  ArrowRight
} from 'lucide-react';

const MOCK_PROFS = [
  {
    id: 1,
    name: "Meriem",
    city: "Casablanca, Maârif (20250)",
    subject: "Soutien Scolaire Collège & Lycée",
    price: "150 DH",
    rating: 4.9,
    reviews: 18,
    isPremium: false,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    title: "Je suis une jeune étudiante motivée en Master Énergie à l'Université",
    bio: "Pour nos cours nous allons voir le nécessaire pour réussir vos études bien sur d'une façon amusante pour ne pas s'ennuyer et approfondir vos connaissances..."
  },
  {
    id: 2,
    name: "Youssef",
    city: "Rabat, Agdal (10090)",
    subject: "Mathématiques & Physique",
    price: "120 DH",
    rating: 5.0,
    reviews: 12,
    isPremium: false,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    title: "Ingénieur d'État donne cours de soutien en Maths et Physique",
    bio: "Excellente pédagogie axée sur la résolution des examens nationaux et concours. Préparation au Bac avec suivi personnalisé..."
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
    bio: "Diplômée BAC + 5 dans les domaines scientifiques. Passionnée par le partage de connaissances et la pédagogie adaptée à chaque enfant..."
  }
];

const VILLES_COL_1 = [
  "Agadir", "Beni Mellal", "Casablanca", "El Jadida", 
  "Fès", "Kénitra", "Khouribga", "Marrakech", 
  "Meknès", "Mohammedia", "Nador", "Oujda"
];

const VILLES_COL_2 = [
  "Rabat", "Safi", "Salé", "Settat", 
  "Tanger", "Taza", "Témara", "Tétouan", 
  "En ligne", "Aïn Sebaâ", "Maârif", "Agdal"
];

const MATIERES_COL_1 = [
  "Maths", "Physique", "Chimie", "SVT / Biologie", 
  "Français", "Anglais", "Arabe", "Espagnol", 
  "Allemand", "Philosophie", "Histoire-Géo", "Soutien scolaire"
];

const MATIERES_COL_2 = [
  "Économie", "Comptabilité", "Informatique", "Programmation", 
  "Statistiques", "Algèbre", "Analyse", "Prépa Concours", 
  "Aide aux devoirs", "Droit", "Gestion", "Marketing"
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

  const handleProfClick = (profId: number) => {
    router.push(`/professeurs/${profId}`);
  };

  const handleGoToProfMarketing = () => {
    router.push('/donner-des-cours');
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
      />

      {/* EN-TÊTE PRINCIPALE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
            Cours de soutien scolaire au Maroc
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Trouvez les meilleurs professeurs particuliers certifiés à domicile ou en ligne.
          </p>
        </div>

        <button 
          onClick={handleGoToProfMarketing}
          className="border-2 border-[#1E40AF] text-[#1E40AF] hover:bg-[#1E40AF] hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Donner des cours particuliers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* --- SECTION HAUTE : RÉPERTOIRE (PLONGÉE DIRECTE POUR LE CLIENT) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 mb-8 w-full text-left">
        
        {/* CARTE D'EN-TÊTE DUO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Bloc Gauche : Soutien scolaire à... */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Soutien scolaire à...
            </h2>
          </div>

          {/* Bloc Droite : Cours de... avec illustration */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between relative overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Cours de...
            </h2>
            
            <div className="w-14 h-12 relative flex items-center justify-center">
              <svg viewBox="0 0 100 80" className="w-full h-full text-blue-500">
                <path d="M20,30 L50,15 L50,65 L20,50 Z" fill="#3B82F6" />
                <rect x="10" y="30" width="10" height="20" rx="2" fill="#60A5FA" />
                <path d="M50,25 C65,20 75,10 80,10 L85,20 C75,30 65,35 50,35 Z" fill="#93C5FD" />
                <circle cx="25" cy="15" r="4" fill="#F59E0B" />
                <circle cx="75" cy="60" r="3" fill="#10B981" />
                <circle cx="85" cy="45" r="2" fill="#EF4444" />
              </svg>
            </div>
          </div>

        </div>

        {/* LISTES DE LIENS VILLES ET MATIÈRES (CLIQUABLES POUR REMPLIR LE FILTRE DIRECTEMENT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
          
          {/* LIENS VILLES (2 COLONNES) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="space-y-2">
              {VILLES_COL_1.map((ville, i) => (
                <button
                  key={i}
                  onClick={() => { setLocation(ville); handleSearch(); }}
                  className="block text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline transition text-left"
                >
                  {ville}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {VILLES_COL_2.map((ville, i) => (
                <button
                  key={i}
                  onClick={() => { setLocation(ville); handleSearch(); }}
                  className="block text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline transition text-left"
                >
                  {ville}
                </button>
              ))}
            </div>
          </div>

          {/* LIENS MATIÈRES (2 COLONNES) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="space-y-2">
              {MATIERES_COL_1.map((mat, i) => (
                <button
                  key={i}
                  onClick={() => { setSubject(mat); handleSearch(); }}
                  className="block text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline transition text-left"
                >
                  {mat}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {MATIERES_COL_2.map((mat, i) => (
                <button
                  key={i}
                  onClick={() => { setSubject(mat); handleSearch(); }}
                  className="block text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline transition text-left"
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* CONTENU : FILTRES + LISTE DES PROFS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col md:flex-row gap-6">
        
        {/* FILTRES ÉLÈVE (GAUCHE) */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <button className="w-full border border-[#1E40AF] text-[#1E40AF] bg-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-blue-50 transition">
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
                className="w-full bg-white border border-[#1E40AF] rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Où (Ville ou Code Postal) ?</label>
              <input 
                type="text"
                placeholder="Ex: Casablanca, 20250..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#1E40AF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Lieu du cours</label>
              <div className="space-y-1.5 text-xs text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#1E40AF]" defaultChecked />
                  <span>je me déplace</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#1E40AF]" defaultChecked />
                  <span>à mon domicile</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#1E40AF]" defaultChecked />
                  <span>cours en ligne</span>
                </label>
              </div>
            </div>

            <button 
              onClick={() => handleSearch()}
              className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filtrer</span>
            </button>
          </div>
        </aside>

        {/* LISTE DES PROFESSEURS */}
        <section className="flex-1 space-y-4">
          {MOCK_PROFS.map((prof) => (
            <div 
              key={prof.id} 
              onClick={() => handleProfClick(prof.id)}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer relative flex flex-col sm:flex-row items-start gap-5 overflow-hidden text-left"
            >
              {prof.isPremium && (
                <div className="absolute top-0 left-0 bg-[#3B82F6] text-white text-[11px] font-bold px-8 py-0.5 rounded-br-lg shadow-sm">
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
                    <span className="text-[11px] font-bold text-[#1E40AF]">Premier cours offert</span>
                    
                    {prof.rating > 0 && (
                      <div className="flex items-center justify-end gap-1 text-xs text-amber-500 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-gray-800">{prof.rating}</span>
                        <span className="text-gray-400">({prof.reviews} avis)</span>
                      </div>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#1E3A8A] line-clamp-1 pt-1">
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

      {/* BANNIÈRE APPEL À L'ACTION PROFESSEURS (BAS DE PAGE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-8 w-full">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Vous êtes enseignant ou étudiant diplômé ?</h4>
            <p className="text-xs text-gray-300">Rejoignez plus de 1 200 professeurs particuliers au Maroc et commencez à recevoir des élèves.</p>
          </div>
          <button 
            onClick={handleGoToProfMarketing}
            className="bg-[#1E40AF] hover:bg-blue-800 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shrink-0 cursor-pointer shadow-md"
          >
            Rejoindre nos professeurs
          </button>
        </div>
      </section>

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