'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StudentRequestPage() {
  const searchParams = useSearchParams();
  const professorEmail = searchParams.get('prof') || '';

  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!professorEmail) {
      setError("Erreur : Aucun professeur spécifié pour cette demande.");
      setLoading(false);
      return;
    }

    try {
      // On insère directement dans la table "leads"
      const { error: dbError } = await supabase
        .from('leads')
        .insert([
          {
            professor_email: professorEmail,
            student_name: studentName,
            student_phone: studentPhone,
            subject: subject,
            status: 'pending' // En attente de validation par le prof
          }
        ]);

      if (dbError) throw dbError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">Demande envoyée !</h2>
          <p className="text-gray-600">
            Votre demande a bien été transmise au professeur. Il va l'étudier et vous contactera très rapidement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Contacter ce professeur
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Remplissez ce formulaire pour demander un cours. Le professeur vous appellera directement.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Votre Nom</label>
            <input
              type="text"
              required
              placeholder="Ex: Mohamed Alami"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Votre Numéro de Téléphone</label>
            <input
              type="tel"
              required
              placeholder="Ex: 0612345678"
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Matière / Message</label>
            <textarea
              required
              placeholder="Ex: Cours de Maths pour niveau Terminale..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer la demande au professeur'}
          </button>
        </form>
      </div>
    </div>
  );
}