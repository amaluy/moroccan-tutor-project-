'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  HelpCircle, 
  BookOpen, 
  Star, 
  Heart, 
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Repeat,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  GraduationCap,
  Users,
  Calculator,
  Languages,
  Globe,
  Dna,
  Zap,
  Atom,
  Info,
  XCircle,
  UserPlus,
  Target,
  Award,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const SUPABASE_URL = 'https://ydrswexzawreqrnuqwkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tiN8U5jsxtqe-F10_98DTw_jdcEf-IX';

interface Professor {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  subject: string;
  city: string;
  price: number;
  bio: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  is_approved: boolean;
  created_at: string;
  offers_free_trial?: boolean;
  is_online?: boolean;
}

const detailedSubjects = [
  {
    id: 'maths',
    name: 'Mathématiques',
    category: 'Sciences Exactes',
    icon: Calculator,
    description: 'Algèbre, géométrie, analyse, probabilités et préparation intensive aux examens du Régional et du National.',
    levels: ['Collège', 'Lycée', 'Bac Biof', 'Classes Prépa', 'Universitaire'],
    badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    iconBg: 'bg-indigo-500'
  },
  {
    id: 'physique-chimie',
    name: 'Physique - Chimie',
    category: 'Sciences Physiques',
    icon: Atom,
    description: 'Mécanique, électricité, chimie organique et solutions aqueuses avec résolutions d’exercices types BAC.',
    levels: ['Collège', 'Lycée (SM / PC / SVT)', 'Supérieur'],
    badgeColor: 'bg-amber-50 text-amber-600 border-amber-100',
    iconBg: 'bg-amber-500'
  },
  {
    id: 'svt',
    name: 'SVT (Sciences de la Vie et de la Terre)',
    category: 'Sciences Naturelles',
    icon: Dna,
    description: 'Génétique, immunologie, géologie et écologie expliquées de façon schématique et pédagogique.',
    levels: ['Collège', 'Lycée (SVT / PC)', 'Faculté'],
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconBg: 'bg-emerald-500'
  },
  {
    id: 'francais',
    name: 'Français & Langue',
    category: 'Langues & Littérature',
    icon: BookOpen,
    description: 'Étude d’œuvres littéraires, production écrite, méthodologie de la synthèse et préparation au Régional 1ère Année Bac.',
    levels: ['Primaire', 'Collège', '1ère BAC (Régional)', 'Communication'],
    badgeColor: 'bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/20',
    iconBg: 'bg-[#FF5A5F]'
  },
  {
    id: 'anglais',
    name: 'Anglais',
    category: 'Langues Vivantes',
    icon: Languages,
    description: 'Grammaire, vocabulaire, expression orale, préparation au TOEFL/IELTS et soutien du programme national.',
    levels: ['Tous niveaux', 'Business English', 'Soutien Scolaire'],
    badgeColor: 'bg-sky-50 text-sky-600 border-sky-100',
    iconBg: 'bg-sky-500'
  },
  {
    id: 'arabe',
    name: 'Arabe & Éducation Islamique',
    category: 'Langues & Humaines',
    icon: Globe,
    description: 'Grammaire (Nahw/Sarf), analyse de textes littéraires et consolidation des bases pour le brevet et le bac.',
    levels: ['Primaire', 'Collège', 'Lycée'],
    badgeColor: 'bg-teal-50 text-teal-600 border-teal-100',
    iconBg: 'bg-teal-500'
  },
  {
    id: 'soutien-general',
    name: 'Soutien Scolaire Global',
    category: 'Accompagnement',
    icon: GraduationCap,
    description: 'Aide aux devoirs, méthodologie de travail, organisation et suivi hebdomadaire multidisciplinaire pour les plus jeunes.',
    levels: ['Primaire', 'Collège'],
    badgeColor: 'bg-purple-50 text-purple-600 border-purple-100',
    iconBg: 'bg-purple-500'
  }
];

const subjectsData = [
  { name: 'Maths', icon: Calculator },
  { name: 'Anglais', icon: Languages },
  { name: 'Français', icon: BookOpen },
  { name: 'Arabe', icon: Globe },
  { name: 'Soutien scolaire', icon: GraduationCap },
  { name: 'SVT', icon: Dna },
  { name: 'Physique', icon: Zap },
  { name: 'Physique - Chimie', icon: Atom },
];

