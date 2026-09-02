'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const targetEmail = email.trim();

    if (!targetEmail) {
      setError('Veuillez entrer une adresse e-mail.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Configuration Supabase manquante dans le fichier .env.local.");
      setLoading(false);
      return;
    }

    try {
      console.log("Mise à jour du mot de passe pour:", targetEmail);

      // 1. Mettre à jour le mot de passe et récupérer les données (dont is_admin et id)
      const { data, error: dbError } = await supabase
        .from('professors')
        .update({ password: password })
        .ilike('email', targetEmail)
        .select()
        .single();

      if (dbError) {
        console.error("Erreur Supabase:", dbError);
        throw dbError;
      }

      // 2. Enregistrement de la session dans le localStorage
      localStorage.setItem('user_email', targetEmail);

      // 3. Vérification robuste du rôle admin pour rediriger vers /admin ou /prof/dashboard
      const isAdmin = data && (
        data.is_admin === true || 
        String(data.is_admin).toLowerCase() === 'true'
      );

      if (isAdmin) {
        localStorage.setItem('is_admin', 'true');
        localStorage.removeItem('professor_id');
        router.replace('/admin');
      } else {
        localStorage.setItem('professor_id', data.id);
        localStorage.removeItem('is_admin');
        router.replace('/prof/dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Créez votre mot de passe
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Définissez votre mot de passe pour accéder à votre espace sur ProfMaroc.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Votre e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="professeur@gmail.com"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors mt-2 cursor-pointer"
          >
            {loading ? 'Traitement en cours...' : 'Activer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}