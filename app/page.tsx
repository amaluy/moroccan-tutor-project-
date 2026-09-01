'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { supabase } from '@/lib/supabase';
import { 
  Search, MapPin, BookOpen, CheckCircle2, 
  Filter, ShieldCheck, PhoneCall,
  GraduationCap, DollarSign, Laptop, Home, 
  Award, Loader2, BadgeCheck, ChevronRight, UserPlus, RefreshCcw
} from 'lucide-react';

interface Professor {
  id: string;
  Nom?: string;
  Prénom?: string;
  nom?: string;
  prenom?: string;
  name?: string;
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

  // Effet Machine à écrire fluide (Typewriter avec un curseur gris)
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
          // Pause avant d'effacer
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

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('professors').select('*');

      if (error) {
        console.error('Erreur Supabase:', error);
        setProfessors([]);
      } else {
        let results = data || [];

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
      console.error('Erreur de chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

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
    setTimeout(() => {
      fetchProfessors();
    }, 50);
  };

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-700 selection:text-white">
      
      <Navbar 
        isLoggedIn={false}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => {}}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* HERO SECTION - Effet machine à écrire en gris moderne */}
      <section className="bg-white border-b border-slate-200/60 py-16 lg:py-24 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[700px] bg-slate-100/60 rounded-full blur-[160px] pointer-events-none -z-10" />
        
        <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left lg:pl-12">
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.2] tracking-tight min-h-[140px] sm:min-h-[180px]">
              Trouvez le meilleur professeur <br />
              <span className="text-slate-700 inline-flex items-center">
                {currentText}
                <span className="inline-block w-1 h-8 sm:h-12 ml-1 bg-slate-400 animate-pulse"></span>
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

          <div className="lg:col-span-6 relative w-full">
            <div className="relative group w-full px-2 sm:px-0">
              <div className="absolute -inset-3 bg-gradient-to-r from-slate-200 to-slate-400 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white w-full bg-white transform group-hover:-translate-y-1 transition duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200" 
                  alt="Cours particulier" 
                  className="w-full h-[280px] sm:h-[420px] object-cover transform group-hover:scale-105 transition duration-700 ease-out"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION FILTRES ET RESULTATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANNEAU DE FILTRAGE */}
        <aside className="lg:col-span-4 space-y-6">
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

            {/* Matière */}
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

            {/* Ville */}
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

            {/* Niveau d'études */}
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

            {/* Tarif horaire */}
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

            {/* Lieu du cours */}
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
        <div className="lg:col-span-8 space-y-6">
          
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
            <div className="space-y-4">
              {professors.map((prof) => {
                const nomField = prof.Nom || prof.nom || '';
                const prenomField = prof.Prénom || prof.prenom || '';
                
                const fullName = (nomField || prenomField)
                  ? `${prenomField} ${nomField}`.trim()
                  : (prof.name || 'Professeur');

                const photo = prof.photo_URL || prof.photo_url || prof.photo || prof.avatar_url;
                const city = prof.ville || prof.city || "Maroc";
                const subject = prof.matiere || prof.subject;
                const level = prof.niveau || prof.level;
                const price = prof.tarif !== undefined && prof.tarif !== null ? prof.tarif : prof.price;

                return (
                  <div 
                    key={prof.id} 
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between relative overflow-hidden group transform hover:-translate-y-0.5"
                  >
                    <div className="flex gap-4 items-start sm:items-center">
                      
                      {photo ? (
                        <img 
                          src={photo} 
                          alt={fullName} 
                          className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-slate-100 shadow-xs group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center text-xl font-black shrink-0 border-2 border-slate-100 shadow-xs group-hover:scale-105 transition duration-500">
                          {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'P'}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-700 transition duration-200">{fullName}</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
                            <BadgeCheck className="w-3 h-3 text-emerald-600" /> Profil Vérifié
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {city}
                        </p>

                        <div className="flex flex-wrap gap-1.5 items-center text-[11px]">
                          {subject && (
                            <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
                              {subject}
                            </span>
                          )}
                          {level && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                                {level}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex sm:flex-col justify-between items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-lg font-black text-slate-900">
                          {price !== undefined && price !== null && price !== "" ? `${price} DH/h` : "Prix sur demande"}
                        </span>
                      </div>

                      <Link 
                        href={`/professeurs/${prof.id}`}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-xs hover:shadow-md active:scale-95 group/btn"
                      >
                        Voir le profil
                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition duration-200" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </section>

      {/* BANNIÈRE "ÊTES-VOUS PROFESSEUR ?" */}
      <section className="bg-slate-900 py-16 px-4 sm:px-8 text-white relative overflow-hidden shadow-inner">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-slate-800 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-200 border border-slate-700 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
            <UserPlus className="w-3.5 h-3.5 text-slate-300" />
            <span>Rejoignez notre réseau</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Vous êtes professeur ? Rejoignez-nous !
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Créez votre profil gratuitement, fixez vos tarifs et recevez directement les demandes des élèves près de chez vous.
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

      {/* SECTION EXPLICATIONS DU SITE */}
      <section className="bg-white border-t border-slate-200/60 py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Comment ça fonctionne ?</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">Trouvez et contactez votre professeur en toute simplicité en 3 étapes clés.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/70 shadow-2xs space-y-4 hover:border-slate-400 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-900 flex items-center justify-center font-black text-base shadow-xs group-hover:scale-110 transition duration-300">1</div>
              <h3 className="font-bold text-slate-900 text-base">Trouvez votre prof</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Utilisez les filtres pour dénicher le professeur idéal selon votre matière, votre ville et vos exigences.</p>
            </div>
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/70 shadow-2xs space-y-4 hover:border-slate-400 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-900 flex items-center justify-center font-black text-base shadow-xs group-hover:scale-110 transition duration-300">2</div>
              <h3 className="font-bold text-slate-900 text-base">Contactez directement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Échangez sans intermédiaire ni commission d'agence avec le professeur pour organiser vos cours.</p>
            </div>
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/70 shadow-2xs space-y-4 hover:border-slate-400 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-900 flex items-center justify-center font-black text-base shadow-xs group-hover:scale-110 transition duration-300">3</div>
              <h3 className="font-bold text-slate-900 text-base">Progressez sereinement</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Suivez vos cours à domicile ou en ligne et progressez à votre rythme vers la réussite scolaire.</p>
            </div>
          </div>
        </div>
      </section>

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