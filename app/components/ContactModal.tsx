'use client';

import { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  professor: {
    id: string;
    full_name: string;
    credits?: number; // Solde en DH du prof
  };
}

export default function ContactModal({ isOpen, onClose, professor }: ContactModalProps) {
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  // Si le prof n'a plus de crédits (< 10 DH)
  const isProfOutOfCredits = (professor.credits || 0) < 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProfOutOfCredits) return;

    setStatus('loading');

    try {
      // API call vers Supabase pour enregistrer le lead & débiter 10 DH du prof
      const res = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: professor.id,
          studentName,
          studentPhone,
          message,
        }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isProfOutOfCredits ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Professeur indisponible</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
              Ce professeur n'est pas disponible pour le moment pour recevoir de nouvelles demandes.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm"
            >
              Compris
            </button>
          </div>
        ) : status === 'success' ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Demande envoyée !</h3>
            <p className="text-sm text-gray-600">
              Votre message a été transmis à <strong>{professor.full_name}</strong>. Il vous recontactera directement sur votre téléphone.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#FF5A5F] text-white font-bold rounded-xl text-sm hover:bg-[#E0484C] transition"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-bold text-[#FF5A5F] uppercase tracking-wider">Contact Gratuit</span>
              <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">
                Envoyer un message à {professor.full_name}
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Votre Nom complet</label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ex: Youssef Benani"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A5F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Numéro de Téléphone (WhatsApp)</label>
              <input
                type="tel"
                required
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A5F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Votre besoin / Message</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Bonjour, je cherche des cours de soutien en Mathématiques pour le Bac..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A5F]"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{status === 'loading' ? 'Envoi en cours...' : 'Envoyer la demande'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}