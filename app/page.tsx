'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import HelpModal from './components/HelpModal';
import HeroBackground3D from './components/HeroBackground3D';
import MoroccoMap from './components/MoroccoMap';
import { supabase } from '@/lib/supabase';
import gsap from 'gsap';
import { 
  Search, MapPin, BookOpen, CheckCircle2, 
  Filter, ShieldCheck, PhoneCall,
  GraduationCap, DollarSign, Laptop, Home, 
  Award, Loader2, RefreshCcw, UserPlus, ChevronRight, Star, Heart, User,
  ChevronDown, HelpCircle, Mail, Phone, Sparkles
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
  is_admin?: boolean;
}

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('recherche');

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // États des filtres
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [locationType, setLocationType] = useState('');

  // FAQ interactive state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }
  }, []);

  // Animation machine à écrire
  const words = ["en Maths", "en Français", "en Anglais", "en Physique", "en SVT", "en Arabe"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const fullText = words[currentWordIndex];
    const handleTyping = () => {
      if (!isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        if (currentText === fullText) {
          setTimeout(() => setIsDeleting(true), 1500);
          setTypingSpeed(70);
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        if (currentText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(120);
        }
      }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed, words]);

  const subjects = [
    "Maths", "Physique", "Physique et Chimie", "Arabe", "Anglais", 
    "Français", "Coach sportif", "SVT", "Étude supérieur"
  ];

  const levels = ["Primaire", "Collège", "Secondaire", "Niveau Supérieur"];

  const popularSubjectsList = [
    { title: "Mathématiques", count: "120+ Profs", icon: "📐", color: "from-blue-500/10 to-indigo-500/10 text-blue-600" },
    { title: "Physique - Chimie", count: "85+ Profs", icon: "⚡", color: "from-purple-500/10 to-pink-500/10 text-purple-600" },
    { title: "Français & Langues", count: "90+ Profs", icon: "📚", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600" },
    { title: "Anglais", count: "110+ Profs", icon: "🌐", color: "from-amber-500/10 to-orange-500/10 text-amber-600" },
    { title: "SVT & Biologie", count: "65+ Profs", icon: "🧬", color: "from-rose-500/10 to-red-500/10 text-rose-600" },
    { title: "Soutien Universitaire", count: "50+ Profs", icon: "🎓", color: "from-violet-500/10 to-purple-500/10 text-violet-600" },
  ];

  const faqItems = [
    {
      q: "Combien coûte la mise en relation avec un professeur ?",
      a: "C'est 100% gratuit ! ProfMaroc n'applique aucun frais de mise en relation ni aucune commission sur les cours."
    },
    {
      q: "Comment se déroule le premier cours offert ?",
      a: "La majorité de nos professeurs proposent un premier cours ou entretien de 30 minutes offert pour faire connaissance et évaluer le niveau de l'élève."
    },
    {
      q: "Les cours se déroulent-ils à domicile ou en ligne ?",
      a: "Vous avez le choix ! Chaque professeur indique sur son profil s'il se déplace à votre domicile, s'il reçoit chez lui, ou s'il donne des cours à distance via webcam."
    },
    {
      q: "Comment vérifier les compétences d'un professeur ?",
      a: "Tous les profils affichés sur ProfMaroc font l'objet d'une vérification stricte des diplômes, des pièces d'identité et des avis laissés par d'autres élèves."
    }
  ];

  const formatCleanText = (val: any): string => {
    if (!val) return '';
    const str = String(val);
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed.join(', ');
    } catch {}
    return str.replace(/[\[\]"]/g, '').trim();
  };

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .or('is_admin.is.null,is_admin.eq.false')
        .not('email', 'in', '("berrada0amal@gmail.com","louizisalaheddine@gmail.com")');

      if (error) {
        setProfessors([]);
      } else {
        let results = data || [];
        results = results.filter(p => {
          const email = (p.email || p.Email || '').toLowerCase().trim();
          if (p.is_admin === true) return false;
          if (email === 'berrada0amal@gmail.com' || email === 'louizisalaheddine@gmail.com') return false;
          return true;
        });

        const normalize = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

        if (selectedSubject) {
          const cleanSub = normalize(selectedSubject);
          results = results.filter(p => {
            const mat = normalize(String(p.matiere || p.subject || ''));
            return mat.includes(cleanSub) || cleanSub.includes(mat);
          });
        }

        if (selectedCity.trim()) {
          const cleanCity = normalize(selectedCity);
          results = results.filter(p => {
            const city = normalize(String(p.ville || p.city || ''));
            if (!city) return false;
            if (city.includes(cleanCity) || cleanCity.includes(city)) return true;
            if (cleanCity.includes('casa') && city.includes('casa')) return true;
            return false;
          });
        }

        if (selectedLevel) {
          const cleanLvl = normalize(selectedLevel);
          results = results.filter(p => {
            const lvl = normalize(String(p.niveau || p.level || ''));
            if (!lvl) return true;
            return lvl.includes(cleanLvl) || cleanLvl.includes(lvl);
          });
        }

        if (priceRange) {
          results = results.filter(p => {
            const priceVal = Number(p.tarif !== undefined && p.tarif !== null ? p.tarif : p.price) || 0;
            if (priceRange === '0-100') return priceVal <= 100;
            if (priceRange === '100-150') return priceVal >= 100 && priceVal <= 150;
            if (priceRange === '150-200') return priceVal >= 150 && priceVal <= 200;
            if (priceRange === '200+') return priceVal >= 200;
            return true;
          });
        }

        if (locationType) {
          results = results.filter(p => {
            const loc = normalize(String(p.lieu || p.location || ''));
            if (!loc) return true; 
            return loc.includes(normalize(locationType));
          });
        }

        setProfessors(results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, [selectedSubject, selectedCity, selectedLevel, priceRange, locationType]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfessors();
  };

  const handleReset = () => {
    setSelectedSubject('');
    setSelectedCity('');
    setSelectedLevel('');
    setPriceRange('');
    setLocationType('');
  };

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col justify-between selection:bg-purple-600 selection:text-white">
      
      <Navbar 
        isLoggedIn={false}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => {}}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* HERO SECTION */}
      <section className="bg-white border-b border-slate-200/60 py-16 lg:py-24 px-4 sm:px-8 relative overflow-hidden">
        <HeroBackground3D />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[700px] bg-purple-100/40 rounded-full blur-[160px] pointer-events-none -z-10" />
        
        <div ref={heroRef} className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left lg:pl-12">
            
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200/80 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>N°1 du soutien scolaire sur mesure au Maroc</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight min-h-[140px] sm:min-h-[180px]">
              Trouvez le meilleur professeur <br />
              <span className="text-purple-600 inline-flex items-center">
                {currentText}
                <span className="inline-block w-1 h-8 sm:h-12 ml-1 bg-purple-500 animate-pulse"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Recherchez librement parmi nos professeurs qualifiés partout au Maroc. <strong className="text-slate-900 font-semibold">Aucun frais d'agence, 0 DH de commission</strong> : contactez directement votre enseignant idéal.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm font-semibold pt-2">
              <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/60 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Profils Vérifiés
              </span>
              <span className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-slate-700" />
                0 DH de frais
              </span>
              <span className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl shadow-2xs">
                <PhoneCall className="w-4 h-4 text-slate-700" />
                Contact Direct
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 relative w-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-4xl transform hover:scale-[1.02] transition duration-500">
              <img 
                src="/Design sans titre(6).png" 
                alt="Illustration ProfMaroc" 
                className="w-full h-auto object-contain mix-blend-multiply scale-125"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-slate-900 text-white py-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-800">
          <div className="space-y-1 p-2">
            <p className="text-3xl lg:text-5xl font-black text-purple-400">100%</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Sans frais d'agence</p>
          </div>
          <div className="space-y-1 p-2">
            <p className="text-3xl lg:text-5xl font-black text-purple-400">Vérifiés</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Diplômes & Identités</p>
          </div>
          <div className="space-y-1 p-2">
            <p className="text-3xl lg:text-5xl font-black text-purple-400">Casablanca +</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Toutes les villes du Maroc</p>
          </div>
          <div className="space-y-1 p-2">
            <p className="text-3xl lg:text-5xl font-black text-purple-400">1er Cours</p>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Généralement offert</p>
          </div>
        </div>
      </section>

      {/* MATIÈRES POPULAIRES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Explorez par matière populaire</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Cliquez sur la matière de votre choix pour afficher directement les enseignants disponibles.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularSubjectsList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSubject(item.title.split(' ')[0]);
                const resultsElement = document.getElementById('search-results');
                if (resultsElement) resultsElement.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-3 group cursor-pointer hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition duration-300`}>
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h3>
                <span className="text-[10px] text-slate-500 font-semibold">{item.count}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CARTE STYLISÉE DU MAROC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3.5 py-1 rounded-full text-xs font-bold">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>Disponible dans tout le Maroc</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Nos professeurs près de chez vous
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Sélectionnez votre ville sur le dessin ou dans la liste pour afficher directement les profs disponibles.
          </p>
        </div>

        <MoroccoMap 
          selectedCity={selectedCity}
          onSelectCity={(cityName) => {
            setSelectedCity(cityName);
            const resultsElement = document.getElementById('search-results');
            if (resultsElement) {
              resultsElement.scrollIntoView({ behavior: 'smooth' });
            }
          }} 
        />
      </section>

      {/* SECTION FILTRES ET RESULTATS */}
      <section id="search-results" className="max-w-[90rem] mx-auto px-4 sm:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANNEAU DE FILTRAGE */}
        <aside className="lg:col-span-3 space-y-6">
          <form onSubmit={handleApplyFilters} className="bg-white p-6 rounded-3xl border border-slate-200/85 shadow-sm space-y-5 sticky top-24 backdrop-blur-md">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-slate-700" />
                Filtrer les professeurs
              </h3>
              <button 
                type="button" 
                onClick={handleReset} 
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer flex items-center gap-1 transition group"
              >
                <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition duration-500" />
                Réinitialiser
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                Matière
              </label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-700 focus:ring-4 focus:ring-slate-100 focus:outline-none transition duration-200 cursor-pointer"
              >
                <option value="">Toutes les matières</option>
                {subjects.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                Ville
              </label>
              <input 
                type="text" 
                placeholder="Ex: Casablanca, Rabat..." 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-700 focus:ring-4 focus:ring-slate-100 focus:outline-none transition duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                Niveau d'études
              </label>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-700 focus:ring-4 focus:ring-slate-100 focus:outline-none transition duration-200 cursor-pointer"
              >
                <option value="">Tous les niveaux</option>
                {levels.map((lvl, idx) => (
                  <option key={idx} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-700" />
                Tarif horaire
              </label>
              <select 
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-700 focus:ring-4 focus:ring-slate-100 focus:outline-none transition duration-200 cursor-pointer"
              >
                <option value="">Tous les tarifs</option>
                <option value="0-100">Moins de 100 DH/h</option>
                <option value="100-150">100 DH - 150 DH/h</option>
                <option value="150-200">150 DH - 200 DH/h</option>
                <option value="200+">Plus de 200 DH/h</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Lieu du cours</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType(locationType === 'domicile' ? '' : 'domicile')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    locationType === 'domicile' ? 'bg-slate-100 border-slate-800 text-slate-900 shadow-xs scale-[1.02]' : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Home className="w-4 h-4 mb-1" />
                  À domicile
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType(locationType === 'en_ligne' ? '' : 'en_ligne')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    locationType === 'en_ligne' ? 'bg-slate-100 border-slate-800 text-slate-900 shadow-xs scale-[1.02]' : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <Laptop className="w-4 h-4 mb-1" />
                  En ligne
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl text-xs transition-all duration-300 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Search className="w-4 h-4" />
              Appliquer les filtres
            </button>

          </form>
        </aside>

        {/* LISTE DES RÉSULTATS */}
        <div className="lg:col-span-9 space-y-6">
          
          <div className="flex items-center justify-between text-xs px-1">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-700" />
              Nos Professeurs au Maroc
            </h2>
            <span className="font-bold bg-slate-200/70 text-slate-700 px-3 py-1 rounded-full">{professors.length} trouvé(s)</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Recherche des professeurs en cours...</p>
            </div>
          ) : professors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto animate-bounce">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-900">Aucun professeur trouvé</p>
                <p className="text-xs text-slate-500">Aucun profil ne correspond exactement à vos critères de recherche actuels.</p>
              </div>
              <button 
                onClick={handleReset} 
                className="bg-slate-100 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-200 transition cursor-pointer shadow-xs active:scale-95"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professors.map((prof) => {
                const nomField = prof.Nom || prof.nom || '';
                const prenomField = prof.Prénom || prof.prenom || '';
                const fullName = (nomField || prenomField) ? `${prenomField} ${nomField}`.trim() : (prof.name || 'Professeur');
                const photo = prof.photo_URL || prof.photo_url || prof.photo || prof.avatar_url;
                const city = formatCleanText(prof.ville || prof.city) || "Maroc";
                const subject = formatCleanText(prof.matiere || prof.subject) || "Soutien scolaire";
                const levelText = formatCleanText(prof.niveau || prof.level);
                const price = Number(prof.tarif !== undefined && prof.tarif !== null ? prof.tarif : prof.price) || 0;

                return (
                  <div key={prof.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                    <div className="relative h-72 w-full bg-slate-900 overflow-hidden">
                      {photo ? (
                        <img src={photo} alt={fullName} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition duration-700">
                          <div className="w-24 h-24 rounded-full bg-slate-600/60 border-2 border-slate-500/50 flex items-center justify-center text-slate-200 shadow-inner backdrop-blur-sm">
                            <User className="w-12 h-12 stroke-[1.5]" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Vérifié
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-black tracking-tight">{fullName}</h3>
                        <p className="text-xs text-slate-200 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-300" />
                          {city} (face à face & webcam)
                        </p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4 flex flex-col justify-between flex-grow bg-white">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>5 (6 avis)</span>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[10px]">
                            Disponible
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                          <strong className="text-slate-900">{subject}</strong> {levelText ? `- Niveau : ${levelText}. ` : ''} Professeur qualifié prêt à vous accompagner vers la réussite.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {price} MAD<span className="text-[10px] font-normal text-slate-500">/h</span>
                          </div>
                          <div className="text-[10px] font-bold text-rose-600">
                            1er cours offert
                          </div>
                        </div>
                        <Link 
                          href={`/professeurs/${prof.id}`}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition duration-200 shadow-sm active:scale-95"
                        >
                          Contacter
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </section>

      {/* COMMENT ÇA FONCTIONNE */}
      <section className="bg-white border-t border-slate-200/60 py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Comment ça fonctionne ?</h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">Trouvez et contactez votre professeur en toute simplicité en 3 étapes clés.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/90 p-10 rounded-[2.5rem] border border-slate-200/80 shadow-md space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-md">1</div>
              <h3 className="font-bold text-slate-900 text-lg">Trouvez votre prof</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Utilisez les filtres puissants pour dénicher le professeur idéal selon votre matière, votre ville et vos exigences.</p>
            </div>
            <div className="bg-slate-50/90 p-10 rounded-[2.5rem] border border-slate-200/80 shadow-md space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-md">2</div>
              <h3 className="font-bold text-slate-900 text-lg">Contactez directement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Échangez sans intermédiaire ni commission d'agence avec le professeur pour organiser vos cours facilement.</p>
            </div>
            <div className="bg-slate-50/90 p-10 rounded-[2.5rem] border border-slate-200/80 shadow-md space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-md">3</div>
              <h3 className="font-bold text-slate-900 text-lg">Progressez sereinement</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Suivez vos cours à domicile ou en ligne et progressez à votre rythme vers la réussite scolaire totale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FAQ INTERACTIVE */}
      <section className="bg-slate-50 py-20 px-4 sm:px-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3.5 py-1 rounded-full text-xs font-bold">
              <HelpCircle className="w-4 h-4" />
              <span>Questions Fréquentes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Des questions ? Nous avons les réponses</h2>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition duration-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-6 text-left font-extrabold text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                >
                  <span className="text-sm sm:text-base">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 text-purple-600' : ''}`} />
                </button>
                
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNIÈRE REJOIGNEZ-NOUS */}
      <section className="bg-slate-900 py-16 px-4 sm:px-8 text-white relative overflow-hidden shadow-inner">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-slate-800 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
            <UserPlus className="w-3.5 h-3.5 text-slate-300" />
            <span>Rejoignez notre réseau</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Vous êtes professeur ? Rejoignez ProfMaroc !
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Créez votre profil gratuitement, fixez vos tarifs librement et recevez directement les demandes des élèves près de chez vous.
          </p>

          <div className="pt-2">
            <Link 
              href="/inscription"
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-extrabold px-7 py-4 rounded-2xl text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 group"
            >
              Créer mon profil gratuitement
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER COMPLET & MODERNE */}
      <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800">
        <div className="max-w-[90rem] mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* COLONNE 1 : LOGO & DESCRIPTION */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider text-white">
                prof<span className="text-purple-500">maroc</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              La plateforme marocaine de référence pour trouver des professeurs particuliers qualifiés en ligne et à domicile, sans aucun frais d'intermédiaire.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-purple-600 transition cursor-pointer">
                <Mail className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-purple-600 transition cursor-pointer">
                <Phone className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* COLONNE 2 : MATIÈRES */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Matières Phares</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => setSelectedSubject('Maths')} className="hover:text-purple-400 transition cursor-pointer">Mathématiques</button></li>
              <li><button onClick={() => setSelectedSubject('Physique')} className="hover:text-purple-400 transition cursor-pointer">Physique & Chimie</button></li>
              <li><button onClick={() => setSelectedSubject('Français')} className="hover:text-purple-400 transition cursor-pointer">Langue Française</button></li>
              <li><button onClick={() => setSelectedSubject('Anglais')} className="hover:text-purple-400 transition cursor-pointer">Anglais & Communication</button></li>
              <li><button onClick={() => setSelectedSubject('SVT')} className="hover:text-purple-400 transition cursor-pointer">SVT & Biologie</button></li>
            </ul>
          </div>

          {/* COLONNE 3 : VILLES */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Villes Principales</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => setSelectedCity('Casablanca')} className="hover:text-purple-400 transition cursor-pointer">Casablanca</button></li>
              <li><button onClick={() => setSelectedCity('Rabat')} className="hover:text-purple-400 transition cursor-pointer">Rabat & Salé</button></li>
              <li><button onClick={() => setSelectedCity('Marrakech')} className="hover:text-purple-400 transition cursor-pointer">Marrakech</button></li>
              <li><button onClick={() => setSelectedCity('Tanger')} className="hover:text-purple-400 transition cursor-pointer">Tanger</button></li>
              <li><button onClick={() => setSelectedCity('Fès')} className="hover:text-purple-400 transition cursor-pointer">Fès & Meknès</button></li>
            </ul>
          </div>

          {/* COLONNE 4 : NAVIGATION & AIDE */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Liens Utiles</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/inscription" className="hover:text-purple-400 transition">Devenir Professeur</Link></li>
              <li><button onClick={() => setIsHelpOpen(true)} className="hover:text-purple-400 transition cursor-pointer">Centre d'aide</button></li>
              <li><button onClick={() => setIsHelpOpen(true)} className="hover:text-purple-400 transition cursor-pointer">Comment ça marche</button></li>
              <li><Link href="/login" className="hover:text-purple-400 transition">Espace Enseignant</Link></li>
            </ul>
          </div>

        </div>

        {/* MENTIONS LÉGALES ET COPYRIGHT */}
        <div className="border-t border-slate-900 bg-slate-950 py-6 px-6 lg:px-12 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500 max-w-[90rem] mx-auto">
          <p>© {new Date().getFullYear()} ProfMaroc. Tous droits réservés.</p>
          <div className="flex justify-center gap-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-400 transition cursor-pointer">Conditions d'utilisation</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Politique de confidentialité</span>
          </div>
        </div>
      </footer>

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        helpSection={helpSection} 
        setHelpSection={setHelpSection} 
      />

    </main>
  );
}