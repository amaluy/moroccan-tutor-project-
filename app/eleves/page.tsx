'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, MapPin, BookOpen, Filter, User, Calendar, CheckCircle2 } from 'lucide-react';

interface StudentRequest {
  id: string;
  title: string;
  student_name: string;
  subject: string;
  city: string;
  budget: string;
  description: string;
  created_at: string;
}

export default function ElevesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMatiere = searchParams.get('matiere') || '';
  const initialVille = searchParams.get('ville') || '';

  const [searchTerm, setSearchTerm] = useState(initialMatiere);
  const [locationTerm, setLocationTerm] = useState(initialVille);
  const [selectedSubject, setSelectedSubject] = useState('Tous');

  // Exemple de données simulées (en attendant de les lier à ta table Supabase "students")
  const [students, setStudents] = useState<StudentRequest[]>([
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

  const subjects = ['Tous', 'Maths', 'Anglais', 'Physique', 'Français', 'Soutien scolaire'];

  const filteredStudents = students.filter(student => {
    const matchSearch = student.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = student.city.toLowerCase().includes(locationTerm.toLowerCase());
    const matchSubject = selectedSubject === 'Tous' || student.subject === selectedSubject;
    return matchSearch && matchLocation && matchSubject;
  });

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between">
      <Navbar 
        isLoggedIn={true}
        isMenuOpen={false}
        setIsMenuOpen={() => {}}
        onLogoutClick={() => router.replace('/connexion')}
        onOpenHelp={() => {}}
      />

      <div className="max-w-7xl mx-auto px-6 py-10 w-full space-y-8">
        
        {/* En-tête et barre de recherche rapide */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/60 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Demandes des élèves</h1>
            <p className="text-xs text-gray-500 font-medium">Trouvez des missions de cours particuliers près de chez vous</p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <BookOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Filtrer par matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#FF5A5F]"
              />
            </div>
            <div className="relative flex-1 md:w-48">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Ville..."
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#FF5A5F]"
              />
            </div>
          </div>
        </div>

        {/* Corps principal : Filtres à gauche / Liste des annonces à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Colonne des filtres */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/60 space-y-6 h-fit">
            <div className="flex items-center gap-2 font-bold text-sm text-gray-800 border-b pb-4">
              <Filter className="w-4 h-4 text-[#FF5A5F]" />
              <span>Filtrer les annonces</span>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Matières</label>
              <div className="flex flex-col gap-1.5">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      selectedSubject === sub 
                        ? 'bg-red-50 text-[#FF5A5F]' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Liste des annonces élèves */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-xs font-bold text-gray-500 mb-2">
              {filteredStudents.length} demande(s) trouvée(s)
            </div>

            {filteredStudents.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center space-y-3 border border-gray-200/60">
                <p className="text-sm font-bold text-gray-800">Aucune annonce ne correspond à votre recherche.</p>
                <p className="text-xs text-gray-500">Essayez de modifier vos filtres ou mots-clés.</p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/60 hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6">
                  
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-50 text-[#FF5A5F] text-[10px] font-extrabold rounded-full">
                        {student.subject}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {student.created_at}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 hover:text-[#FF5A5F] transition cursor-pointer">
                      {student.title}
                    </h2>

                    <p className="text-xs text-gray-600 line-clamp-2">
                      {student.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 pt-2 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" /> {student.student_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {student.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Budget estimé</span>
                      <span className="text-base font-extrabold text-gray-900">{student.budget}</span>
                    </div>

                    <button 
                      onClick={() => alert(`Mise en relation avec l'élève ${student.student_name}`)}
                      className="mt-4 px-5 py-2.5 bg-[#FF5A5F] hover:bg-[#E0484C] text-white font-bold text-xs rounded-xl transition shadow-md shadow-red-500/20 cursor-pointer"
                    >
                      Répondre à l'annonce
                    </button>
                  </div>

                </div>
              ))
            )}

          </div>

        </div>

      </div>

      <Footer onNavigateHome={() => {}} onOpenHelp={() => {}} />
    </main>
  );
}