'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import HelpModal from './components/HelpModal';
import SiteFooter from './components/Footer';
import HeroBackground3D from './components/HeroBackground3D';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/lib/siteconfig';
import gsap from 'gsap';
import { 
  Search, MapPin, BookOpen, CheckCircle2, 
  Filter, ShieldCheck, GraduationCap, DollarSign, Laptop,
  Loader2, RefreshCcw, UserPlus, ChevronRight, Star, User,
  ChevronDown, Sparkles, Users, Video, Wallet, BadgeCheck, Gift
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

// ======================= DONNÉES =======================

const TYPING_WORDS = ["en Maths", "en Français", "en Anglais", "en Physique", "en SVT", "en Arabe"];

const SUBJECTS = [
  "Maths", "Physique", "Physique et Chimie", "Arabe", "Anglais",
  "Français", "Coach sportif", "SVT", "Étude supérieur"
];

const LEVELS = ["Primaire", "Collège", "Secondaire", "Niveau Supérieur"];

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "Maths": ["maths", "math", "mathematiques"],
  "Physique": ["physique"],
  "Physique et Chimie": ["physique", "chimie"],
  "Arabe": ["arabe"],
  "Anglais": ["anglais"],
  "Français": ["francais"],
  "Coach sportif": ["sport", "coach"],
  "SVT": ["svt", "biologie", "sciencesdelavie"],
  "Étude supérieur": ["superieur", "universit", "etudesup"],
};

