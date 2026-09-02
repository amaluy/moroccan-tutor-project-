'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronLeft, ArrowRight, ShieldCheck, GraduationCap, Users, Lock, KeyRound } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ConnexionPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<'landing' | 'about'>('landing');
  const [email, setEmail] = useState('berrada0amal@gmail.com');
  const [password, setPassword] = useState('');
  const [isProfessor, setIsProfessor] = useState(false);
  const [professorData, setProfessorData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Étape 1 : Vérifier si l'email appartient à un professeur
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      // On cherche si l'email existe dans la table professors
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (data) {
        // C'est un professeur ! On lui demande son mot de passe
        setProfessorData(data);
        setIsProfessor(true);
      } else {
        // Ce n'est pas un professeur, connexion classique (élève / utilisateur)
        localStorage.setItem('user_email', email.trim());
        
        if (email.trim().toLowerCase() === 'berrada0amal@gmail.com') {
          localStorage.setItem('is_admin', 'true');
        } else {
          localStorage.removeItem('is_admin');
        }
        localStorage.removeItem('professor_id');

        router.replace('/');
      }
    } catch (err) {
      console.error("Erreur lors de la vérification :", err);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Étape 2 : Vérifier le mot de passe du professeur
  const handleProfessorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    // On compare le mot de passe entré avec celui de la base de données
    if (professorData && professorData.password === password) {
      // Mot de passe correct ! On sauvegarde les infos du prof
      localStorage.setItem('user_email', email.trim());
      localStorage.setItem('professor_id', professorData.id);
      
      if (email.trim().toLowerCase() === 'berrada0amal@gmail.com') {
        localStorage.setItem('is_admin', 'true');
      }

      router.replace('/');
    } else {
      setErrorMessage("Mot de passe incorrect. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white">
      <Navbar 
        isLoggedIn={false}
        currentPage={currentPage}
        setCurrentPage={(page) => {
          if (page === 'about' || page === 'landing') {
            setCurrentPage(page);
          }
        }}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLoginClick={() => {}}
      />

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
            ProfMaroc a été créé avec une ambition simple : révolutionner le soutien scolaire au Maroc en offrant aux élèves et aux étudiants un accès direct aux meilleurs enseignants certifiés.
          </p>
          <button 
            onClick={() => setCurrentPage('landing')}
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>
        </section>
      )}

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

          {!isProfessor ? (
            /* FORMULAIRE ÉTAPE 1 : EMAIL */
            <form onSubmit={handleCheckEmail} className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-xl border border-gray-200/80 mb-4">
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
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl transition text-sm sm:text-base shrink-0 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Vérification...' : "S'inscrire / Se connecter"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* FORMULAIRE ÉTAPE 2 : MOT DE PASSE PROFESSEUR */
            <form onSubmit={handleProfessorLogin} className="w-full max-w-xl flex flex-col gap-3 bg-white p-5 rounded-2xl shadow-xl border border-orange-200 mb-4 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Espace Professeur détecté</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setIsProfessor(false); setPassword(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline cursor-pointer"
                >
                  Changer d'e-mail
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Bonjour, un compte professeur est associé à <b>{email}</b>. Veuillez entrer votre mot de passe pour vous connecter :
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <input 
                  type="password" 
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe professeur" 
                  className="w-full px-4 py-3.5 text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5A5F] font-medium"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl transition text-sm shrink-0 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLoading ? 'Connexion...' : 'Valider'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {errorMessage && (
            <p className="text-xs font-bold text-rose-500 mb-6 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-gray-500 font-semibold mt-4">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#FF5A5F]" /><span>Profs vérifiés & certifiés</span></div>
            <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#FF5A5F]" /><span>Tous niveaux scolaires</span></div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#FF5A5F]" /><span>Groupes & Cours particuliers</span></div>
          </div>
        </section>
      )}

      <Footer 
        onNavigateHome={() => setCurrentPage('landing')} 
        onOpenHelp={() => {}} 
      />
    </main>
  );
}