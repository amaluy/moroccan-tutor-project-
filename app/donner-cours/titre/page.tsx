'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Award, Briefcase, 
  User, Calendar, UserCheck, ChevronRight, Camera, X, Upload, Mail, Phone, AlertCircle,
  Crown, Star, Award as AwardIcon, Sparkles, MapPin, Navigation, Coins, Clock, Info, Laptop, Home as HomeIcon
} from 'lucide-react';
import Link from 'next/link';

// Configuration des badges selon l'expérience
const EXPERIENCE_BADGES: Record<string, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  debutant: {
    label: 'Professeur Passionné',
    icon: Sparkles,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Bienvenue ! Votre enthousiasme est votre plus grand atout pour faire progresser vos élèves.'
  },
  '1-3ans': {
    label: 'Professeur Confirmé',
    icon: AwardIcon,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Vous possédez une solide expérience pédagogique et une méthodologie éprouvée.'
  },
  '3-5ans': {
    label: 'Professeur Expert',
    icon: Star,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Excellente maîtrise du programme et accompagnement sur-mesure reconnu.'
  },
  '5plus': {
    label: 'Professeur Ambassadeur',
    icon: Crown,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: 'Statut Prestige ! Votre grande expertise fait de vous un pilier de notre communauté.'
  }
};

const DAYS = [
  { id: 'lu', label: 'Lu' },
  { id: 'ma', label: 'Ma' },
  { id: 'me', label: 'Me' },
  { id: 'je', label: 'Je' },
  { id: 've', label: 'Ve' },
  { id: 'sa', label: 'Sa' },
  { id: 'di', label: 'Di' }
];

const PERIODS = [
  { id: 'matin', label: 'Matin' },
  { id: 'midi', label: 'Midi' },
  { id: 'apresmidi', label: 'Après-midi' }
];

