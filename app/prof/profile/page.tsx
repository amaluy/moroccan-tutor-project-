'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Save, Loader2, CheckCircle, AlertCircle, MapPin, BookOpen, DollarSign, GraduationCap } from 'lucide-react';

export default function ProfProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [professorData, setProfessorData] = useState({
    id: '',
    nom: '',
    prenom: '',
    matiere: '',
    ville: '',
    niveau: '',
    tarif: '',
    lieu: '',
    photo_url: '',
  });

  useEffect(() => {
    async function fetchProfessorProfile() {
      try {
        setLoading(true);
        setMessage(null);

        // 1. Récupérer l'ID ou l'e-mail stocké dans le localStorage lors de la connexion
        const savedId = localStorage.getItem('professor_id');
        const savedEmail = localStorage.getItem('user_email');

        let query = supabase.from('professors').select('*');

        if (savedId) {
          query = query.eq('id', savedId);
        } else if (savedEmail) {
          query = query.ilike('email', savedEmail.trim());
        } else {
          setMessage({ type: 'error', text: 'Aucune session active trouvée. Veuillez vous reconnecter.' });
          setLoading(false);
          return;
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('Erreur Supabase:', error);
          setMessage({ type: 'error', text: 'Impossible de charger vos données de profil.' });
        } else if (data) {
          // Sauvegarder l'ID pour les prochaines fois
          localStorage.setItem('professor_id', data.id);

          setProfessorData({
            id: data.id || '',
            nom: data.nom || data.Nom || '',
            prenom: data.prenom || data.Prénom || '',
            matiere: data.matiere || data.subject || '',
            ville: data.ville || data.city || '',
            niveau: data.niveau || data.level || '',
            tarif: data.tarif !== undefined && data.tarif !== null ? data.tarif : (data.price || ''),
            lieu: data.lieu || data.location || '',
            photo_url: data.photo_url || data.photo_URL || data.avatar_url || '',
          });
        } else {
          setMessage({ type: 'error', text: 'Profil professeur introuvable dans la base de données.' });
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err);
        setMessage({ type: 'error', text: 'Erreur lors du chargement de vos informations.' });
      } finally {
        setLoading(false);
      }
    }

    fetchProfessorProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfessorData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorData.id) {
      setMessage({ type: 'error', text: 'ID introuvable. Impossible d’enregistrer.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('professors')
        .update({
          nom: professorData.nom,
          prenom: professorData.prenom,
          matiere: professorData.matiere,
          ville: professorData.ville,
          niveau: professorData.niveau,
          tarif: professorData.tarif ? Number(professorData.tarif) : null,
          lieu: professorData.lieu,
          photo_url: professorData.photo_url,
        })
        .eq('id', professorData.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (err) {
      console.error('Erreur MAJ:', err);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de vos informations.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF5733] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/85 shadow-sm p-8 space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Mon Profil Professeur</h2>
            <p className="text-xs text-slate-500 mt-1">Modifiez vos informations personnelles visibles par les élèves sur le site.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5733] flex items-center justify-center font-bold">
            <User className="w-6 h-6" />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Prénom</label>
              <input 
                type="text" 
                name="prenom" 
                value={professorData.prenom} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Nom</label>
              <input 
                type="text" 
                name="nom" 
                value={professorData.nom} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#FF5733]" /> Matière
              </label>
              <input 
                type="text" 
                name="matiere" 
                value={professorData.matiere} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5733]" /> Ville
              </label>
              <input 
                type="text" 
                name="ville" 
                value={professorData.ville} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#FF5733]" /> Niveau d'études enseigné
              </label>
              <input 
                type="text" 
                name="niveau" 
                value={professorData.niveau} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#FF5733]" /> Tarif horaire (MAD)
              </label>
              <input 
                type="number" 
                name="tarif" 
                value={professorData.tarif} 
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
              />
            </div>

          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">URL de la photo de profil</label>
            <input 
              type="text" 
              name="photo_url" 
              value={professorData.photo_url} 
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:bg-white focus:border-[#FF5733] focus:outline-none transition"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-6 py-3.5 rounded-xl transition duration-200 shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer les modifications
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}