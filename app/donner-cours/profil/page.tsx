'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Briefcase, Award, ChevronRight, Smile } from 'lucide-react';
import Link from 'next/link';

export default function ProfilProfesseurPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    domaine: '',
    experience: '',
    ville: 'Casablanca'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validation : Tous les champs obligatoires doivent être remplis
  const isFormValid = 
    formData.prenom.trim() && 
    formData.nom.trim() && 
    formData.domaine.trim() && 
    formData.experience;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // 1. Sauvegarde des données du profil dans le localStorage
      localStorage.setItem('prof_prenom', formData.prenom);
      localStorage.setItem('prof_profil', JSON.stringify(formData));

      // 2. Redirection vers la page du titre de l'annonce
      router.push('/donner-cours/titre');
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du profil :", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCFD] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-red-50/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            prof<span className="text-[#FF5A5F]">maroc</span>
          </span>
        </Link>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start my-auto">
        
        {/* Colonne de gauche : À savoir */}
        <div className="lg:col-span-5 bg-white border border-red-100 p-8 rounded-[2.5rem] shadow-xl shadow-red-500/5 space-y-6 sticky top-8">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-[#FF5A5F] shadow-sm">
            <Smile className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sécurité & Confiance</h2>
            <div className="h-1 w-10 bg-[#FF5A5F] rounded-full" />
          </div>

          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
            Pour garantir la qualité et la simplicité sur <strong className="text-gray-900">ProfMaroc</strong>, l'inscription est rapide et se fait directement via votre profil.
          </p>
        </div>

        {/* Colonne de droite : Formulaire */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[2.5rem] border border-gray-200/80 shadow-xl shadow-gray-200/40 space-y-6">
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Parlons de <span className="text-[#FF5A5F]">vous</span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF5A5F]" /> Prénom
                </label>
                <input 
                  type="text"
                  name="prenom"
                  placeholder="Ex : Mohammed"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#FF5A5F]" /> Nom
                </label>
                <input 
                  type="text"
                  name="nom"
                  placeholder="Ex : Alami"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#FF5A5F]" /> Domaine principal
              </label>
              <input 
                type="text"
                name="domaine"
                placeholder="Ex : Sciences Mathématiques / Enseignant & Ingénieur"
                value={formData.domaine}
                onChange={handleChange}
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#FF5A5F]" /> Années d'expérience
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] transition"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="Moins d'un an">Moins d'un an</option>
                  <option value="1 à 3 ans">1 à 3 ans</option>
                  <option value="3 à 5 ans">3 à 5 ans</option>
                  <option value="Plus de 5 ans">Plus de 5 ans</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  Ville principale
                </label>
                <input 
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:border-[#FF5A5F] transition"
                />
              </div>
            </div>

            <div className="pt-6 flex items-center gap-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl transition cursor-pointer"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`flex-1 py-4 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  isFormValid 
                    ? 'bg-[#FF5A5F] hover:bg-[#E0484C] text-white shadow-red-500/20' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>{isLoading ? 'Enregistrement...' : 'Valider et continuer'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <footer className="w-full py-6 text-center text-xs text-gray-400 font-medium border-t border-gray-100">
        © 2026 ProfMaroc — Tous droits réservés.
      </footer>
    </main>
  );
}