'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronLeft, ArrowRight, ShieldCheck, GraduationCap, Users, KeyRound } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ConnexionPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<'landing' | 'about'>('landing');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isProfessor, setIsProfessor] = useState(false);
  const [professorData, setProfessorData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Étape 1 : Vérifier l'e-mail dans la base de données (Lecture seule)
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isPasswordEmpty = !data.password || String(data.password).trim() === '';

        if (isPasswordEmpty) {
          router.push(`/set-password?email=${encodeURIComponent(cleanEmail)}`);
        } else {
          setProfessorData(data);
          setIsProfessor(true);
          setIsLoading(false);
        }
      } else {
        setErrorMessage("Vous n'avez pas le droit de vous connecter. Cet e-mail n'est pas reconnu.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification :", err);
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  // Étape 2 : Vérifier le mot de passe et stocker l'ID dans le navigateur (LocalStorage)
  const handleProfessorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (professorData && professorData.password === password) {
      const cleanEmail = email.trim().toLowerCase();
      
      // Stockage local uniquement (aucun impact sur la base de données)
      localStorage.setItem('professor_email', cleanEmail);
      localStorage.setItem('professor_id', professorData.id);
      localStorage.setItem('professor_data', JSON.stringify(professorData));
      
      const isAdmin = professorData.is_admin === true || 
                    String(professorData.is_admin).toLowerCase() === 'true';

      if (isAdmin) {
        localStorage.setItem('is_admin', 'true');
        router.replace('/admin');
      } else {
        localStorage.removeItem('is_admin');
        router.replace('/prof');
      }
    } else {
      setErrorMessage("Mot de passe incorrect. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white">
      <Navbar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onOpenHelp={() => {}}
      />

      {currentPage === 'about' && (
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-16 text-center max-w-5xl mx-auto my-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            La 1ère plateforme de soutien scolaire sur-mesure au Maroc
          </h1>
          <button 
            onClick={() => setCurrentPage('landing')}
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl text-sm flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </button>
        </section>
      )}

      {currentPage === 'landing' && (
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center max-w-5xl mx-auto my-auto">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-8 text-xs font-bold text-[#FF5A5F]">
            <span className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-pulse" />
            <span>La 1ère communauté de soutien scolaire au Maroc</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl">
            L’excellence scolaire se construit ensemble
          </h1>

          <p className="text-base sm:text-lg text-gray-600 font-medium max-w-2xl mb-10">
            Les professeurs qualifiés et les meilleurs cours de soutien réunis sur une seule et même plateforme.
          </p>

          {!isProfessor ? (
            <form onSubmit={handleCheckEmail} className="w-full max-w-xl flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-2xl shadow-xl border border-gray-200/80 mb-4">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse e-mail" 
                className="w-full px-4 py-3.5 text-gray-800 placeholder-gray-400 bg-transparent text-sm sm:text-base focus:outline-none"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl text-sm shrink-0 shadow-md flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Vérification...' : "Se connecter"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleProfessorLogin} className="w-full max-w-xl flex flex-col gap-3 bg-white p-5 rounded-2xl shadow-xl border border-orange-200 mb-4 text-left">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Mot de passe requis</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setIsProfessor(false); setPassword(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Changer d'e-mail
                </button>
              </div>

              <p className="text-xs text-gray-600">
                Un compte protégé est associé à <b>{email}</b>. Veuillez entrer votre mot de passe :
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <input 
                  type="password" 
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe" 
                  className="w-full px-4 py-3.5 text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5A5F]"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl text-sm shrink-0 shadow-md flex items-center justify-center gap-2"
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