'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import StickyHeader from './components/StickyHeader';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { Search, MapPin, Star, CheckCircle, Filter, BookOpen, Bookmark, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

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
    bio: "Pour nos cours nous allons voir le nécessaire pour réussir vos études bien sur d'une façon amusante pour ne pas s'ennuyer et approfondir vos connaissances..."
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/professeurs?subject=${encodeURIComponent(subject)}&location=${encodeURIComponent(location)}`);
  };

  // Clic sur un prof -> Page détail / Contact
  const handleProfClick = (profId: number) => {
    router.push(`/professeurs/${profId}`);
  };

  // Clic Professeur -> Redirection vers la Page Marketing dédiée aux Profs
  const handleGoToProfMarketing = () => {
    router.push('/donner-des-cours');
  };

  return (
    <main className="min-h-screen bg-[#F4F5F7] text-gray-900 font-sans flex flex-col justify-between overflow-x-hidden relative">
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

      {/* BANNIÈRE HAUT : EN-TÊTE DE LA PAGE DE RECHERCHE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
            Cours de soutien scolaire
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Sur profmaroc, trouvez le prof particulier idéal pour du soutien scolaire en ligne ou à domicile.
          </p>
        </div>

        {/* Bouton stratégique pour capter les Professeurs */}
        <button 
          onClick={handleGoToProfMarketing}
          className="border-2 border-[#1E40AF] text-[#1E40AF] hover:bg-[#1E40AF] hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Donner des cours particuliers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CONTENU : FILTRES + CARTES STYLE VOSCOURS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col md:flex-row gap-6">
        
        {/* --- FILTRES DU CÔTÉ ÉLÈVE (GAUCHE) --- */}
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
              <label className="text-xs font-bold text-gray-700 block mb-1">Où ?</label>
              <input 
                type="text"
                placeholder="Ex: Casablanca, Rabat..."
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

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Niveau des cours</label>
              <div className="space-y-1.5 text-xs text-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#1E40AF]" defaultChecked />
                  <span>de primaire</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#1E40AF]" defaultChecked />
                  <span>du collège</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#1E40AF]" defaultChecked />
                  <span>du lycée</span>
                </label>
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filtrer</span>
            </button>
          </div>
        </aside>

        {/* --- LISTE DES PROFESSEURS (EXACTEMENT COMME IMAGE 1) --- */}
        <section className="flex-1 space-y-4">
          
          {MOCK_PROFS.map((prof) => (
            <div 
              key={prof.id} 
              onClick={() => handleProfClick(prof.id)}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer relative flex flex-col sm:flex-row items-start gap-5 overflow-hidden text-left"
            >
              {/* Badge Premium en ruban bleu sur le coin supérieur (exactement comme VosCours) */}
              {prof.isPremium && (
                <div className="absolute top-0 left-0 bg-[#3B82F6] text-white text-[11px] font-bold px-8 py-0.5 rounded-br-lg shadow-sm">
                  Premium
                </div>
              )}

              {/* Photo Ronde à gauche */}
              <div className={`shrink-0 mx-auto sm:mx-0 ${prof.isPremium ? 'mt-4 sm:mt-2' : ''}`}>
                <img 
                  src={prof.avatar} 
                  alt={prof.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border border-gray-100 shadow-inner"
                />
              </div>

              {/* Détails du Professeur au milieu */}
              <div className={`flex-1 space-y-1.5 w-full ${prof.isPremium ? 'mt-2 sm:mt-0' : ''}`}>
                
                {/* Ligne Nom, Ville & Prix */}
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

                  {/* Prix en haut à droite */}
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

                {/* Titre de l'annonce (en Gras Bleu comme VosCours) */}
                <h4 className="text-sm font-bold text-[#1E3A8A] line-clamp-1 pt-1">
                  {prof.title}
                </h4>

                {/* Description courte */}
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {prof.bio}
                </p>

              </div>

            </div>
          ))}

        </section>

      </div>

      {/* --- BANNIÈRE MARKETING EN BAS : REDIRIGE VERS LA PAGE MARKETING PROF --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-8 w-full">
        <div className="bg-[#0B132B] rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-left">
          <div className="space-y-2">
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
              Enseignants / Professeurs
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">Vous souhaitez donner des cours et trouver des élèves ?</h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
              Découvrez notre plateforme. Recevez des demandes d'élèves en direct sans abonnement mensuel obligatoire.
            </p>
          </div>

          <button 
            onClick={handleGoToProfMarketing}
            className="bg-[#FF5A5F] hover:bg-[#e0484d] text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Découvrir l'Espace Profs</span>
            <ArrowRight className="w-4 h-4" />
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