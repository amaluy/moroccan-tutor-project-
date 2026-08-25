'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HelpModal from '../components/HelpModal';
import { 
  UserPlus, CheckCircle2, 
  ArrowRight, HelpCircle, Infinity,
  Wallet, Sparkles, PhoneCall, Clock, GraduationCap
} from 'lucide-react';

export default function TeachPage() {
  const router = useRouter(); // Initialisation du routeur pour la navigation
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('inscription');

  // MODIFIÉ : Redirige vers le formulaire de profil au lieu du paiement direct
  const handleGoToPayment = () => {
    router.push('/donner-cours/titre');
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <Navbar 
        isLoggedIn={false}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => {}}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* BANNIÈRE TOP : BOUTON ACCÈS RAPIDE "DEVENIR PROF" */}
      <div className="bg-gray-900 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-[#FF5733]" />
          Vous êtes enseignant ou étudiant tutorat ?
        </span>
        <button 
          onClick={handleGoToPayment}
          className="bg-[#FF5733] hover:bg-[#e04824] text-white px-3 py-1 rounded-lg font-bold text-xs transition shadow-sm inline-flex items-center gap-1 cursor-pointer"
        >
          Devenir prof <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="bg-gradient-to-b from-orange-50/70 via-white to-white py-16 lg:py-20 px-4 sm:px-8 relative overflow-hidden border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          {/* BADGE AVEC IMAGE LOCAL MAROC.PNG */}
          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#FF5733] border border-orange-200 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
            <img 
              src="/maroc.png" 
              alt="Drapeau du Maroc" 
              className="w-5 h-3.5 object-cover rounded-xs border border-orange-300" 
            />
            <span>Site 100 % Marocain</span>
          </div>

          {/* TITRE AXÉ SUR LA VRAIE VALEUR DU SITE */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight max-w-4xl mx-auto">
            Ne perdez plus votre temps à chercher des élèves. <br />
            <span className="text-[#FF5733]">Les demandes sont déjà là.</span>
          </h1>

          {/* PARAGRAPHE D'IMPACT */}
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto font-medium">
            Fini le casse-tête pour trouver des cours. Accédez directement à un <strong className="text-gray-900 font-bold">flux continu d'élèves (en ligne ou à domicile)</strong>. 
            Consultez leurs matières, leurs villes et leurs horaires, puis débloquez leurs numéros en un clic.
          </p>

          {/* DOUBLE BOUTON D'ACTION */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleGoToPayment} 
              className="w-full sm:w-auto bg-[#FF5733] hover:bg-[#e04824] text-white font-extrabold px-8 py-4 rounded-2xl text-base transition shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-5 h-5" />
              Devenir prof maintenant
            </button>
          </div>

          {/* BÉNÉFICES CLÉS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left max-w-4xl mx-auto">
            
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5733] flex items-center justify-center font-bold">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Numéros & contacts prêts</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Plus besoin de chercher des prospects. Les familles déposent leurs besoins précis avec leurs coordonnées réelles.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Selon vos horaires & votre zone</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                En ligne ou près de chez vous : vous choisissez uniquement les élèves qui correspondent parfaitement à votre planning.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Infinity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">0% de commission</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Fixez vos tarifs en toute liberté. La famille vous paye directement et vous gardez 100% de ce que vous gagnez.
              </p>
            </div>

          </div>

          {/* CARTE D'INSCRIPTION TEST (10 DH) */}
          <div className="pt-8 max-w-md mx-auto">
            <div className="bg-white p-6 rounded-3xl border-2 border-[#FF5733] shadow-xl relative overflow-hidden space-y-4">
              
              <div className="absolute top-0 right-0 bg-[#FF5733] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Offre d'essai Inscription
              </div>

              <div className="text-left space-y-1 pt-1">
                <p className="text-xs font-extrabold text-[#FF5733] uppercase tracking-wider">Accès d'essai au flux d'élèves</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900">10 DH</span>
                  <span className="text-xs text-gray-500 font-semibold">activation unique de votre profil</span>
                </div>
              </div>

              <ul className="text-left text-xs text-gray-600 space-y-2.5 border-t border-gray-100 pt-3 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>1er Lead offert (10 DH)</strong> pour contacter directement votre premier élève</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Visibilité permanente</strong> sur la plateforme pour recevoir des propositions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Recharge par pack (5 à 10 leads) uniquement quand vous voulez plus d'élèves</span>
                </li>
              </ul>

              <button
                onClick={handleGoToPayment} 
                className="w-full bg-[#FF5733] hover:bg-[#e04824] text-white font-extrabold py-3.5 rounded-2xl text-sm transition shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Devenir Prof (Essai 10 DH)
              </button>
            </div>
          </div>

          {/* MOYENS DE PAIEMENT */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600 font-semibold pt-2">
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <Wallet className="w-4 h-4 text-emerald-600" />
              Paiement simple par Cash Plus, Wafacash ou Virement
            </span>
          </div>

        </div>
      </section>

      {/* --- COMMENT ÇA MARCHE EN 3 ÉTAPES --- */}
      <section className="py-16 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-gray-900">
            Comment ça marche pour <span className="text-[#FF5733]">les professeurs ?</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Débloquez des contacts qualifiés en quelques clics sans perte de temps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5733] font-black flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-gray-900">Activez votre compte (10 DH)</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Inscrivez-vous pour rendre votre profil visible et obtenez <strong>1 lead de test inclus</strong> pour essayer la prise de contact.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5733] font-black flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-gray-900">Consultez les demandes</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Consultez les offres disponibles (niveau, matière, ville/ligne, horaire). Vous gardez le contrôle d'accepter ou de refuser.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF5733] font-black flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-gray-900">Contactez & Enseignez</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Débloquez le numéro de l'élève intéressé, appelez-le directement et commencez vos séances de cours.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer 
        onNavigateHome={() => {}} 
        onOpenHelp={() => setIsHelpOpen(false)} 
      />

      {/* MODAL AIDE */}
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        helpSection={helpSection} 
        setHelpSection={setHelpSection} 
      />

    </main>
  );
}