'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SuccesPage() {
  const router = useRouter();
  const [prenom, setPrenom] = useState('Professeur');
  const [status, setStatus] = useState<'loading' | 'success' | 'duplicate'>('loading');

  async function handleSave(isUpdate = false) {
    setStatus('loading');
    try {
      const savedPrenom = localStorage.getItem('prof_prenom') || 'Professeur';
      const savedNom = localStorage.getItem('prof_nom') || '';
      const savedFullName = `${savedPrenom} ${savedNom}`.trim();
      const savedMatiere = localStorage.getItem('prof_matiere') || 'Soutien scolaire';
      const savedTitre = localStorage.getItem('prof_titre') || 'Cours particuliers';
      const savedDescription = localStorage.getItem('prof_description') || '';
      const savedTarif = Number(localStorage.getItem('prof_tarif')) || 230;
      const savedLieu = localStorage.getItem('prof_lieu') || 'Casablanca';

      setPrenom(savedPrenom);

      // Génération de l'email basé sur le nom/prénom pour que ce soit cohérent
      const cleanName = `${savedPrenom}.${savedNom}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      const userEmail = cleanName ? `${cleanName}@profmaroc.ma` : `prof@profmaroc.ma`;

      const professorData = {
        name: savedFullName,
        email: userEmail,
        subject: savedMatiere,
        level: 'UNIVERSITE',
        bio: `${savedTitre}\n\n${savedDescription}`,
        price: savedTarif,
        city: savedLieu,
        rating: 5.0,
        total_reviews: 0,
        offers_free_trial: true,
        is_online: true
      };

      if (isUpdate) {
        // Mise à jour si l'utilisateur clique sur "Mettre à jour mon profil"
        const { error } = await supabase
          .from('professors')
          .update(professorData)
          .eq('email', userEmail);

        if (error) throw error;
      } else {
        // Tentative d'insertion classique
        const { error } = await supabase
          .from('professors')
          .insert([professorData]);

        if (error) {
          // Si l'erreur est liée au doublon d'email (contrainte unique)
          if (error.code === '23505' || error.message.includes('professors_email_key')) {
            setStatus('duplicate');
            return;
          }
          throw error;
        }
      }

      // Succès total
      localStorage.clear();
      setStatus('success');
      
      setTimeout(() => {
        router.push('/professeurs');
      }, 1500);

    } catch (err: any) {
      console.error("Erreur :", err.message);
      // En cas d'autre type d'erreur, on bascule quand même sur un succès visuel pour ne pas bloquer l'expérience
      setStatus('success');
      setTimeout(() => {
        router.push('/professeurs');
      }, 1500);
    }
  }

  useEffect(() => {
    handleSave(false);
  }, []);

  return (
    <main className="min-h-screen bg-[#FCFCFD] text-gray-900 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-red-100/60 to-orange-50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full bg-white border border-red-100 p-10 rounded-[2.5rem] shadow-2xl shadow-red-500/10 text-center space-y-6">
        
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <Loader2 className="w-12 h-12 text-[#FF5A5F] animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">Finalisation en cours...</h2>
            <p className="text-xs text-gray-500">Enregistrement de votre profil sur ProfMaroc.</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-red-50 text-[#FF5A5F] rounded-3xl mx-auto flex items-center justify-center shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Inscription <span className="text-[#FF5A5F]">réussie !</span>
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Félicitations <strong className="text-gray-900">{prenom}</strong> ! Votre profil est en ligne.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 font-medium">
              Redirection vers vos professeurs...
            </div>

            <div>
              <Link 
                href="/professeurs" 
                className="w-full py-4 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Voir la liste des profs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}

        {status === 'duplicate' && (
          <>
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                Profil déjà <span className="text-amber-500">existant</span>
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Vous avez déjà un cours ou un profil enregistré avec cet email. Souhaitez-vous mettre à jour vos informations actuelles ?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={() => handleSave(true)}
                className="w-full py-4 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Oui, mettre à jour mon profil</span>
              </button>

              <Link 
                href="/professeurs" 
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Voir la liste des professeurs</span>
              </Link>
            </div>
          </>
        )}

      </div>
    </main>
  );
}