'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';

export default function ContacterProfesseur() {
  const params = useParams();
  const router = useRouter();
  const professorId = params?.id as string;

  const [loadingProfessor, setLoadingProfessor] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [professorEmail, setProfessorEmail] = useState('');
  const [professorName, setProfessorName] = useState('');

  // États du formulaire adaptés (formulé du point de vue de l'élève)
  const [formData, setFormData] = useState({
    student_name: '',
    student_family_name: '',
    student_phone: '',
    student_adress: '',
    student_ville: '',
    student_age: '',
    student_price_monthly: '',
    private_school: 'Non',
    message: '',
    student_subjects: '',
    student_grade: '',
  });

  // 1. Récupérer l'email et le nom du professeur concerné
  useEffect(() => {
    if (!professorId) return;

    const fetchProfessorInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('professors')
          .select('email, Email, Nom, nom, Prénom, prenom, name')
          .eq('id', professorId)
          .single();

        if (data && !error) {
          const email = data.email || data.Email || '';
          const nom = data.Nom || data.nom || '';
          const prenom = data.Prénom || data.prenom || '';
          const name = (nom || prenom) ? `${prenom} ${nom}`.trim() : (data.name || 'Professeur');

          setProfessorEmail(email);
          setProfessorName(name);
        }
      } catch (err) {
        console.error('Erreur récupération professeur:', err);
      } finally {
        setLoadingProfessor(false);
      }
    };

    fetchProfessorInfo();
  }, [professorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Soumission du formulaire et insertion dans la table `leads` avec `lead_date` (timestamptz)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from('leads').insert([
        {
          professor_email: professorEmail,
          student_name: formData.student_name,
          student_family_name: formData.student_family_name,
          student_phone: formData.student_phone,
          student_adress: formData.student_adress,
          student_ville: formData.student_ville,
          student_age: formData.student_age ? Number(formData.student_age) : null,
          student_price_monthly: formData.student_price_monthly ? Number(formData.student_price_monthly) : null,
          private_school: formData.private_school,
          status: 'pending', // 'pending' pour qu'apparaisse dans les demandes en attente du prof
          message: formData.message,
          student_subjects: formData.student_subjects,
          student_grade: formData.student_grade,
          lead_date: new Date().toISOString(), // Stocke le timestamp exact en base de données
        },
      ]);

      if (error) {
        console.error('Erreur insertion lead:', error);
        alert("Une erreur est survenue lors de l'envoi de votre demande.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Erreur technique:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProfessor) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 max-w-md w-full space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Demande envoyée avec succès !</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Votre demande a bien été transmise à <span className="font-bold text-slate-800">{professorName}</span>. Il vous contactera très prochainement.
          </p>
          <Link 
            href="/" 
            className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl text-xs transition"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <Link href={`/professeurs/${professorId}`} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" /> Retour au profil de {professorName}
        </Link>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contacter {professorName}</h1>
            <p className="text-xs text-slate-500 mt-1">Remplissez ce formulaire pour planifier vos cours particuliers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Votre prénom</label>
                <input 
                  type="text" 
                  name="student_name" 
                  required 
                  value={formData.student_name} 
                  onChange={handleChange}
                  placeholder="Ex: Yassine"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Votre nom</label>
                <input 
                  type="text" 
                  name="student_family_name" 
                  required 
                  value={formData.student_family_name} 
                  onChange={handleChange}
                  placeholder="Ex: Alami"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Votre téléphone</label>
                <input 
                  type="text" 
                  name="student_phone" 
                  required 
                  value={formData.student_phone} 
                  onChange={handleChange}
                  placeholder="Ex: 0600000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Votre âge</label>
                <input 
                  type="number" 
                  name="student_age" 
                  value={formData.student_age} 
                  onChange={handleChange}
                  placeholder="Ex: 16"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Votre ville</label>
                <input 
                  type="text" 
                  name="student_ville" 
                  required 
                  value={formData.student_ville} 
                  onChange={handleChange}
                  placeholder="Ex: Casablanca"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Votre adresse</label>
                <input 
                  type="text" 
                  name="student_adress" 
                  value={formData.student_adress} 
                  onChange={handleChange}
                  placeholder="Ex: Maarif, Rue X"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Matières souhaitées</label>
                <input 
                  type="text" 
                  name="student_subjects" 
                  value={formData.student_subjects} 
                  onChange={handleChange}
                  placeholder="Ex: Mathématiques"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Votre niveau scolaire</label>
                <input 
                  type="text" 
                  name="student_grade" 
                  value={formData.student_grade} 
                  onChange={handleChange}
                  placeholder="Ex: Lycée / Collège"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Budget mensuel (DH)</label>
                <input 
                  type="number" 
                  name="student_price_monthly" 
                  value={formData.student_price_monthly} 
                  onChange={handleChange}
                  placeholder="Ex: 1000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Scolarisé en école privée ?</label>
              <select 
                name="private_school" 
                value={formData.private_school} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
              >
                <option value="Non">Non</option>
                <option value="Oui">Oui</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Message / Précisions</label>
              <textarea 
                name="message" 
                rows={4} 
                value={formData.message} 
                onChange={handleChange}
                placeholder="Décrivez vos besoins spécifiques..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-[#ff2d55] hover:bg-[#e02447] text-white font-extrabold py-3.5 rounded-2xl text-sm transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer la demande
            </button>

          </form>
        </div>

      </div>
    </main>
  );
}