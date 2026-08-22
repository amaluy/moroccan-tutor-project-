'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Users, BookOpen, CheckCircle, Trash2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // On récupère l'email et on le met en minuscules pour éviter les erreurs de majuscules (ex: berradaOamal)
    const userEmail = (localStorage.getItem('user_email') || '').toLowerCase().trim();
    const isAdmin = localStorage.getItem('is_admin');

    // On accepte ton email peu importe les majuscules, ou si le flag admin est présent
    if (userEmail === 'berrada0amal@gmail.com' || isAdmin === 'true') {
      setAuthorized(true);
      // On s'assure que le localStorage est bien configuré pour les prochaines fois
      localStorage.setItem('user_email', 'berrada0amal@gmail.com');
      localStorage.setItem('is_admin', 'true');
    } else {
      alert("Accès refusé : Réservé aux administrateurs.");
      router.push('/');
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
        Vérification des accès administrateur...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Top Header Admin */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 text-white rounded-xl">
            <ShieldAlert className="w-6 h-6 text-[#FF5A5F]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Espace Administration</h1>
            <p className="text-xs text-gray-500">Connecté en tant que : <span className="font-semibold text-gray-800">berrada0amal@gmail.com</span></p>
          </div>
        </div>

        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au site</span>
        </Link>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-4 bg-red-50 text-[#FF5A5F] rounded-2xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Professeurs</p>
              <h3 className="text-2xl font-black">24</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Annonces Élèves</p>
              <h3 className="text-2xl font-black">12</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Statut du Système</p>
              <h3 className="text-lg font-black text-green-600">Actif & Sécurisé</h3>
            </div>
          </div>
        </div>

        {/* Section de gestion */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Panneau de modération rapide</h2>
          <p className="text-sm text-gray-600 mb-6">
            Bienvenue dans ton espace de contrôle ProfMaroc. D'ici tu peux superviser l'ensemble des interactions de la plateforme.
          </p>
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="text-xs text-gray-400 font-mono">Mode Administrateur Master activé</span>
            <button 
              onClick={() => {
                localStorage.clear();
                router.push('/connexion');
              }}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#FF5A5F] font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Réinitialiser la session</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}