const steps = [
  {
    number: 1,
    title: 'Trouvez un Prof',
    description: 'Explorez notre annuaire de professeurs qualifiés et choisissez celui qui correspond à vos besoins académiques.',
    borderColor: 'border-t-[#4338CA]',
    numberBg: 'bg-[#4338CA]'
  },
  {
    number: 2,
    title: 'Rejoignez un Groupe',
    description: "Intégrez un groupe d'étude collaboratif avec d'autres élèves partageant les mêmes objectifs académiques.",
    borderColor: 'border-t-[#EC4899]',
    numberBg: 'bg-[#F59E0B]'
  },
  {
    number: 3,
    title: 'Collaborez et Progressez',
    description: "Participez aux discussions, partagez des ressources et bénéficiez d'un accompagnement personnalisé pour réussir.",
    borderColor: 'border-t-[#4338CA]',
    numberBg: 'bg-[#4338CA]'
  }
];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<'landing' | 'about' | 'subjects'>('landing');
  const [email, setEmail] = useState('berradaOamal@gmail.com');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'header' | null>(null);
  
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('acceptee');

  const headerDropdownRef = useRef<HTMLFormElement>(null);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() !== '') {
      setIsLoggedIn(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    touchEndX.current = clientX;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    
    if (swipeDistance > 50) {
      setCurrentSlide(1);
    } else if (swipeDistance < -50) {
      setCurrentSlide(0);
    }
  };

  // Charger les professeurs dès l'initialisation pour calculer les statistiques réelles
  useEffect(() => {
    async function fetchProfessors() {
      setLoading(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/professors?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfessors(data);
        } else {
          console.error('Erreur Supabase :', response.statusText);
        }
      } catch (error) {
        console.error('Erreur chargement professeurs :', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfessors();
  }, []);

  // Fonction helper pour calculer le nombre réel de profs par matière
  const getProfCountBySubject = (subjectName: string) => {
    if (!professors || professors.length === 0) return 0;

    const query = subjectName.toLowerCase();
    
    return professors.filter((prof) => {
      if (!prof.subject) return false;
      const profSubject = prof.subject.toLowerCase();

      // Correspondances par mots-clés
      if (query.includes('math')) return profSubject.includes('math');
      if (query.includes('physique')) return profSubject.includes('physique') || profSubject.includes('chimie');
      if (query.includes('svt')) return profSubject.includes('svt') || profSubject.includes('vie');
      if (query.includes('francais') || query.includes('français')) return profSubject.includes('francais') || profSubject.includes('français');
      if (query.includes('anglais')) return profSubject.includes('anglais') || profSubject.includes('english');
      if (query.includes('arabe')) return profSubject.includes('arabe');
      if (query.includes('soutien')) return profSubject.includes('soutien') || profSubject.includes('primaire');

      return profSubject.includes(query);
    }).length;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        headerDropdownRef.current && !headerDropdownRef.current.contains(target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveDropdown(null);
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white">
        
        {/* BARRE DE NAVIGATION */}
        <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-30">
          <div className="flex items-center gap-8">
            <span 
              onClick={() => setCurrentPage('landing')} 
              className="text-2xl font-extrabold text-[#FF5A5F] tracking-tight cursor-pointer"
            >
              profmaroc
            </span>

            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
              <button 
                onClick={() => setCurrentPage('about')} 
                className={`transition ${currentPage === 'about' ? 'text-[#FF5A5F] font-bold' : 'hover:text-black'}`}
              >
                Qui sommes nous
              </button>
              
              <button 
                onClick={() => setCurrentPage('subjects')} 
                className={`transition flex items-center gap-1 ${currentPage === 'subjects' ? 'text-[#FF5A5F] font-bold' : 'hover:text-black'}`}
              >
                <span>Matières</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-black transition">
                <span>Villes</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition" />
              </div>

              <button onClick={() => setCurrentPage('landing')} className="hover:text-black transition">
                Tarifs
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 absolute left-3" />
              <input 
                type="text" 
                placeholder="Rechercher une matière..." 
                className="bg-gray-200/60 focus:bg-white border border-transparent focus:border-gray-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-800 placeholder-gray-500 focus:outline-none transition w-48 focus:w-60"
              />
              <span className="absolute right-2 text-[10px] bg-gray-300/60 text-gray-600 px-1.5 py-0.5 rounded font-mono">/</span>
            </div>

            <button 
              onClick={() => setIsLoggedIn(true)} 
              className="text-sm font-bold text-gray-800 hover:text-[#FF5A5F] px-3 py-2 transition"
            >
              Se connecter
            </button>

            <button 
              onClick={() => setIsLoggedIn(true)} 
              className="text-sm font-bold text-white bg-[#FF5A5F] hover:bg-[#E0484C] px-4 py-2 rounded-lg transition shadow-sm"
            >
              S'inscrire
            </button>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* PAGE QUI SOMMES NOUS */}
        {currentPage === 'about' && (
          <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-16 text-center max-w-5xl mx-auto my-auto animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#FF5A5F] flex items-center justify-center text-white text-3xl font-black shadow-lg mb-6 ring-4 ring-red-100">
              P
            </div>

            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-6 text-xs font-bold text-[#FF5A5F]">
              <span>À propos de ProfMaroc</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-6 max-w-3xl">
              La 1ère plateforme de soutien scolaire sur-mesure au Maroc
            </h1>

            <p className="text-base sm:text-lg text-gray-600 font-medium max-w-2xl mb-12 leading-relaxed">
              ProfMaroc a été créé avec une ambition simple : révolutionner le soutien scolaire au Maroc en offrant aux élèves et aux étudiants un accès direct aux meilleurs enseignants certifiés, quel que soit leur niveau.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-12">
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Notre Mission</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Faciliter l'excellence académique en rendant la recherche de professeurs qualifiés fluide, rapide et transparente pour toutes les familles marocaines.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Rigueur & Qualité</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Nous sélectionnons rigoureusement chaque profil d'enseignant. Diplômes, pédagogie et expérience sont systématiquement vérifiés par nos équipes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#FF5A5F] flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Une Communauté</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Plus qu'un annuaire, une communauté active d'entraide, de cours en groupe et de suivi personnalisé pour accompagner le parcours de chaque élève.
                </p>
              </div>
            </div>

            <button 
              onClick={() => setCurrentPage('landing')}
              className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
          </section>
        )}

        {/* PAGE MATIÈRES AVEC LES NOMBRE DE PROFS EN TEMPS RÉEL */}
        {currentPage === 'subjects' && (
          <section className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 md:py-16 animate-in fade-in duration-300">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-4 text-xs font-bold text-[#FF5A5F]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Programme National & International</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                Toutes nos matières d'enseignement
              </h1>
              <p className="text-base text-gray-600 font-medium max-w-xl mx-auto">
                Choisissez votre matière pour découvrir les meilleurs professeurs particuliers certifiés près de chez vous ou en ligne.
              </p>
            </div>

            <div className="space-y-4">
              {detailedSubjects.map((item) => {
                const IconComponent = item.icon;
                const count = getProfCountBySubject(item.name);

                return (
                  <div 
                    key={item.id}
                    onClick={() => setIsLoggedIn(true)}
                    className="group bg-white rounded-2xl p-6 border border-gray-200/80 hover:border-[#FF5A5F]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer"
                  >
                    <div className="flex items-start gap-5 flex-1">
                      <div className={`w-14 h-14 rounded-2xl ${item.iconBg} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-7 h-7 stroke-[1.8]" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-[#FF5A5F] transition">
                            {item.name}
                          </h2>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                            {item.category}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {item.levels.map((lvl) => (
                            <span key={lvl} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              {lvl}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0 gap-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {loading ? 'Chargement...' : `${count} prof${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-[#FF5A5F] group-hover:translate-x-1 transition-transform">
                        <span>Voir les profs</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <button 
                onClick={() => setCurrentPage('landing')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour à l'accueil</span>
              </button>
            </div>
          </section>
        )}

        {/* PAGE D'ACCUEIL LANDING */}
        {currentPage === 'landing' && (
          <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center max-w-5xl mx-auto my-auto animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-8 text-xs font-bold text-[#FF5A5F] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
              <span>La 1ère communauté de soutien scolaire au Maroc</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.08] mb-6 max-w-4xl">
              L’excellence scolaire se construit ensemble
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-2xl mb-10 leading-relaxed">
              Les élèves, les professeurs qualifiés et les meilleurs cours de soutien réunis sur une seule et même plateforme.
            </p>

            <form onSubmit={handleSignUp} className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-xl border border-gray-200/80 mb-8">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse e-mail" 
                className="w-full px-4 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent text-sm sm:text-base focus:outline-none font-medium"
              />
              <button 
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl transition text-sm sm:text-base shrink-0 shadow-md flex items-center justify-center gap-2"
              >
                <span>S'inscrire sur ProfMaroc</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-500 font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF5A5F]" />
                <span>Profs vérifiés & certifiés</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#FF5A5F]" />
                <span>Tous niveaux scolaires</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF5A5F]" />
                <span>Groupes & Cours particuliers</span>
              </div>
            </div>
          </section>
        )}

        <footer className="py-6 px-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FF5A5F] cursor-pointer" onClick={() => setCurrentPage('landing')}>
                profmaroc
              </span>
              <span>© 2026. Tous droits réservés.</span>
            </div>
            <div className="flex items-center gap-6 font-medium">
              <button onClick={() => setCurrentPage('landing')} className="hover:text-black transition">Confidentialité</button>
              <button onClick={() => setCurrentPage('landing')} className="hover:text-black transition">Conditions</button>
              <button onClick={() => setIsHelpOpen(true)} className="hover:text-black transition">Aide & Contact</button>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between overflow-x-hidden relative">
      <header className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300 transform ${
        isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-xl font-extrabold text-[#FF5A5F] tracking-tight shrink-0 cursor-pointer" onClick={() => setIsLoggedIn(false)}>
            profmaroc
          </span>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative" ref={headerDropdownRef}>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
              <div className="flex items-center gap-2 flex-1 border-r border-gray-300 pr-3">
                <BookOpen className="w-4 h-4 text-[#FF5A5F]" />
                <input
                  type="text"
                  placeholder="Matière"
                  value={searchTerm}
                  onFocus={() => setActiveDropdown('header')}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
              
              <div className="flex items-center gap-2 flex-1 pl-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Lieu du cours"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>

              <button 
                type="submit" 
                className="bg-[#FF5A5F] hover:bg-[#E0484C] text-white p-2 rounded-full transition ml-1 shrink-0"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {activeDropdown === 'header' && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                {subjectsData
                  .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((subject) => (
                    <button
                      key={subject.name}
                      type="button"
                      onClick={() => {
                        setSearchTerm(subject.name);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition font-medium"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>{subject.name}</span>
                    </button>
                ))}
              </div>
            )}
          </form>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setIsHelpOpen(true)} 
              className="text-gray-600 hover:text-black p-1 transition"
              title="Centre d'aide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <span className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-full transition cursor-pointer">
              Donner des cours
            </span>
          </div>
        </div>
      </header>

      <div className="min-h-screen flex flex-col relative select-none">
        <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
          <div className="flex items-center cursor-pointer" onClick={() => setIsLoggedIn(false)}>
            <span className="text-2xl md:text-3xl font-extrabold text-[#FF5A5F] tracking-tight">
              profmaroc
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="text-gray-700 hover:text-[#FF5A5F] transition p-1 rounded-full cursor-pointer flex items-center gap-1"
              title="Besoin d'aide ?"
            >
              <HelpCircle className="w-6 h-6 stroke-[1.8]" />
            </button>

            <span className="text-gray-900 font-bold hover:text-[#FF5A5F] transition text-sm cursor-pointer">
              Donner des cours
            </span>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-gray-900 font-bold hover:text-[#FF5A5F] transition text-sm"
            >
              Déconnexion
            </button>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-black/5 rounded-lg transition"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        <div 
          className="flex-1 relative w-full overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex w-[200%] h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 50}%)` }}
          >
            <div className="w-1/2 flex flex-col items-center justify-center px-4 py-8 text-center max-w-5xl mx-auto">
              <div className="w-full flex flex-col items-center space-y-10">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                  Trouvez le<br />professeur parfait
                </h1>

                <form onSubmit={handleSearch} className="w-full max-w-2xl bg-white p-2.5 rounded-full shadow-lg border border-gray-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 pl-4 flex-1">
                    <BookOpen className="w-5 h-5 text-[#FF5A5F] shrink-0" />
                    <input 
                      type="text" 
                      placeholder="apprendre l'anglais" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-[#FF5A5F] hover:bg-[#E0484C] text-white px-6 py-3 rounded-full font-bold text-sm sm:text-base transition shadow-md shrink-0"
                  >
                    Rechercher
                  </button>
                </form>

                <div className="w-full flex flex-col items-center space-y-8 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 w-full">
                    {subjectsData.map((subject) => {
                      const IconComponent = subject.icon;
                      const isSelected = searchTerm.toLowerCase() === subject.name.toLowerCase();

                      return (
                        <button
                          key={subject.name}
                          type="button"
                          onClick={() => setSearchTerm(subject.name)}
                          className={`bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border transition-all duration-200 group cursor-pointer ${
                            isSelected 
                              ? 'border-[#FF5A5F] shadow-md ring-2 ring-[#FF5A5F]/20' 
                              : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="text-[#FF5A5F] transition-transform duration-200 group-hover:scale-110">
                            <IconComponent className="w-7 h-7 stroke-[1.8]" />
                          </div>
                          <span className="text-xs font-bold text-gray-800 text-center leading-tight">
                            {subject.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage('subjects')}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-2xl transition shadow-md group cursor-pointer text-sm sm:text-base"
                  >
                    <span>Voir toutes les matières</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="w-1/2 flex flex-col items-center justify-center px-4 sm:px-8 py-6 text-center max-w-6xl mx-auto overflow-y-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">
                Comment ça marche ?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
                {steps.map((step) => (
                  <div 
                    key={step.number}
                    className={`bg-white rounded-3xl p-6 pt-8 shadow-sm border-t-4 ${step.borderColor} border-x border-b border-gray-100 flex flex-col items-center text-center relative`}
                  >
                    <div className={`w-12 h-12 ${step.numberBg} text-white font-bold text-lg rounded-full flex items-center justify-center shadow-md mb-4`}>
                      {step.number}
                    </div>

                    <h3 className="text-lg font-extrabold text-gray-900 mb-3">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h3 className="text-2xl font-extrabold text-[#4338CA] mb-6">
                    Pour les Étudiants
                  </h3>

                  <ul className="space-y-4 text-sm text-gray-800 font-medium">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Accédez à des groupes d'étude pour tous les niveaux scolaires</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Parcourez les profils détaillés des professeurs pour faire le meilleur choix</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Participez aux discussions et partagez des ressources avec d'autres élèves</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#4338CA] shrink-0 mt-0.5" />
                      <span>Consultez les annonces importantes et les sessions à venir</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6">
                    Pour les Professeurs
                  </h3>

                  <ul className="space-y-4 text-sm text-gray-800 font-medium">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Créez votre profil détaillé avec votre biographie, spécialités et expérience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Formez des groupes d'étude adaptés aux besoins de vos élèves</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Partagez du contenu pédagogique et communiquez facilement avec vos élèves</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gray-900 shrink-0 mt-0.5" />
                      <span>Suivez l'engagement et les progrès de vos groupes via un tableau de bord</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {currentSlide === 0 ? (
            <button 
              onClick={() => setCurrentSlide(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2.5 rounded-full shadow-md transition border border-gray-100 hidden sm:flex items-center justify-center z-30"
              title="Comment ça marche ?"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => setCurrentSlide(0)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 p-2.5 rounded-full shadow-md transition border border-gray-100 hidden sm:flex items-center justify-center z-30"
              title="Retour à la recherche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="py-6 flex items-center justify-center gap-2 z-20">
          <button 
            onClick={() => setCurrentSlide(0)}
            aria-label="Slide 1 - Recherche"
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === 0 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
          <button 
            onClick={() => setCurrentSlide(1)}
            aria-label="Slide 2 - Comment ça marche"
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === 1 ? 'w-8 bg-[#FF5A5F]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        </div>
      </div>

      {currentSlide === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8 w-full space-y-12">
          <div className="bg-gradient-to-r from-[#2A2B88] via-[#3B38B0] to-[#2E2882] rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 tracking-tight leading-snug">
              Des professeurs certifiés que vous pouvez vraiment choisir
            </h2>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  <strong className="text-white font-extrabold">Seulement 8%</strong> des profs passent notre sélection rigoureuse
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  Ils maîtrisent le système scolaire marocain et enseignent <strong className="text-white font-extrabold">plus de 30 matières</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FF7A30] flex items-center justify-center shrink-0 shadow-md">
                  <Repeat className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-100">
                  Vous pouvez changer si ça ne vous convient pas — <strong className="text-white font-extrabold">gratuitement</strong>
                </p>
              </div>
            </div>
          </div>

          <section className="w-full">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
              <span>Nos professeurs particuliers évalués</span>
              <span className="text-[#FF5A5F] text-xl">★★★★★</span>
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-96 bg-gray-200 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {professors.map((prof) => (
                  <div 
                    key={prof.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group"
                  >
                    <div className="relative h-72 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                      {prof.avatar_url ? (
                        <img 
                          src={prof.avatar_url} 
                          alt={prof.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
                          <User className="w-24 h-24 stroke-[1]" />
                        </div>
                      )}

                      <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition z-10">
                        <Heart className="w-5 h-5" />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white drop-shadow-md">
                        <h3 className="text-2xl font-bold leading-tight">{prof.name}</h3>
                        <p className="text-xs font-medium text-gray-200">
                          {prof.city} {prof.is_online ? '(face à face & webcam)' : '(face à face)'}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{prof.rating || 5}</span>
                            <span className="text-gray-400 font-normal">({prof.total_reviews || 0} avis)</span>
                          </div>

                          {prof.is_approved && (
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                              Confirmé
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 font-medium line-clamp-2">
                          <strong className="text-gray-900">{prof.subject}</strong> - {prof.bio}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-extrabold text-gray-900">{prof.price}MAD</span>
                          <span className="text-xs text-gray-500">/h</span>
                        </div>

                        {prof.offers_free_trial && (
                          <span className="text-xs font-semibold text-[#FF5A5F]">
                            1<sup>er</sup> cours offert
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-200">
        © 2026 ProfMaroc. Tous droits réservés.
      </footer>

      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-72 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6 shrink-0">
              <div 
                className="flex items-center gap-2 text-[#FF5A5F] font-bold text-sm cursor-pointer hover:underline"
                onClick={() => setIsHelpOpen(false)}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour au site</span>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  Articles Élève
                </h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setHelpSection('recherche')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      helpSection === 'recherche' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    Trouver un professeur
                  </button>
                </nav>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  Gérer mes demandes
                </h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setHelpSection('acceptee')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition relative pl-5 ${
                      helpSection === 'acceptee' ? 'bg-white shadow-sm text-gray-900 border-l-4 border-[#FF5A5F]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    Demande acceptée
                  </button>

                  <button
                    onClick={() => setHelpSection('refusee')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      helpSection === 'refusee' ? 'bg-white shadow-sm text-gray-900 border-l-4 border-[#FF5A5F]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    Demande refusée
                  </button>

                  <button
                    onClick={() => setHelpSection('avis')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      helpSection === 'avis' ? 'bg-white shadow-sm text-gray-900 border-l-4 border-[#FF5A5F]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    Laisser un avis
                  </button>
                </nav>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                  Espace Enseignant
                </h3>
                <nav className="space-y-1">
                  <button
                    onClick={() => setHelpSection('inscription')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      helpSection === 'inscription' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    S'inscrire comme professeur
                  </button>
                  <button
                    onClick={() => setHelpSection('compte')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      helpSection === 'compte' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    Mon compte
                  </button>
                </nav>
              </div>
            </div>

            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
              {helpSection === 'acceptee' && (
                <div className="space-y-6">
                  <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Demande acceptée</h2>
                  <p className="text-base text-gray-700 leading-relaxed">Vous avez <strong className="text-[#FF5A5F]">sélectionné</strong> votre professeur, votre demande de cours a été <strong className="text-[#FF5A5F]">envoyée</strong> et le professeur l'a acceptée ; vous pouvez désormais échanger directement avec lui.</p>
                  <p className="text-base text-gray-700 leading-relaxed">Connectez-vous sur votre espace ProfMaroc pour lui répondre. Plusieurs canaux sont disponibles pour discuter de votre premier cours (messagerie interne, téléphone ou e-mail).</p>
                  <p className="text-base text-gray-700 leading-relaxed">Pour consulter les détails et coordonnées du professeur, rendez-vous sur son profil depuis votre messagerie instantanée.</p>
                  <div className="bg-red-50/80 border border-red-100 rounded-2xl p-5 flex items-start gap-3 mt-6">
                    <Info className="w-5 h-5 text-[#FF5A5F] shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-800 leading-relaxed">Une fois votre demande validée, nous vous suggérons de lui <strong className="text-[#FF5A5F]">proposer un premier créneau</strong> en mentionnant directement vos disponibilités horaires.</p>
                  </div>
                </div>
              )}

              {helpSection === 'refusee' && (
                <div className="space-y-6">
                  <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Demande refusée</h2>
                  <p className="text-base text-gray-700 leading-relaxed">Si votre demande n'a pas été acceptée, ne vous inquiétez pas ! Cela survient généralement en raison d'un emploi du temps complet chez l'enseignant.</p>
                  <p className="text-base text-gray-700 leading-relaxed">Notre équipe vous permet d'envoyer immédiatement une nouvelle demande à un autre professeur qualifié dans la même matière sans aucun frais supplémentaire.</p>
                  <div className="bg-gray-100 rounded-2xl p-5 flex items-start gap-3 mt-6">
                    <XCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">Conseil : N'hésitez pas à contacter 2 ou 3 professeurs en parallèle pour maximiser vos chances de trouver un créneau rapidement.</p>
                  </div>
                </div>
              )}

              {helpSection === 'inscription' && (
                <div className="space-y-6">
                  <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE PROFESSEUR</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Comment puis-je m'inscrire en tant que professeur ?</h2>
                  <p className="text-base text-gray-700 leading-relaxed">Rejoindre la communauté ProfMaroc est simple et rapide :</p>
                  <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-gray-700">
                    <li>Cliquez sur le bouton <strong>"Donner des cours"</strong> situé dans le menu supérieur.</li>
                    <li>Remplissez votre profil en précisant vos diplômes, votre niveau et les matières enseignées.</li>
                    <li>Fixez vos tarifs horaires et vos disponibilités.</li>
                    <li>Notre équipe valide votre dossier sous 24h à 48h.</li>
                  </ol>
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3 mt-6">
                    <UserPlus className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-800 leading-relaxed">Un profil complet avec une jolie photo et une description détaillée reçoit jusqu'à 3 fois plus de demandes d'élèves !</p>
                  </div>
                </div>
              )}

              {helpSection === 'recherche' && (
                <div className="space-y-6">
                  <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Comment trouver un professeur ?</h2>
                  <p className="text-base text-gray-700 leading-relaxed">Utilisez simplement la barre de recherche sur la page d'accueil en saisissant la matière souhaitée (Maths, Anglais, SVT...) et votre ville. Vous pourrez ensuite filtrer les profils selon les tarifs, les avis et les niveaux proposées.</p>
                </div>
              )}

              {helpSection === 'avis' && (
                <div className="space-y-6">
                  <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Comment laisser un avis ?</h2>
                  <p className="text-base text-gray-700 leading-relaxed">Après votre premier cours, une invitation vous sera envoyée directement dans votre messagerie pour évaluer le cours et laisser un commentaire sur le profil de votre enseignant.</p>
                </div>
              )}

              {helpSection === 'compte' && (
                <div className="space-y-6">
                  <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">MON COMPTE</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Gérer mes informations personnelles</h2>
                  <p className="text-base text-gray-700 leading-relaxed">Depuis votre tableau de bord, vous pouvez à tout moment modifier vos informations personnelles, changer votre mot de passe ou mettre à jour votre numéro de téléphone.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}