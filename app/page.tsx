'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';
import { supabase } from '@/lib/supabase';
import { 
  Search, MapPin, BookOpen, CheckCircle2, 
  Sparkles, Filter, ShieldCheck, PhoneCall,
  GraduationCap, DollarSign, Laptop, Home, 
  Award, Loader2, BadgeCheck, ChevronRight
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

  const subjects = [
    "Maths", "Physique", "Physique et Chimie", "Arabe", "Anglais", 
    "Français", "Coach sportif", "SVT", "Étude supérieur"
  ];

  const levels = [
    "Primaire", "Collège", "Secondaire", "Niveau Supérieur"
  ];

  // Fonction de récupération et de filtrage intelligent
  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('professors').select('*');

      if (error) {
        console.error('Erreur Supabase:', error);
        setProfessors([]);
      } else {
        let results = data || [];

        // Fonction utilitaire pour nettoyer les textes (enlève les accents, met en minuscules, supprime les espaces/tirets)
        const normalize = (text: string) => {
          return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Enlève les accents
            .replace(/[^a-z0-9]/g, ""); // Garde uniquement les lettres et chiffres (gère les mots collés comme 'primairecollege')
        };

        // 1. Filtre Matière
        if (selectedSubject) {
          const cleanSub = normalize(selectedSubject);
          results = results.filter(p => {
            const mat = normalize(String(p.matiere || p.subject || ''));
            return mat.includes(cleanSub) || cleanSub.includes(mat);
          });
        }

        // 2. Filtre Ville (Intelligent : gère "casa" <-> "casablanca")
        if (selectedCity.trim()) {
          const cleanCity = normalize(selectedCity);
          results = results.filter(p => {
            const city = normalize(String(p.ville || p.city || ''));
            if (!city) return false;
            
            if (city.includes(cleanCity) || cleanCity.includes(city)) return true;
            
            // Équivalence Casa / Casablanca
            if ((cleanCity.includes('casa')) && (city.includes('casa'))) {
              return true;
            }
            return false;
          });
        }

        // 3. Filtre Niveau (Ultra-souple : gère les mots collés type "primairecollege")
        if (selectedLevel) {
          const cleanLvl = normalize(selectedLevel);
          results = results.filter(p => {
            const lvl = normalize(String(p.niveau || p.level || ''));
            if (!lvl) return true; // Si vide dans la base, on ne bloque pas
            return lvl.includes(cleanLvl) || cleanLvl.includes(lvl);
          });
        }

        // 4. Filtre Tarif
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

        // 5. Filtre Lieu (Optionnel : si aucun lieu n'est stocké, on laisse passer)
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
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      <Navbar 
        isLoggedIn={false}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => {}}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* HERO SECTION */}
      <section className="bg-white border-b border-gray-100 py-12 lg:py-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF5733] border border-orange-200/60 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5733]" />
              <span>Plateforme 100% Gratuite pour les Élèves & Parents</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              Trouvez le <span className="text-[#FF5733]">Professeur Particulier Idéal</span> au Maroc.
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Recherchez librement parmi nos meilleurs professeurs qualifiés. <strong className="text-gray-900">Aucun frais d'agence, aucun paiement requis de la part de l'élève</strong> : contactez directement votre professeur.
            </p>

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

          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 max-w-md w-full">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
                alt="Cours particulier" 
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FILTRES ET RESULTATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANNEAU DE FILTRAGE */}
        <aside className="lg:col-span-4 space-y-6">
          <form onSubmit={handleApplyFilters} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5 sticky top-20">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4 text-[#FF5733]" />
                Filtrer les professeurs
              </h3>
              <button 
                type="button" 
                onClick={handleReset} 
                className="text-[11px] text-[#FF5733] hover:underline font-medium cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>

            {/* Matière */}
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

            {/* Ville */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5733]" />
                Ville
              </label>
              <input 
                type="text" 
                placeholder="Ex: Casablanca, Rabat..." 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            {/* Niveau d'études */}
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

            {/* Tarif horaire */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#FF5733]" />
                Tarif horaire
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

            {/* Lieu du cours */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Lieu du cours</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType(locationType === 'domicile' ? '' : 'domicile')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    locationType === 'domicile' ? 'bg-orange-50 border-[#FF5733] text-[#FF5733]' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <Home className="w-4 h-4 mb-1" />
                  À domicile
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType(locationType === 'en_ligne' ? '' : 'en_ligne')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                    locationType === 'en_ligne' ? 'bg-orange-50 border-[#FF5733] text-[#FF5733]' : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <Laptop className="w-4 h-4 mb-1" />
                  En ligne
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#FF5733] hover:bg-[#e04824] text-white font-extrabold py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Appliquer les filtres
            </button>

          </form>
        </aside>

        {/* LISTE DES RÉSULTATS */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF5733]" />
              Nos Professeurs au Maroc
            </h2>
            <span className="font-semibold text-gray-400">{professors.length} professeur(s) trouvé(s)</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#FF5733] animate-spin" />
              <p className="text-sm font-semibold text-gray-600">Recherche des professeurs en cours...</p>
            </div>
          ) : professors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <p className="text-base font-bold text-gray-800">Aucun professeur trouvé</p>
              <p className="text-xs text-gray-500">Aucun profil ne correspond exactement à vos critères de recherche.</p>
              <button 
                onClick={handleReset} 
                className="bg-orange-50 text-[#FF5733] text-xs font-bold px-4 py-2 rounded-xl border border-orange-200 hover:bg-orange-100 transition cursor-pointer"
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
                    className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between relative overflow-hidden"
                  >
                    <div className="flex gap-4 items-start sm:items-center">
                      
                      {photo ? (
                        <img 
                          src={photo} 
                          alt={fullName} 
                          className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-orange-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-[#FF5733] text-white flex items-center justify-center text-xl font-black shrink-0 border-2 border-orange-100 shadow-sm">
                          {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'P'}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">{fullName}</h3>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3 text-emerald-600" /> Profil Vérifié
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF5733]" />
                          {city}
                        </p>

                        <div className="flex flex-wrap gap-1.5 items-center text-[11px]">
                          {subject && (
                            <span className="bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded-md">
                              {subject}
                            </span>
                          )}
                          {level && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-[#FF5733] font-semibold">
                                {level}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex sm:flex-col justify-between items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-base font-black text-gray-900">
                          {price !== undefined && price !== null && price !== "" ? `${price} DH/h` : "Prix sur demande"}
                        </span>
                      </div>

                      <Link 
                        href={`/professeurs/${prof.id}`}
                        className="bg-[#FF5733] hover:bg-[#e04824] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1 shadow-sm"
                      >
                        Voir le profil
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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