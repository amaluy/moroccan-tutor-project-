'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '../components/Footer';
import HelpModal from '../components/HelpModal';
import ProfNavbar from './profNavbar';
import { supabase } from '@/lib/supabase';
import { 
  Search, MapPin, BookOpen, CheckCircle2, 
  Filter, ShieldCheck, PhoneCall,
  GraduationCap, DollarSign, Laptop, Home, 
  Award, Loader2, RefreshCcw, User
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

export default function ProfPage() {
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

  // Machine à écrire fluide
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

  const levels = [
    "Primaire", "Collège", "Secondaire", "Niveau Supérieur"
  ];

  // Chargement des professeurs avec exclusion stricte des administrateurs
  useEffect(() => {
    let isMounted = true;

    const loadProfessors = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('professors')
          .select('*')
          .or('is_admin.is.null,is_admin.eq.false')
          .not('email', 'in', '("berrada0amal@gmail.com","louizisalaheddine@gmail.com")');

        if (!isMounted) return;

        if (error) {
          console.error('Erreur Supabase:', error);
          setProfessors([]);
        } else {
          let results = data || [];

          results = results.filter(p => {
            const email = (p.email || p.Email || '').toLowerCase().trim();
            if (p.is_admin === true) return false;
            if (email === 'berrada0amal@gmail.com' || email === 'louizisalaheddine@gmail.com') return false;
            return true;
          });

          const normalize = (text: string) => {
            return text
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]/g, "");
          };

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
        if (isMounted) console.error('Erreur de chargement:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfessors();

    return () => {
      isMounted = false;
    };
  }, [selectedSubject, selectedCity, selectedLevel, priceRange, locationType]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setSelectedSubject('');
    setSelectedCity('');
    setSelectedLevel('');
    setPriceRange('');
    setLocationType('');
  };

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-700 selection:text-white">
      
      <ProfNavbar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onOpenHelp={() => setIsHelpOpen(true)}
        onSelectCity={(city) => {
          setSelectedCity(city === "En ligne" ? "" : city);
          if(city === "En ligne") setLocationType("en_ligne");
        }}
        onSelectSubject={(subject) => setSelectedSubject(subject)}
      />

      <>
        <section className="bg-white border-b border-slate-200/60 py-16 lg:py-24 px-4 sm:px-8 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[700px] bg-slate-100/60 rounded-full blur-[160px] pointer-events-none -z-10" />
          
          <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left lg:pl-12">
              
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight">
                Trouvez le meilleur professeur <br />
                <span className="text-purple-600 inline-block min-w-[280px]">
                  {currentText}
                  <span className="inline-block w-1 h-8 sm:h-12 ml-1 bg-purple-500 animate-pulse align-middle"></span>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Recherchez librement parmi nos meilleurs professeurs qualifiés. <strong className="text-slate-900 font-semibold">Aucun frais d'agence, aucun paiement requis</strong> : contactez directement votre professeur en un clic.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm font-semibold pt-2">
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
                  alt="Illustration Design" 
                  className="w-full h-auto object-contain mix-blend-multiply scale-125"
                />
              </div>
            </div>

          </div>
        </section>

        <section className="max-w-[90rem] mx-auto px-4 sm:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
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
                  
                  const fullName = (nomField || prenomField)
                    ? `${prenomField} ${nomField}`.trim()
                    : (prof.name || 'Professeur');

                  const photo = prof.photo_URL || prof.photo_url || prof.photo || prof.avatar_url;
                  const city = prof.ville || prof.city || "Maroc";
                  const subject = prof.matiere || prof.subject || "Soutien scolaire";
                  const price = Number(prof.tarif !== undefined && prof.tarif !== null ? prof.tarif : prof.price) || 0;

                  return (
                    <div key={prof.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                      
                      <div className="relative h-72 w-full bg-slate-900 overflow-hidden">
                        {photo ? (
                          <img 
                            src={photo} 
                            alt={fullName} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition duration-700">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
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
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full text-[10px]">
                              Disponible
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                            <strong className="text-slate-900">{subject}</strong> - {prof.niveau ? `Niveau : ${prof.niveau}. ` : ''} Professeur qualifié prêt à vous accompagner vers la réussite.
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
      </>

      <Footer 
        onNavigateHome={() => {}} 
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