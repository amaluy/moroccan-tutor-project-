'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';
import HelpModal from '../../components/HelpModal';
import { supabase } from '@/lib/supabase';
import { 
  MapPin, Star, Share2, Heart, Loader2, 
  ArrowLeft, Calendar, Clock, Save, Edit3, Check
} from 'lucide-react';

export default function ProfessorPrivateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('recherche');

  // Identifiants et emails
  const [profEmail, setProfEmail] = useState<string>('samielidrissi@gmail.com');
  const [professorId, setProfessorId] = useState<any>(null);

  // États modifiables
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matiere, setMatiere] = useState('');
  const [ville, setVille] = useState('');
  const [niveau, setNiveau] = useState('');
  const [tarif, setTarif] = useState<number | string>('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [bio, setBio] = useState('');
  
  // Données d'affichage
  const [createdAt, setCreatedAt] = useState('');
  const [totalEtoiles, setTotalEtoiles] = useState('15 étoiles');
  const [age, setAge] = useState('24 ans');
  const [statut, setStatut] = useState('Professeur Confirmé');
  const [typeCours, setTypeCours] = useState('domicile');
  const [experience, setExperience] = useState('1-3ans');
  const [dernierDiplome, setDernierDiplome] = useState('Licence / Master');
  const [profession, setProfession] = useState('etudiant');
  const [availabilities, setAvailabilities] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfessorProfile = async () => {
      setLoading(true);
      try {
        const rawEmail = localStorage.getItem('professor_email') || 'samielidrissi@gmail.com';
        setProfEmail(rawEmail);

        const { data: allProfs, error } = await supabase.from('professors').select('*');

        if (error) {
          console.error("Erreur Supabase:", error);
        } else if (allProfs && allProfs.length > 0) {
          const cleanTarget = rawEmail.toLowerCase().replace(/[\s.]/g, '');

          const matchedProf = allProfs.find((p: any) => {
            const emailField = p.email || p.Email;
            if (!emailField) return false;
            const dbEmailClean = emailField.toLowerCase().replace(/[\s.]/g, '');
            return dbEmailClean === cleanTarget;
          });

          if (matchedProf) {
            setProfessorId(matchedProf.id);
            fillData(matchedProf);
          } else {
            const defaultProf = allProfs[allProfs.length - 1];
            setProfessorId(defaultProf.id);
            fillData(defaultProf);
          }
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessorProfile();
  }, []);

  const fillData = (data: any) => {
    setNom(data.Nom || data.nom || '');
    setPrenom(data.Prénom || data.prenom || '');
    setMatiere(data.matiere || data.subject || data.Matiere || '');
    setVille(data.ville || data.city || data.Ville || '');
    setNiveau(data.niveau || data.level || data.Niveau || '');
    setTarif(data.tarif !== undefined && data.tarif !== null ? data.tarif : (data.price || data.Tarif || '250'));
    // Utilisation du bon nom de colonne avec majuscules
    setPhotoUrl(data.photo_URL || data.photo_url || data.photo || data.avatar_url || '');
    setBio(data.bio && data.bio !== 'EMPTY' ? data.bio : '');
    setCreatedAt(data.created_at || '');
    setTotalEtoiles(data.total_etoiles || '15 étoiles');
    setAge(data.age || '24 ans');
    setStatut(data.statut || 'Professeur Confirmé');
    setTypeCours(data.type_cours || 'domicile');
    setExperience(data.experience || '1-3ans');
    setDernierDiplome(data.dernier_diplome || 'Licence / Master');
    setProfession(data.profession || 'etudiant');

    const disp = data.disponibilites || data.Disponibilites;
    if (Array.isArray(disp)) {
      setAvailabilities(disp);
    } else if (typeof disp === 'string') {
      try {
        const parsed = JSON.parse(disp);
        if (Array.isArray(parsed)) setAvailabilities(parsed);
      } catch {
        const cleaned = disp.replace(/[{}]/g, '');
        setAvailabilities(cleaned.split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, '')));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    try {
      if (!professorId) {
        throw new Error("ID du professeur introuvable pour la mise à jour.");
      }

      // Utilisation exacte de 'photo_URL', 'Nom', 'Prénom' selon votre base Supabase
      const { error } = await supabase
        .from('professors')
        .update({
          Nom: nom,
          Prénom: prenom,
          matiere: matiere,
          ville: ville,
          niveau: niveau,
          tarif: Number(tarif),
          photo_URL: photoUrl, 
          bio: bio,
        })
        .eq('id', professorId);

      if (error) throw error;

      setSuccessMessage('Modifications enregistrées ! Redirection...');
      
      setTimeout(() => {
        router.push('/');
      }, 1200);

    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      alert(`Erreur lors de la sauvegarde: ${err.message || 'Erreur inconnue'}`);
      setSaving(false);
    }
  };

  const fullName = `${prenom} ${nom}`.trim() || 'Professeur';
  const displayPrice = Number(tarif) || 250;

  const formatSlot = (slot: string) => {
    const parts = slot.split('-');
    if (parts.length !== 2) return slot;
    const [time, day] = parts;
    const dayMap: Record<string, string> = { lu: 'Lundi', ma: 'Mardi', me: 'Mercredi', je: 'Jeudi', ve: 'Vendredi', sa: 'Samedi', di: 'Dimanche' };
    const timeMap: Record<string, string> = { matin: 'Matin', midi: 'Midi', apresmidi: 'Après-midi', 'apres-midi': 'Après-midi' };
    return `${dayMap[day.toLowerCase()] || day} (${timeMap[time.toLowerCase()] || time})`;
  };

  const createdAtFormatted = createdAt 
    ? new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "28 août 2026";

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Chargement de votre profil...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans flex flex-col justify-between relative overflow-x-hidden">
      
      <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold">
          <Edit3 className="w-4 h-4 text-rose-400" /> Mon Espace Professeur ({profEmail})
        </div>
        <div className="flex items-center gap-4">
          {successMessage && (
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-pulse">
              <Check className="w-4 h-4" /> {successMessage}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Enregistrer les modifications
          </button>
        </div>
      </div>

      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex items-center justify-between sticky top-[45px] z-30">
        <Link href="/prof" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>
        <span className="text-xs font-black tracking-wider text-slate-900 flex items-center gap-1">
          <span className="text-rose-500 text-base">🎓</span> profmaroc
        </span>
      </header>

      <div className="w-full relative border-b border-slate-200/40 pt-10 pb-16 min-h-[420px] flex items-center bg-[#faf9f6]">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img src="/minimaal.jpg" alt="Arrière-plan minimaliste" className="w-full h-full object-cover opacity-35" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap gap-2 items-center">
              <input 
                type="text" 
                value={matiere} 
                onChange={(e) => setMatiere(e.target.value)} 
                placeholder="Matière"
                className="bg-rose-500 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm outline-none border border-rose-400 capitalize w-44"
              />
              <span className="text-[11px] text-slate-400 italic">← modifiable</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <input 
                type="text" 
                value={prenom} 
                onChange={(e) => setPrenom(e.target.value)} 
                placeholder="Prénom"
                className="text-3xl sm:text-4xl font-black text-slate-900 bg-white/80 border border-slate-300 rounded-xl px-3 py-1.5 outline-none capitalize shadow-xs w-auto min-w-[180px]"
              />
              <input 
                type="text" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                placeholder="Nom"
                className="text-3xl sm:text-4xl font-black text-slate-900 bg-white/80 border border-slate-300 rounded-xl px-3 py-1.5 outline-none capitalize shadow-xs w-auto min-w-[180px]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Profil créé le {createdAtFormatted}</span>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900">Lieux du cours & Ville</h3>
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200/80 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 shadow-xs">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Chez le professeur :</span>
                <input 
                  type="text" 
                  value={ville} 
                  onChange={(e) => setVille(e.target.value)} 
                  placeholder="Ville"
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-900 outline-none w-32 lowercase"
                />
              </div>
            </div>

            <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200/80 px-5 py-3 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-400">Tarif horaire (DH) :</span>
              <input 
                type="number" 
                value={tarif} 
                onChange={(e) => setTarif(e.target.value)} 
                className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-base font-black text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center lg:items-end gap-3">
            <div className="w-full max-w-sm h-[280px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              {photoUrl ? (
                <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-4xl">
                  {getInitials(fullName)}
                </div>
              )}
            </div>
            <div className="w-full max-w-sm space-y-1">
              <label className="text-[11px] font-bold text-slate-600">Lien URL de la photo :</label>
              <input 
                type="text" 
                value={photoUrl} 
                onChange={(e) => setPhotoUrl(e.target.value)} 
                placeholder="Collez le lien de votre photo ici..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 outline-none shadow-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">À propos du cours (Niveau)</h3>
            <input 
              type="text" 
              value={niveau} 
              onChange={(e) => setNiveau(e.target.value)} 
              placeholder="ex: lyceecollege"
              className="w-full max-w-sm bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-800 outline-none shadow-xs"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900">Créneaux de disponibilité</h3>
            {availabilities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucune disponibilité renseignée pour le moment.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {availabilities.map((slot, index) => (
                  <div key={index} className="bg-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {formatSlot(slot)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl sticky top-24 space-y-6 z-20">
            <div className="flex justify-end gap-2 text-slate-400">
              <button className="p-2 hover:bg-slate-50 rounded-full transition"><Heart className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-slate-50 rounded-full transition"><Share2 className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <h2 className="text-xl font-black text-slate-900 capitalize">{fullName.toLowerCase()}</h2>
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>5</span>
                <span className="text-slate-400 font-normal">(1 avis)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black text-slate-900">Votre biographie (Modifiable)</h3>
              <textarea 
                rows={4}
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Écrivez votre description détaillée ici..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 outline-none focus:bg-white transition"
              />
            </div>

            <div className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Tarif</span>
                <span className="text-base font-black text-slate-900">{displayPrice} DH</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Total des étoiles</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {totalEtoiles}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Âge</span>
                <span className="font-bold text-slate-800">{age}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Statut</span>
                <span className="font-bold text-slate-800">{statut}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Type de cours</span>
                <span className="font-bold text-slate-800">{typeCours}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Expérience</span>
                <span className="font-bold text-slate-800">{experience}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Niveau enseigné</span>
                <span className="font-bold text-slate-800">{niveau || 'lyceecollege'}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Dernier diplôme</span>
                <span className="font-bold text-slate-800">{dernierDiplome}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-400">Profession</span>
                <span className="font-bold text-slate-800">{profession}</span>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#ff2d55] hover:bg-[#e02447] text-white font-extrabold py-3.5 rounded-2xl text-sm transition shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>

      <Footer onNavigateHome={() => {}} onOpenHelp={() => setIsHelpOpen(true)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} helpSection={helpSection} setHelpSection={setHelpSection} />
    </main>
  );
}