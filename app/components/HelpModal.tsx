'use client';

import React from 'react';
import { X, ChevronLeft, Info, XCircle, UserPlus } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  helpSection: string;
  setHelpSection: (section: string) => void;
}

export default function HelpModal({
  isOpen,
  onClose,
  helpSection,
  setHelpSection,
}: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar Nav */}
        <div className="w-full md:w-72 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6 shrink-0">
          <div 
            className="flex items-center gap-2 text-[#FF5A5F] font-bold text-sm cursor-pointer hover:underline"
            onClick={onClose}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour au site</span>
          </div>

          <div>
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
              Articles Élève
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setHelpSection('recherche')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  helpSection === 'recherche' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                Trouver un professeur
              </button>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
              Gérer mes demandes
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setHelpSection('acceptee')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition relative pl-5 ${
                  helpSection === 'acceptee' ? 'bg-white shadow-sm text-gray-900 border-l-4 border-[#FF5A5F]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                Demande acceptée
              </button>

              <button
                onClick={() => setHelpSection('refusee')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  helpSection === 'refusee' ? 'bg-white shadow-sm text-gray-900 border-l-4 border-[#FF5A5F]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                Demande refusée
              </button>

              <button
                onClick={() => setHelpSection('avis')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  helpSection === 'avis' ? 'bg-white shadow-sm text-gray-900 border-l-4 border-[#FF5A5F]' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                Laisser un avis
              </button>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
              Espace Enseignant
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setHelpSection('inscription')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  helpSection === 'inscription' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                S'inscrire comme professeur
              </button>
              <button
                onClick={() => setHelpSection('compte')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  helpSection === 'compte' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                Mon compte
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
          {helpSection === 'acceptee' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Demande acceptée</h2>
              <p className="text-base text-gray-700 leading-relaxed">Vous avez <strong className="text-[#FF5A5F]">sélectionné</strong> votre professeur, votre demande de cours a été <strong className="text-[#FF5A5F]">envoyée</strong> et le professeur l'a acceptée ; vous pouvez désormais échanger directement avec lui.</p>
              <p className="text-base text-gray-700 leading-relaxed">Connectez-vous sur votre espace ProfMaroc pour lui répondre. Plusieurs canaux sont disponibles pour discuter de votre premier cours (messagerie interne, téléphone ou e-mail).</p>
              <p className="text-base text-gray-700 leading-relaxed">Pour consulter les détails et coordonnées du professeur, rendez-vous sur son profil depuis votre messagerie instantanée.</p>
              <div className="bg-red-50/80 border border-red-100 rounded-2xl p-5 flex items-start gap-3 mt-6">
                <Info className="w-5 h-5 text-[#FF5A5F] shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800 leading-relaxed">Une fois votre demande validée, nous vous suggérons de lui <strong className="text-[#FF5A5F]">proposer un premier créneau</strong> en mentionnant directement vos disponibilités horaires.</p>
              </div>
            </div>
          )}

          {helpSection === 'refusee' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Demande refusée</h2>
              <p className="text-base text-gray-700 leading-relaxed">Si votre demande n'a pas été acceptée, ne vous inquiétez pas ! Cela survient généralement en raison d'un emploi du temps complet chez l'enseignant.</p>
              <p className="text-base text-gray-700 leading-relaxed">Notre équipe vous permet d'envoyer immédiatement une nouvelle demande à un autre professeur qualifié dans la même matière sans aucun frais supplémentaire.</p>
              <div className="bg-gray-100 rounded-2xl p-5 flex items-start gap-3 mt-6">
                <XCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">Conseil : N'hésitez pas à contacter 2 ou 3 professeurs en parallèle pour maximiser vos chances de trouver un créneau rapidement.</p>
              </div>
            </div>
          )}

          {helpSection === 'inscription' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE PROFESSEUR</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Comment puis-je m'inscrire en tant que professeur ?</h2>
              <p className="text-base text-gray-700 leading-relaxed">Rejoindre la communauté ProfMaroc est simple et rapide :</p>
              <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-gray-700">
                <li>Cliquez sur le bouton <strong>"Donner des cours"</strong> situé dans le menu supérieur.</li>
                <li>Remplissez votre profil en précisant vos diplômes, votre niveau et les matières enseignées.</li>
                <li>Fixez vos tarifs horaires et vos disponibilités.</li>
                <li>Notre équipe valide votre dossier sous 24h à 48h.</li>
              </ol>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3 mt-6">
                <UserPlus className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800 leading-relaxed">Un profil complet avec une jolie photo et une description détaillée reçoit jusqu'à 3 fois plus de demandes d'élèves !</p>
              </div>
            </div>
          )}

          {helpSection === 'recherche' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Comment trouver un professeur ?</h2>
              <p className="text-base text-gray-700 leading-relaxed">Utilisez simplement la barre de recherche sur la page d'accueil en saisissant la matière souhaitée (Maths, Anglais, SVT...) et votre ville. Vous pourrez ensuite filtrer les profils selon les tarifs, les avis et les niveaux proposées.</p>
            </div>
          )}

          {helpSection === 'avis' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">ARTICLE ÉLÈVE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Comment laisser un avis ?</h2>
              <p className="text-base text-gray-700 leading-relaxed">Après votre premier cours, une invitation vous sera envoyée directement dans votre messagerie pour évaluer le cours et laisser un commentaire sur le profil de votre enseignant.</p>
            </div>
          )}

          {helpSection === 'compte' && (
            <div className="space-y-6">
              <span className="text-xs font-bold text-[#FF5A5F] tracking-wide uppercase">MON COMPTE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Gérer mes informations personnelles</h2>
              <p className="text-base text-gray-700 leading-relaxed">Depuis votre tableau de bord, vous pouvez à tout moment modifier vos informations personnelles, changer votre mot de passe ou mettre à jour votre numéro de téléphone.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}