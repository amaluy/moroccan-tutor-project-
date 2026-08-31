'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import HelpModal from '../../components/HelpModal';
import { 
  MapPin, Clock, CheckCircle2, Send, Lock, Share2
} from 'lucide-react';

// Initialisation standard de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function ProfessorProfilePage() {
  const router = useRouter();
  const params = useParams();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('acceptee');

  const [prof, setProf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire de l'élève
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les données du professeur depuis Supabase en fonction de l'ID de l'URL
  useEffect(() => {
    async function fetchProf() {
      if (!params?.id) return;

      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        // Récupération sécurisée du prénom, du nom et de la ville exacte
        const prenom = data.prenom || data.Prénom || '';
        const nom = data.nom || data.Nom || '';
        const fullName = `${prenom} ${nom}`.trim() || "Professeur";

        // Récupération de la ville (colonne 'ville')
        const villeProf = data.ville || data.city || data.location || "Maroc";

        // Récupération de la photo (colonne 'photo_URL')
        const photoProf = data.photo_URL || data.avatar || null;

        setProf({
          id: data.id,
          name: fullName,
          avatar: photoProf,
          title: data.title || data.matiere || "Je suis un(e) professeur(e) motivé(e)",
          price: data.price ? `${data.price}€/h` : "Prix sur demande",
          isVerified: true,
          experience: data.experience || "3 ans d'expérience",
          subjects: [data.subject || data.matiere || "Soutien Scolaire"],
          cities: [villeProf],
          pricingDetails: [
            { label: "Premier cours offert", value: "Gratuit" },
            { label: "Tarif horaire", value: data.price ? `${data.price}€/h` : "Sur demande" },
          ],
          levels: data.levels || ["Primaire", "Collège", "Lycée"],
          description: data.description || "Pour nos cours nous allons voir le nécessaire pour réussir vos études d'une façon amusante et approfondir vos connaissances.",
          availabilityGrid: data.availability_grid || {}
        });
      } else {
        // MODE SECOURS si l'ID n'est pas trouvé
        setProf({
          id: String(params.id),
          name: "Professeur",
          avatar: null,
          title: "Professeur particulier motivé",
          price: "Sur demande",
          isVerified: true,
          experience: "3 ans d'expérience en tant que professeur",
          subjects: ["Cours particuliers de Soutien Scolaire"],
          cities: ["Maroc"],
          pricingDetails: [
            { label: "Premier cours offert", value: "Gratuit" },
            { label: "Tarif horaire", value: "Sur demande" },
          ],
          levels: ["Primaire", "Collège", "Lycée"],
          description: "Pour nos cours nous allons voir le nécessaire pour réussir vos études bien sur d'une façon amusante pour ne pas s'ennuyer.",
          availabilityGrid: {}
        });
      }
      setLoading(false);
    }

    fetchProf();
  }, [params?.id]);

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await supabase.from('leads').insert([
      {
        student_name: formData.fullName,
        student_email: formData.email,
        student_phone: formData.phone,
        subject: formData.message,
        status: 'pending'
      }
    ]);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-500">
        Chargement du profil...
      </div>
    );
  }

  if (!prof) return null;

  const JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
  const CRENEAUX = ['Matin', 'Midi', 'Après-midi'];
  const availabilityGrid = prof.availabilityGrid || {};

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between">
      
      <Navbar 
        isLoggedIn={true}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogoutClick={() => router.replace('/connexion')}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* --- EN-TÊTE DU PROFIL --- */}
      <section className="bg-white border-b border-gray-100 py-10 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {prof.avatar ? (
              <img 
                src={prof.avatar} 
                alt={prof.name} 
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover shadow-sm border border-gray-100 shrink-0"
              />
            ) : (
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-orange-500 text-white font-black text-4xl flex items-center justify-center shrink-0 shadow-inner">
                {prof.name.charAt(0)}
              </div>
            )}
            
            <div className="space-y-2 pt-1">
              <div className="flex items-baseline justify-center sm:justify-start gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">{prof.name}</h1>
              </div>

              <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1 flex-wrap max-w-2xl">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                {prof.cities.join(', ')}
              </p>

              <p className="text-xs text-gray-600 font-medium">
                📚 {prof.subjects[0]}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-600 pt-1 flex-wrap">
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Données vérifiées
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {prof.experience}
                </span>
              </div>
            </div>
          </div>

          {/* Bloc Tarif Haut Droite */}
          <div className="text-center shrink-0 w-full md:w-auto min-w-[200px] space-y-2">
            <div className="text-2xl font-black text-blue-950">{prof.price}</div>
            
            <button 
              onClick={() => document.getElementById('formulaire-contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 px-8 rounded-xl text-sm transition shadow-md cursor-pointer"
            >
              Contacter
            </button>

            <div className="text-xs font-bold text-orange-600 flex items-center justify-center gap-1">
              <span>Premier cours offert</span>
              <span className="text-gray-400">→</span>
            </div>
          </div>

        </div>
      </section>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 w-full text-[11px] text-gray-500 flex items-center gap-1 flex-wrap">
        <Link href="#" className="hover:underline">Vos cours</Link>
        <span>›</span>
        <Link href="#" className="hover:underline">Soutien Scolaire</Link>
        <span>›</span>
        <span className="text-gray-400 truncate max-w-xs">{prof.title}</span>
      </div>

      {/* --- CORPS --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        
        {/* COLONNE GAUCHE */}
        <aside className="lg:col-span-4 space-y-8">
          
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">€</span>
              Prix
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600 pl-7">
              {prof.pricingDetails.map((item: any, idx: number) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-bold text-gray-800 text-xs mb-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Villes où se déroulent les cours
            </h3>
            <ul className="space-y-1 text-xs text-gray-600 pl-7">
              {prof.cities.map((city: string, idx: number) => (
                <li key={idx} className="hover:text-orange-600 transition cursor-default">
                  {city}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="text-orange-500 font-bold">⫸</span>
              Niveaux des cours
            </h3>
            <ul className="space-y-1 text-xs text-gray-600 pl-7">
              {prof.levels.map((lvl: string, idx: number) => (
                <li key={idx}>{lvl}</li>
              ))}
            </ul>
          </div>

          {/* DISPONIBILITÉ */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-gray-900">
              Disponibilité
            </h3>

            <div className="w-full text-xs max-w-[280px]">
              <div className="grid grid-cols-8 gap-1 pb-2 border-b border-gray-200 text-center font-bold text-gray-700">
                <span></span>
                {JOURS.map((day, i) => (
                  <span key={i}>{day}</span>
                ))}
              </div>

              {CRENEAUX.map((creneau) => (
                <div key={creneau} className="grid grid-cols-8 gap-1 py-2 border-b border-gray-100 items-center">
                  <span className="font-medium text-gray-600 text-[11px]">{creneau}</span>
                  {JOURS.map((jour) => {
                    const isAvailable = !!availabilityGrid[`${jour}-${creneau}`];
                    return (
                      <div key={jour} className="flex justify-center">
                        {isAvailable && <span className="w-3.5 h-3.5 rounded-full bg-orange-200" />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h3 className="text-xs font-bold text-gray-800">Partagez ce professeur</h3>
            <div className="flex gap-3 text-gray-400">
              <button className="hover:text-orange-600 transition text-xs flex items-center gap-1 font-medium">
                <Share2 className="w-3.5 h-3.5" /> Partager
              </button>
            </div>
          </div>

        </aside>

        {/* COLONNE DROITE */}
        <section className="lg:col-span-8 space-y-10">
          
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-900 leading-tight">
              {prof.title}
            </h2>

            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-900">Description des cours</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {prof.description}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Reconnaissances</h3>
            <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {prof.avatar ? (
                  <img src={prof.avatar} className="w-12 h-12 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center">
                    {prof.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-900">Tu veux en savoir plus sur {prof.name} ?</p>
                  <p className="text-xs text-orange-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Données vérifiées
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Localisation approximative des cours de {prof.name}</h3>
            <p className="text-xs text-gray-500">Villes où les cours peuvent se dérouler</p>
            <div className="flex flex-wrap gap-2">
              {prof.cities.map((city: string, idx: number) => (
                <span key={idx} className="bg-orange-50 text-orange-700 text-xs px-3 py-1.5 rounded-md font-medium">
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* FORMULAIRE DE CONTACT */}
          <div id="formulaire-contact" className="bg-white p-6 sm:p-10 rounded-3xl border border-orange-200 shadow-xl space-y-6">
            
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-orange-600" />
                Contactez {prof.name} directement
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Service 100% gratuit pour les élèves. Envoie ton message et le professeur te recontactera directement.
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">Message envoyé à {prof.name} !</h4>
                <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
                  Le professeur examinera votre demande et vous recontactera directement sur votre numéro de téléphone.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-block"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitContact} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Nom & Prénom *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Nom & Prénom" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-orange-50/30 border border-orange-100 rounded-xl px-4 py-3 text-xs text-gray-800 focus:bg-white focus:border-orange-600 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Adresse E-mail *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="email@example.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-orange-50/30 border border-orange-100 rounded-xl px-4 py-3 text-xs text-gray-800 focus:bg-white focus:border-orange-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Numéro Téléphone (WhatsApp) *</label>
                  <div className="flex gap-2">
                    <span className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-600 flex items-center shrink-0">
                      MA +212
                    </span>
                    <input 
                      type="tel" 
                      required
                      placeholder="06 12 34 56 78" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-orange-500 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">Votre Message au professeur *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder={`Bonjour ${prof.name}, j'aimerais en savoir plus sur vos disponibilités...`}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-gray-50/70 border border-gray-200 rounded-xl p-4 text-xs text-gray-800 focus:bg-white focus:border-orange-600 focus:outline-none transition"
                  ></textarea>
                </div>

                <div className="bg-orange-50/60 p-3.5 rounded-xl flex items-center gap-2.5 text-[11px] text-orange-900">
                  <Lock className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Vos coordonnées ne seront pas publiées publiquement. Seul le professeur pourra les consulter.</span>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-4 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Envoi en cours...' : 'Contacter maintenant'}</span>
                </button>
              </form>
            )}

          </div>

        </section>

      </div>

      <Footer 
        onNavigateHome={() => router.push('/')} 
        onOpenHelp={() => setIsHelpOpen(true)} 
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        helpSection={helpSection} 
        setHelpSection={setHelpSection} 
      />

    </main>
  );
}