const POPULAR_SUBJECTS = [
  { title: "Mathématiques", filter: "Maths", count: "120+ Profs", icon: "📐", color: "from-blue-500/10 to-indigo-500/10 text-blue-600" },
  { title: "Physique - Chimie", filter: "Physique", count: "85+ Profs", icon: "⚡", color: "from-purple-500/10 to-pink-500/10 text-purple-600" },
  { title: "Français & Langues", filter: "Français", count: "90+ Profs", icon: "📚", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600" },
  { title: "Anglais", filter: "Anglais", count: "110+ Profs", icon: "🌐", color: "from-amber-500/10 to-orange-500/10 text-amber-600" },
  { title: "SVT & Biologie", filter: "SVT", count: "65+ Profs", icon: "🧬", color: "from-rose-500/10 to-red-500/10 text-rose-600" },
  { title: "Soutien Universitaire", filter: "Étude supérieur", count: "50+ Profs", icon: "🎓", color: "from-violet-500/10 to-purple-500/10 text-violet-600" },
];

const WHY_US = [
  { icon: BadgeCheck, title: "Profils vérifiés", desc: "Diplômes et pièces d'identité contrôlés avant chaque publication." },
  { icon: Wallet, title: "0 DH de commission", desc: "Vous payez uniquement le professeur, sans aucun frais d'agence." },
  { icon: Video, title: "À domicile ou en ligne", desc: "Choisissez le format qui vous convient, avec ou sans déplacement." },
  { icon: Users, title: "Contact direct", desc: "Échangez directement avec le professeur, sans intermédiaire." },
];

const STEPS = [
  { n: "1", title: "Trouvez votre prof", desc: "Choisissez une matière ou utilisez les filtres pour dénicher le professeur idéal selon votre niveau et votre budget." },
  { n: "2", title: "Contactez directement", desc: "Échangez sans intermédiaire ni commission d'agence avec le professeur pour organiser vos cours." },
  { n: "3", title: "Progressez sereinement", desc: "Suivez vos cours à domicile ou en ligne et progressez à votre rythme vers la réussite." },
];

const TEACHER_BENEFITS = [
  { icon: Gift, text: "Création de profil gratuite" },
  { icon: Wallet, text: "Vous fixez librement vos tarifs" },
  { icon: Users, text: "Recevez directement les demandes d'élèves" },
];

const FAQ_ITEMS = [
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

const DECOR_SYMBOLS = [
  { s: "π", cls: "top-8 left-[6%] text-6xl" },
  { s: "∑", cls: "top-24 right-[8%] text-7xl" },
  { s: "∫", cls: "bottom-10 left-[12%] text-7xl" },
  { s: "√", cls: "bottom-16 right-[14%] text-6xl" },
  { s: "Δ", cls: "top-1/2 left-[3%] text-5xl" },
  { s: "∞", cls: "top-1/3 right-[3%] text-6xl" },
];

// ======================= OUTILS =======================

const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

const formatCleanText = (val: any): string => {
  if (!val) return '';
  const str = String(val);
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.join(', ');
  } catch {}
  return str.replace(/[\[\]"]/g, '').trim();
};

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

function SectionHeader({ num, label, title, subtitle }: { num: string; label: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center space-y-3 max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200/80 px-3.5 py-1 rounded-full text-xs font-bold">
        <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">{num}</span>
        {label}
      </div>
      <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>}
    </div>
  );
}

// ======================= PAGE =======================

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('recherche');

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [locationType, setLocationType] = useState('');

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

  // Arrivée depuis une autre page (ex. footer) avec /?matiere=Maths
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get('matiere');
    if (m && SUBJECTS.includes(m)) setSelectedSubject(m);
  }, []);

  // Machine à écrire
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const fullText = TYPING_WORDS[currentWordIndex];
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
          setCurrentWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
          setTypingSpeed(120);
        }
      }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed]);

  // Chargement + filtrage
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
        let results: Professor[] = data || [];
        results = results.filter(p => {
          const email = (p.email || p.Email || '').toLowerCase().trim();
          if (p.is_admin === true) return false;
          if (email === 'berrada0amal@gmail.com' || email === 'louizisalaheddine@gmail.com') return false;
          return true;
        });

        if (selectedSubject) {
          const keywords = SUBJECT_KEYWORDS[selectedSubject] || [normalize(selectedSubject)];
          results = results.filter(p => {
            const mat = normalize(String(p.matiere || p.subject || ''));
            if (!mat) return false;
            return keywords.some(k => mat.includes(k));
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
  }, [selectedSubject, selectedLevel, priceRange, locationType]);

  const handleReset = () => {
    setSelectedSubject('');
    setSelectedLevel('');
    setPriceRange('');
    setLocationType('');
  };

  const handleSubjectClick = (subject: string) => {
    setSelectedSubject(prev => (prev === subject ? '' : subject));
    scrollToId('professeurs');
  };

  const handleFooterSubject = (subject: string) => {
    setSelectedSubject(subject);
    scrollToId('professeurs');
  };

  const selectClass =
    "w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:border-slate-700 focus:ring-4 focus:ring-slate-100 focus:outline-none transition duration-200 cursor-pointer";

  const dotGrid = {
    backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      <Navbar 
        isLoggedIn={false}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => {}}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* ================= HERO ================= */}
      <section className="bg-white border-b border-slate-200/60 py-16 lg:py-24 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-60" style={dotGrid} />
        <HeroBackground3D />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[700px] bg-orange-100/40 rounded-full blur-[160px] pointer-events-none -z-10" />

        {DECOR_SYMBOLS.slice(0, 4).map((d, i) => (
          <span key={i} aria-hidden className={`absolute font-serif font-black text-orange-200/50 select-none pointer-events-none ${d.cls}`}>
            {d.s}
          </span>
        ))}
        
        <div ref={heroRef} className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left lg:pl-12">
            
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200/80 px-4 py-1.5 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>N°1 du soutien scolaire sur mesure au Maroc</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight min-h-[140px] sm:min-h-[180px]">
              Trouvez le meilleur professeur <br />
              <span className="text-orange-600 inline-flex items-center">
                {currentText}
                <span className="inline-block w-1 h-8 sm:h-12 ml-1 bg-orange-500 animate-pulse"></span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Recherchez librement parmi nos professeurs qualifiés partout au Maroc. <strong className="text-slate-900 font-semibold">Aucun frais d'agence, 0 DH de commission</strong> : contactez directement votre enseignant idéal.
            </p>

            <div className="flex justify-center lg:justify-start pt-1">
              <button
                onClick={() => scrollToId('matieres')}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-7 py-4 rounded-2xl text-sm shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Trouver mon professeur
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm font-semibold">
              <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200/60">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Profils Vérifiés
              </span>
              <span className="flex items-center gap-2 text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-slate-700" />
                0 DH de frais
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

      {/* ================= STATS ================= */}
      <section className="bg-orange-50 border-y border-orange-100 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: "100%", l: "Sans frais d'agence" },
            { v: "Vérifiés", l: "Diplômes & identités" },
            { v: "Tout le Maroc", l: "Toutes les villes" },
            { v: "1er cours", l: "Généralement offert" },
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <p className="text-2xl lg:text-4xl font-black text-orange-600">{s.v}</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 1. MATIÈRES ================= */}
      <section id="matieres" className="relative overflow-hidden bg-slate-50 py-20 px-4 sm:px-8 scroll-mt-16">
        <div className="absolute inset-0 pointer-events-none opacity-70" style={dotGrid} />
        {DECOR_SYMBOLS.slice(2).map((d, i) => (
          <span key={i} aria-hidden className={`absolute font-serif font-black text-orange-200/40 select-none pointer-events-none ${d.cls}`}>
            {d.s}
          </span>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto space-y-10">
          <SectionHeader
            num="1"
            label="Matières"
            title="Explorez par matière populaire"
            subtitle="Cliquez sur la matière de votre choix pour afficher directement les enseignants disponibles."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {POPULAR_SUBJECTS.map((item, idx) => {
              const isActive = selectedSubject === item.filter;
              return (
                <button
                  key={idx}
                  onClick={() => handleSubjectClick(item.filter)}
                  className={`bg-white p-5 rounded-3xl border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-3 group cursor-pointer hover:-translate-y-1 ${
                    isActive ? 'border-orange-500 ring-4 ring-orange-100' : 'border-slate-200/80'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition duration-300`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h3>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-orange-600' : 'text-slate-500'}`}>
                      {isActive ? '✓ Sélectionnée' : item.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 2. PROFESSEURS ================= */}
      <section id="professeurs" className="bg-white border-y border-slate-200/60 py-20 px-4 sm:px-8 scroll-mt-16">
        <div className="max-w-[90rem] mx-auto space-y-10">
          <SectionHeader
            num="2"
            label="Professeurs"
            title="Nos professeurs au Maroc"
            subtitle="Affinez votre recherche : les résultats se mettent à jour automatiquement."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <aside className="lg:col-span-3 lg:sticky lg:top-24">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/85 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4 text-orange-600" />
                    Filtres
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

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Matière
                    </label>
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={selectClass}>
                      <option value="">Toutes les matières</option>
                      {SUBJECTS.map((sub, idx) => (
                        <option key={idx} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Niveau d'études
                    </label>
                    <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className={selectClass}>
                      <option value="">Tous les niveaux</option>
                      {LEVELS.map((lvl, idx) => (
                        <option key={idx} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Tarif horaire
                    </label>
                    <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className={selectClass}>
                      <option value="">Tous les tarifs</option>
                      <option value="0-100">Moins de 100 DH/h</option>
                      <option value="100-150">100 DH - 150 DH/h</option>
                      <option value="150-200">150 DH - 200 DH/h</option>
                      <option value="200+">Plus de 200 DH/h</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5" /> Lieu du cours
                    </label>
                    <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className={selectClass}>
                      <option value="">Tous les lieux</option>
                      <option value="domicile">À domicile</option>
                      <option value="en_ligne">En ligne</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-center">
                  <span className="font-bold bg-orange-100 text-orange-800 px-3.5 py-1.5 rounded-full text-xs inline-block">
                    {professors.length} professeur(s) trouvé(s)
                  </span>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-9">
              {loading ? (
                <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-16 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                  <p className="text-sm font-semibold text-slate-600">Recherche des professeurs en cours...</p>
                </div>
              ) : professors.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-16 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white text-slate-700 flex items-center justify-center mx-auto shadow-xs">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900">Aucun professeur trouvé</p>
                    <p className="text-xs text-slate-500">Aucun profil ne correspond à vos critères actuels.</p>
                  </div>
                  <button 
                    onClick={handleReset} 
                    className="bg-white text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      <Link
                        key={prof.id}
                        href={ROUTES.professor(prof.id)}
                        className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                      >
                        <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
                          {photo ? (
                            <img src={photo} alt={fullName} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center group-hover:scale-105 transition duration-700">
                              <div className="w-20 h-20 rounded-full bg-slate-600/60 border-2 border-slate-500/50 flex items-center justify-center text-slate-200 shadow-inner">
                                <User className="w-10 h-10 stroke-[1.5]" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Vérifié
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <h3 className="text-lg font-black tracking-tight">{fullName}</h3>
                            <p className="text-[11px] text-slate-200 font-medium flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-300" />
                              {city}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 space-y-4 flex flex-col justify-between flex-grow">
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
                              <strong className="text-slate-900">{subject}</strong> {levelText ? `- Niveau : ${levelText}. ` : ''}Professeur qualifié prêt à vous accompagner vers la réussite.
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-black text-slate-900">
                                {price} MAD<span className="text-[10px] font-normal text-slate-500">/h</span>
                              </div>
                              <div className="text-[10px] font-bold text-orange-700">1er cours offert</div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-orange-700 group-hover:gap-2 transition-all">
                              Voir le profil <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. AVANTAGES ================= */}
      <section className="relative overflow-hidden bg-slate-50 py-20 px-4 sm:px-8">
        <div className="absolute inset-0 pointer-events-none opacity-60" style={dotGrid} />
        <div className="relative z-10 max-w-7xl mx-auto space-y-12">
          <SectionHeader
            num="3"
            label="Avantages"
            title="Pourquoi choisir ProfMaroc ?"
            subtitle="Une plateforme simple, transparente et 100% gratuite pour les familles."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_US.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. COMMENT ÇA MARCHE ================= */}
      <section id="comment-ca-marche" className="bg-white border-y border-slate-200/60 py-20 px-4 sm:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto space-y-14">
          <SectionHeader
            num="4"
            label="En 3 étapes"
            title="Comment ça fonctionne ?"
            subtitle="Trouvez et contactez votre professeur en toute simplicité."
          />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div aria-hidden className="hidden md:block absolute top-[3.25rem] left-[16%] right-[16%] border-t-2 border-dashed border-orange-200" />
            {STEPS.map((step) => (
              <div key={step.n} className="relative bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200/80 shadow-md space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-md mx-auto ring-8 ring-white">
                  {step.n}
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. FAQ ================= */}
      <section id="faq" className="relative overflow-hidden bg-slate-50 py-20 px-4 sm:px-8 scroll-mt-16">
        <div className="absolute inset-0 pointer-events-none opacity-60" style={dotGrid} />
        <div className="relative z-10 max-w-4xl mx-auto space-y-12">
          <SectionHeader num="5" label="FAQ" title="Des questions ? Nous avons les réponses" />

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-6 text-left font-extrabold text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50"
                >
                  <span className="text-sm sm:text-base">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180 text-orange-600' : ''}`} />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-600">
            Une autre question ?{' '}
            <Link href={ROUTES.contact} className="font-extrabold text-orange-700 hover:text-orange-800 underline underline-offset-2">
              Contactez-nous
            </Link>
          </p>
        </div>
      </section>

      {/* ================= 6. BANNIÈRE PROFESSEURS (ORANGE) ================= */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16 px-4 sm:px-8 text-white relative overflow-hidden">
        <span aria-hidden className="absolute -left-4 -top-8 font-serif font-black text-[11rem] leading-none text-white/10 select-none pointer-events-none">∑</span>
        <span aria-hidden className="absolute -right-2 -bottom-10 font-serif font-black text-[11rem] leading-none text-white/10 select-none pointer-events-none">π</span>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
          <div className="space-y-5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 px-4 py-1.5 rounded-full text-xs font-bold">
              <UserPlus className="w-3.5 h-3.5" />
              Rejoignez notre réseau
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Vous êtes professeur ? Rejoignez ProfMaroc !
            </h2>
            <p className="text-sm sm:text-base text-orange-50 leading-relaxed">
              Créez votre profil, fixez vos tarifs librement et recevez directement les demandes des élèves près de chez vous.
            </p>
            <Link
              href={ROUTES.becomeTeacher}
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-orange-50 font-extrabold px-7 py-4 rounded-2xl text-xs sm:text-sm shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              Créer mon profil
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition duration-200" />
            </Link>
          </div>

          <ul className="space-y-3">
            {TEACHER_BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <li key={i} className="flex items-center gap-4 bg-white/15 border border-white/25 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold">{b.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <SiteFooter onSelectSubject={handleFooterSubject} onOpenHelp={() => setIsHelpOpen(true)} />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        helpSection={helpSection} 
        setHelpSection={setHelpSection} 
      />

    </main>
  );
}