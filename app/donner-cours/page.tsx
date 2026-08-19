'use client';

import Link from 'next/link';

export default function DonnerCoursPage() {
  return (
    <main className="min-h-screen bg-[#FFFDF7] flex flex-col justify-between p-6">
      
      {/* Header avec Logo */}
      <header className="max-w-7xl mx-auto w-full py-4">
        <Link href="/" className="text-2xl font-extrabold text-[#FF5A5F] tracking-tight">
          profmaroc
        </Link>
      </header>

      {/* Contenu principal */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-auto py-8">
        
        {/* Colonne gauche : Texte explicatif */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Donner des cours,<br />vivre de sa passion !
          </h1>

          <p className="text-gray-600 text-sm leading-relaxed max-w-md">
            Bienvenue sur la plus grande communauté de professeurs particuliers au Maroc où des milliers d'élèves trouvent chaque jour le prof parfait pour leurs cours particuliers.
          </p>

          <div className="space-y-3 text-sm font-semibold text-gray-800 pt-2">
            <p className="flex items-center gap-2">
              <span>🥂</span> Donnez vos cours <strong>en ligne ou en face à face</strong>
            </p>
            <p className="flex items-center gap-2">
              <span>💸</span> <strong>Fixez vos tarifs</strong> comme vous voulez
            </p>
            <p className="flex items-center gap-2">
              <span>🔷</span> <strong>Organisez</strong> votre emploi du temps
            </p>
          </div>

          <p className="text-xs text-gray-500 pt-4">
            Étudiants, enseignants, autodidactes, passionnés, diplômés, professionnels... Inscrivez-vous sur <strong>profmaroc</strong> et commencez dès aujourd'hui !
          </p>
        </div>

        {/* Colonne droite : Formulaire d'inscription */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-md w-full mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Créez votre profil
          </h2>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] text-sm"
            />

            <button 
              type="submit" 
              className="w-full py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl transition text-sm shadow-md"
            >
              Inscription par e-mail
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-gray-400 font-medium">ou</span>
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-medium text-sm text-gray-700 transition flex items-center justify-center gap-2">
              Inscription avec Google
            </button>
            <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-medium text-sm text-gray-700 transition flex items-center justify-center gap-2">
              Inscription avec Apple
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            Vous avez déjà un compte ? <Link href="#" className="font-bold text-gray-800 hover:underline">Connexion</Link>
          </p>
        </div>

      </div>

      {/* Footer minimaliste */}
      <footer className="text-center text-xs text-gray-400 py-4">
        © 2026 ProfMaroc. Tous droits réservés.
      </footer>
    </main>
  );
}