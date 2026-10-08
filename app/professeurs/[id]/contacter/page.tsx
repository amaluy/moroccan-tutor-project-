'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

interface Professor {
  id: string;
  Nom?: string;
  Prénom?: string;
  nom?: string;
  prenom?: string;
  name?: string;
  email?: string;
  Email?: string;
}

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 
  'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 
  'Salé', 'El Jadida', 'Mohammedia', 'Beni Mellal', 'Nador', 'Saffi'
];

export default function ContacterProfesseur() {
  const params = useParams();
  const router = useRouter();
  const professorId = params?.id as string;

  const [loadingProfessor, setLoadingProfessor] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [professorEmail, setProfessorEmail] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [professorSubjects, setProfessorSubjects] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    student_name: '',
    student_family_name: '',
    student_phone: '',
    student_adress: '',
    student_ville: 'Casablanca',
    student_age: '',
    student_price_monthly: '',
    private_school: 'Non',
    message: '',
    student_subjects: '',
    student_grade: 'Lycée',
  });

  useEffect(() => {
    if (!professorId) return;

    const fetchProfessorInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('professors')
          .select('*')
          .eq('id', professorId)
          .single();

        if (data && !error) {
          const email = data.email || data.Email || '';
          const nom = data.Nom || data.nom || '';
          const prenom = data.Prénom || data.prenom || '';
          const name = (nom || prenom) ? `${prenom} ${nom}`.trim() : (data.name || 'Professeur');

          setProfessorEmail(email);
          setProfessorName(name);

          const rawSubject = data.matiere || data.subject || "Français";
          let subjectsList: string[] = [];
          if (Array.isArray(rawSubject)) {
            subjectsList = rawSubject;
          } else if (typeof rawSubject === 'string') {
            try {
              const parsed = JSON.parse(rawSubject);
              subjectsList = Array.isArray(parsed) ? parsed : [rawSubject];
            } catch {
              subjectsList = rawSubject.replace(/^\{|\}$/g, '').replace(/"/g, '').split(',').map((s: string) => s.trim());
            }
          }
          setProfessorSubjects(subjectsList);
          if (subjectsList.length > 0) {
            setFormData(prev => ({ ...prev, student_subjects: subjectsList[0] }));
          }
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        professor_email: professorEmail,
        student_name: formData.student_name,
        student_family_name: formData.student_family_name,
        student_phone: formData.student_phone,
        student_adress: formData.student_adress,
        student_ville: formData.student_ville,
        'student age': formData.student_age ? Number(formData.student_age) : null,
        student_price_monthly: formData.student_price_monthly ? Number(formData.student_price_monthly) : null,
        private_school: formData.private_school === 'Oui',
        status: 'pending',
        is_read: false, // Définit explicitement is_read à false par défaut
        message: formData.message,
        'student subjects': formData.student_subjects ? [formData.student_subjects] : [],
        'student grade': formData.student_grade,
        lead_date: new Date().toISOString(),
      };

      const { error } = await supabase.from('leads').insert([payload]);

      if (error) {
        console.error('Détail Erreur Supabase:', error);
        alert(`Erreur d'insertion: ${error.message || JSON.stringify(error)}`);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Erreur technique:', err);
      alert("Une erreur technique est survenue.");
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

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contacter {professorName}</h1>
            <p className="text-xs text-slate-500 mt-1">Remplissez ce formulaire pour planifier vos cours particuliers.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Prénom</label>
                <input 
                  type="text" 
                  name="student_name" 
                  required 
                  value={formData.student_name} 
                  onChange={handleChange}
                  placeholder="Yassine"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Nom</label>
                <input 
                  type="text" 
                  name="student_family_name" 
                  required 
                  value={formData.student_family_name} 
                  onChange={handleChange}
                  placeholder="Alami"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Téléphone</label>
                <input 
                  type="text" 
                  name="student_phone" 
                  required 
                  value={formData.student_phone} 
                  onChange={handleChange}
                  placeholder="0600000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Âge</label>
                <input 
                  type="number" 
                  name="student_age" 
                  value={formData.student_age} 
                  onChange={handleChange}
                  placeholder="16"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Ville</label>
                <select 
                  name="student_ville" 
                  value={formData.student_ville} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Adresse</label>
                <input 
                  type="text" 
                  name="student_adress" 
                  value={formData.student_adress} 
                  onChange={handleChange}
                  placeholder="Ex: Rue Mohammed V, Quartier..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Matières souhaitées</label>
                <select 
                  name="student_subjects" 
                  value={formData.student_subjects} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition capitalize"
                >
                  {professorSubjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Niveau scolaire</label>
                <select 
                  name="student_grade" 
                  value={formData.student_grade} 
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-slate-900 focus:outline-none transition"
                >
                  <option value="Lycée">Lycée</option>
                  <option value="Collège">Collège</option>
                  <option value="Primaire">Primaire</option>
                  <option value="Lycée / Collège">Lycée / Collège</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase">Budget mensuel (DH)</label>
                <input 
                  type="number" 
                  name="student_price_monthly" 
                  value={formData.student_price_monthly} 
                  onChange={handleChange}
                  placeholder="1000"
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