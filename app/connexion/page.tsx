'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronLeft, ArrowRight, ShieldCheck, GraduationCap, Users, Target, Award } from 'lucide-react';

export default function ConnexionPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<'landing' | 'about'>('landing');
  const [email, setEmail] = useState('berradaOamal@gmail.com');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() !== '') {
      // router.replace remplace la page de connexion dans l'historique.
      // Ainsi, le bouton "Retour" depuis l'accueil quitte le site au lieu de revenir ici.
      router.replace('/'); 
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
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-md"
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