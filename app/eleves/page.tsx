'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, MapPin, BookOpen, Filter, User, Calendar, CheckCircle2, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface StudentRequest {
  id: string;
  title?: string;
  titre?: string;
  student_name?: string;
  nom_eleve?: string;
  subject?: string;
  matiere?: string;
  city?: string;
  ville?: string;
  budget?: string | number;
  description?: string;
  created_at?: string;
}

export default function ElevesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMatiere = searchParams.get('matiere') || '';
  const initialVille = searchParams.get('ville') || '';

  const [searchTerm, setSearchTerm] = useState(initialMatiere);
  const [locationTerm, setLocationTerm] = useState(initialVille);
  const [selectedSubject, setSelectedSubject] = useState('Tous');

  const [students, setStudents] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const subjects = ['Tous', 'Maths', 'Anglais', 'Physique', 'Français', 'Soutien scolaire', 'Arabe'];

  // Chargement des demandes (depuis Supabase avec fallback sur les données simulées)
  const fetchStudentRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('students').select('*');

      if (error || !data || data.length === 0) {
        // Données simulées par défaut si la table Supabase est vide ou absente
        setStudents([
          {
            id: '1',
            title: 'Recherche professeur de Mathématiques (Terminale)',
            student_name: 'Yassine M.',
            subject: 'Maths',
            city: 'Casablanca',
            budget: '150 MAD / h',
            description: 'Je cherche un professeur expérimenté pour préparer le concours et renforcer mes acquis en mathématiques pour le baccalauréat.',
            created_at: 'Il y a 2 jours'
          },
          {
            id: '2',
            title: 'Cours d\'anglais conversationnel niveau intermédiaire',
            student_name: 'Rim B.',
            subject: 'Anglais',
            city: 'Rabat',
            budget: '200 MAD / h',
            description: 'Professionnelle cherchant à améliorer son anglais à l’oral pour des réunions professionnelles. Disponible en soirée.',
            created_at: 'Il y a 3 jours'
          },
          {
            id: '3',
            title: 'Soutien scolaire Physique-Chimie 1ère BAC',
            student_name: 'Mehdi K.',
            subject: 'Physique',
            city: 'Marrakech',
            budget: '120 MAD / h',
            description: 'Mon fils a besoin d’un accompagnement régulier pour combler ses lacunes en physique-chimie.',
            created_at: 'Il y a 5 jours'
          }
        ]);
      } else {
        setStudents(data);
      }
    } catch (err) {
      console.error('Erreur chargement élèves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentRequests();
  }, []);

  const filteredStudents = students.filter(student => {
    const titleVal = student.title || student.titre || '';
    const subjectVal = student.subject || student.matiere || '';
    const cityVal = student.city || student.ville || '';

    const matchSearch = titleVal.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        subjectVal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = cityVal.toLowerCase().includes(locationTerm.toLowerCase());
    const matchSubject = selectedSubject === 'Tous' || subjectVal.toLowerCase() === selectedSubject.toLowerCase();
    
    return matchSearch && matchLocation && matchSubject;
  });

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col justify-between selection:bg-slate-700 selection:text-white">
      
      <Navbar 
        isLoggedIn={true}
        isMenuOpen={false}
        setIsMenuOpen={() => {}}
        onLogoutClick={() => router.replace('/connexion')}
        onOpenHelp={() => {}}
      />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-8 py-10 w-full space-y-8">
        
        {/* En-tête et barre de recherche rapide */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Demandes des élèves</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Trouvez des missions de cours particuliers près de chez vous en toute simplicité</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filtrer par matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-800 focus:outline-none transition"
              />
            </div>
            <div className="relative flex-1 md:w-48">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Ville..."
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 font-medium focus:bg-white focus:border-slate-800 focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Corps principal : Filtres à gauche / Liste des annonces à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Colonne des filtres */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-4">
                <Filter className="w-4 h-4 text-slate-700" />
                <span>Filtrer les annonces</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Matières</label>
                <div className="flex flex-col gap-1">
                  {subjects.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedSubject === sub 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Liste des annonces élèves */}
          <div className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-500">
              <span>{filteredStudents.length} demande(s) trouvée(s)</span>
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
                <p className="text-sm font-semibold text-slate-600">Chargement des demandes...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-slate-200/80 shadow-xs">
                <p className="text-sm font-bold text-slate-900">Aucune annonce ne correspond à votre recherche.</p>
                <p className="text-xs text-slate-500">Essayez de modifier vos filtres ou vos mots-clés.</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const title = student.title || student.titre || 'Demande de cours';
                const subject = student.subject || student.matiere || 'Soutien';
                const studentName = student.student_name || student.nom_eleve || 'Élève';
                const city = student.city || student.ville || 'Maroc';
                const budget = student.budget || 'À discuter';

                return (
                  <div key={student.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 hover:shadow-md transition duration-300 flex flex-col md:flex-row justify-between gap-6">
                    
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-900 text-[10px] font-extrabold rounded-full border border-slate-200">
                          {subject}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {student.created_at || 'Récemment'}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900 hover:text-purple-600 transition cursor-pointer">
                        {title}
                      </h2>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {student.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {studentName}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {city}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block">Budget estimé</span>
                        <span className="text-sm sm:text-base font-black text-slate-900">{budget}</span>
                      </div>

                      <button 
                        onClick={() => alert(`Mise en relation avec l'élève ${studentName}`)}
                        className="mt-4 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition duration-200 shadow-sm active:scale-95 cursor-pointer"
                      >
                        Répondre à l'annonce
                      </button>
                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>

      </div>

      <Footer onNavigateHome={() => {}} onOpenHelp={() => {}} />
    </main>
  );
}