export default function ProfilProfesseurPage() {
  const router = useRouter();

  // États du formulaire
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [age, setAge] = useState('');
  const [ville, setVille] = useState('');
  const [profession, setProfession] = useState('');
  const [matiere, setMatiere] = useState('');
  const [diplome, setDiplome] = useState('');
  const [experience, setExperience] = useState('');
  
  // Nouveaux états : Type de cours & Tarif
  const [typeCours, setTypeCours] = useState<string[]>(['domicile', 'enligne']); // par défaut les deux
  const [tarifHoraire, setTarifHoraire] = useState('');

  // Déplacement & distance
  const [distanceMax, setDistanceMax] = useState<string>('0');
  const [fraisDeplacement, setFraisDeplacement] = useState<string>('0');

  // Planning / Disponibilité
  const [disponibilites, setDisponibilites] = useState<string[]>([
    'matin-sa', 'matin-di',
    'midi-sa', 'midi-di',
    'apresmidi-lu', 'apresmidi-ma', 'apresmidi-me', 'apresmidi-je', 'apresmidi-ve', 'apresmidi-sa', 'apresmidi-di'
  ]);

  // Coordonnées & Photo
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState(''); 
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Gestion multi-sélection Type de cours
  const toggleTypeCours = (id: string) => {
    if (typeCours.includes(id)) {
      if (typeCours.length === 1) return; // Empêcher de tout décocher
      setTypeCours(typeCours.filter(item => item !== id));
    } else {
      setTypeCours([...typeCours, id]);
    }
  };

  // Toggle de la sélection des créneaux
  const toggleDisponibilite = (periodId: string, dayId: string) => {
    const key = `${periodId}-${dayId}`;
    if (disponibilites.includes(key)) {
      setDisponibilites(disponibilites.filter((item) => item !== key));
    } else {
      setDisponibilites([...disponibilites, key]);
    }
  };

  // Formatting & restriction du téléphone marocain
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, ''); 
    if (raw.startsWith('0')) {
      raw = raw.substring(1);
    }
    if (raw.length <= 9) {
      setTelephone(raw);
    }
  };

  // Traitement d'image & compression
  const processImageFile = (file: File) => {
    setImageError(null);
    const MAX_SIZE_MB = 5;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        const head = 'data:image/jpeg;base64,';
        const sizeInBytes = Math.round((compressedBase64.length - head.length) * 3 / 4);

        if (sizeInBytes > MAX_BYTES) {
          setImageError("La photo dépasse 5 Mo. Veuillez choisir un fichier plus léger.");
        } else {
          setImagePreview(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageError(null);
  };

  const isPhoneValid = telephone.length === 9;

  const isValid = 
    nom.trim() !== '' && 
    prenom.trim() !== '' && 
    age.trim() !== '' && 
    ville.trim() !== '' &&
    profession.trim() !== '' && 
    matiere.trim() !== '' && 
    diplome.trim() !== '' && 
    experience.trim() !== '' &&
    tarifHoraire.trim() !== '' &&
    typeCours.length > 0 &&
    email.trim() !== '' && 
    isPhoneValid &&
    imagePreview !== null;

  const currentBadge = experience ? EXPERIENCE_BADGES[experience] : null;

  const handleNext = async () => {
    if (!isValid) return;
    setIsLoading(true);

    try {
      const fullPhone = `+212${telephone}`;
      console.log("Profil prof créé :", { 
        nom, prenom, age, ville, profession, matiere, diplome, experience, 
        typeCours, tarifHoraire: `${tarifHoraire} DH/h`,
        statut: currentBadge?.label, distanceMax: `${distanceMax} km`, fraisDeplacement: `${fraisDeplacement} DH`, 
        disponibilites, email, telephone: fullPhone, imagePreview 
      });
      router.push('/donner-cours/description');
    } catch (err) {
      console.error("Erreur :", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFCFD] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-red-50/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            prof<span className="text-[#FF5A5F]">maroc</span>
          </span>
        </Link>
      </header>

      {/* Contenu principal : Formulaire Centré */}
      <div className="flex-1 max-w-2xl mx-auto px-6 py-8 w-full my-auto space-y-8">
        
        {/* Titre Centré */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Présentez-vous aux <span className="text-[#FF5A5F]">élèves</span>
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Un profil clair et bien renseigné rassure les parents et vous permet de trouver rapidement des élèves.
          </p>
        </div>

        {/* Formulaire Aéré */}
        <div className="space-y-6">
          
          {/* 1. INFORMATIONS PERSONNELLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Prénom
              </label>
              <input 
                type="text"
                placeholder="Ex : Youssef"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Nom
              </label>
              <input 
                type="text"
                placeholder="Ex : El Amrani"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Âge
              </label>
              <input 
                type="number"
                placeholder="Ex : 24"
                min="18"
                max="99"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Ville
              </label>
              <input 
                type="text"
                placeholder="Ex : Casablanca, Rabat, Marrakech..."
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#FF5A5F]" />
              Profession actuelle
            </label>
            <input 
              type="text"
              placeholder="Ex : Étudiant en Médecine, Ingénieur, Prof..."
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
            />
          </div>

          {/* 2. PARCOURS ACADÉMIQUE */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#FF5A5F]" />
              Matière(s) enseignée(s)
            </label>
            <input 
              type="text"
              placeholder="Ex : Mathématiques, Physique-Chimie, Français..."
              value={matiere}
              onChange={(e) => setMatiere(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#FF5A5F]" />
              Dernier diplôme ou Niveau d'études
            </label>
            <input 
              type="text"
              placeholder="Ex : Licence en Mathématiques / Élève-Ingénieur à l'EHTP"
              value={diplome}
              onChange={(e) => setDiplome(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
            />
          </div>

          {/* SÉLECTION EXPÉRIENCE & BADGE */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Expérience dans le soutien scolaire
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
              >
                <option value="">Sélectionnez votre expérience...</option>
                <option value="debutant">Débutant (Moins d'1 an)</option>
                <option value="1-3ans">1 à 3 ans d'expérience</option>
                <option value="3-5ans">3 à 5 ans d'expérience</option>
                <option value="5plus">Plus de 5 ans d'expérience</option>
              </select>
            </div>

            {currentBadge && (
              <div className={`p-4 rounded-2xl border ${currentBadge.bg} ${currentBadge.border} transition-all duration-300 animate-in fade-in slide-in-from-top-2`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0 ${currentBadge.color}`}>
                    <currentBadge.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black uppercase tracking-wider ${currentBadge.color}`}>
                        Statut attribué :
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full bg-white border ${currentBadge.border} ${currentBadge.color}`}>
                        {currentBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      {currentBadge.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. TYPE DE COURS ET TARIF */}
          <div className="space-y-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <HomeIcon className="w-4 h-4 text-[#FF5A5F]" />
                Où proposez-vous vos cours ? (Vous pouvez choisir les deux)
              </label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { id: 'domicile', label: 'À domicile', icon: HomeIcon, desc: 'Chez l\'élève' },
                  { id: 'enligne', label: 'En ligne', icon: Laptop, desc: 'Visio-conférence' }
                ].map((item) => {
                  const isSelected = typeCours.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTypeCours(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-white border-[#FF5A5F] text-gray-900 shadow-sm ring-2 ring-red-500/10' 
                          : 'bg-white/60 border-gray-200 text-gray-500 hover:bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-red-50 text-[#FF5A5F]' : 'bg-gray-100 text-gray-400'}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{item.label}</p>
                        <p className="text-[10px] text-gray-400">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-200/60">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#FF5A5F]" />
                Tarif horaire souhaité
              </label>
              <div className="flex items-center rounded-xl bg-white border border-gray-200 focus-within:border-[#FF5A5F] transition overflow-hidden shadow-sm">
                <input 
                  type="number"
                  placeholder="Ex : 100 ou 120"
                  value={tarifHoraire}
                  onChange={(e) => setTarifHoraire(e.target.value)}
                  className="w-full p-3 text-xs font-medium focus:outline-none"
                />
                <span className="px-4 py-3 bg-gray-100 text-gray-700 font-bold text-xs border-l border-gray-200 shrink-0">
                  DH / heure
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Indiquez le montant net que vous souhaitez gagner par heure de cours.
              </p>
            </div>
          </div>

          {/* 4. MOBILITÉ ET FRAIS DE DÉPLACEMENT */}
          <div className="space-y-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-[#FF5A5F]" />
                Jusqu'à quelle distance pouvez-vous vous déplacer chez l'élève ?
              </label>
              <p className="text-[11px] text-gray-500">
                Sélectionnez 0 km si vous donnez vos cours uniquement en ligne.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { value: '0', label: '0 km (Non)' },
                { value: '5', label: 'Jusqu\'à 5 km' },
                { value: '10', label: 'Jusqu\'à 10 km' },
                { value: '20', label: 'Plus de 15 km' }
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setDistanceMax(item.value);
                    if (item.value === '0') setFraisDeplacement('0');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    distanceMax === item.value
                      ? 'bg-white border-[#FF5A5F] text-[#FF5A5F] shadow-sm ring-2 ring-red-500/10'
                      : 'bg-white/80 border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {distanceMax !== '0' && (
              <div className="space-y-2 pt-2 border-t border-gray-200/60 animate-in fade-in slide-in-from-top-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#FF5A5F]" />
                  Frais de déplacement supplémentaires (optionnel)
                </label>
                
                <div className="flex items-center rounded-xl bg-white border border-gray-200 focus-within:border-[#FF5A5F] transition overflow-hidden shadow-sm">
                  <input 
                    type="number"
                    placeholder="Ex : 20 ou 30 (Laissez 0 si inclus)"
                    value={fraisDeplacement}
                    onChange={(e) => setFraisDeplacement(e.target.value)}
                    className="w-full p-3 text-xs font-medium focus:outline-none"
                  />
                  <span className="px-3.5 py-3 bg-gray-100 text-gray-600 font-bold text-xs border-l border-gray-200 shrink-0">
                    DH / séance
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 5. PLANNING / DISPONIBILITÉ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF5A5F]" />
                Disponibilité
              </label>
            </div>

            <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[320px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 text-left w-1/4"></th>
                    {DAYS.map((day) => (
                      <th key={day.id} className="py-2 text-sm font-bold text-gray-900">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map((period) => (
                    <tr key={period.id} className="border-b border-gray-50/80 last:border-none">
                      <td className="py-3 text-left text-xs font-semibold text-gray-700">
                        {period.label}
                      </td>
                      {DAYS.map((day) => {
                        const isSelected = disponibilites.includes(`${period.id}-${day.id}`);
                        return (
                          <td key={day.id} className="py-3 align-middle">
                            <button
                              type="button"
                              onClick={() => toggleDisponibilite(period.id, day.id)}
                              className="inline-flex items-center justify-center p-1 cursor-pointer focus:outline-none group"
                            >
                              <span 
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all duration-200 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-[#BCE3FF] ring-2 ring-blue-300/40 scale-100' 
                                    : 'bg-gray-100 hover:bg-gray-200/80 scale-90 opacity-60'
                                }`}
                              />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl font-medium">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Ne vous inquiétez pas ! Vous pourrez modifier votre planning à tout moment depuis votre tableau de bord.
              </span>
            </div>
          </div>

          {/* 6. COORDONNÉES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Adresse e-mail
              </label>
              <input 
                type="email"
                placeholder="Ex : youssef@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#FF5A5F] focus:ring-4 focus:ring-red-500/10 shadow-sm transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF5A5F]" />
                Numéro de téléphone
              </label>
              <div className="flex items-center rounded-xl bg-white border border-gray-200 focus-within:border-[#FF5A5F] focus-within:ring-4 focus-within:ring-red-500/10 shadow-sm transition overflow-hidden">
                <span className="px-3.5 py-3.5 bg-gray-100/80 text-gray-700 font-bold text-xs sm:text-sm border-r border-gray-200 shrink-0">
                  🇲🇦 +212
                </span>
                <input 
                  type="tel"
                  placeholder="6 61 23 45 67"
                  value={telephone}
                  onChange={handlePhoneChange}
                  className="w-full p-3.5 bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
              {telephone.length > 0 && !isPhoneValid && (
                <p className="text-[10px] text-amber-600 font-medium">
                  Saisissez exactement 9 chiffres après +212 (ex: 661234567)
                </p>
              )}
            </div>
          </div>

          {/* 7. PHOTO DE PROFIL */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#FF5A5F]" />
              Photo de profil
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#FF5A5F] shadow-md group shrink-0">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu photo" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex-1 border-2 border-dashed border-gray-200 hover:border-[#FF5A5F] bg-white hover:bg-red-50/10 p-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition text-gray-500 hover:text-[#FF5A5F]">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#FF5A5F] shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800">Prendre ou importer une photo</p>
                    <p className="text-[11px] text-gray-400">JPG, PNG (Max 5Mo)</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </label>
              )}
            </div>

            {imageError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}
          </div>

        </div>

        {/* Boutons de navigation */}
        <div className="pt-6 flex items-center gap-4 border-t border-gray-100">
          <button
            onClick={() => router.push('/donner-cours')}
            className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition cursor-pointer"
          >
            Retour
          </button>
          <button
            disabled={!isValid || isLoading}
            onClick={handleNext}
            className={`flex-1 py-3.5 font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              isValid 
                ? 'bg-[#FF5A5F] hover:bg-[#E0484C] text-white shadow-red-500/20' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{isLoading ? 'Enregistrement...' : 'Suivant'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full py-5 text-center text-xs text-gray-400 font-medium border-t border-gray-100">
        © 2026 ProfMaroc — Tous droits réservés.
      </footer>
    </main>
  );
}