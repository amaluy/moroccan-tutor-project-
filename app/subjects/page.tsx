'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HelpModal from '../components/HelpModal';
import { detailedSubjects } from '../data/subjectsData';
import { Professor } from '@/types/professor';
import { 
  Sparkles, 
  ChevronLeft, 
  ArrowUpRight, 
  Search 
} from 'lucide-react';

const SUPABASE_URL = 'https://ydrswexzawreqrnuqwkh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tiN8U5jsxtqe-F10_98DTw_jdcEf-IX';

export default function SubjectsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState<'recherche' | 'acceptee' | 'refusee' | 'avis' | 'inscription' | 'compte'>('acceptee');
  
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  // Chargement des professeurs depuis Supabase pour afficher le nombre réel par matière
  useEffect(() => {
    async function fetchProfessors() {
      setLoading(true);
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/professors?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfessors(data);
        }
      } catch (error) {
        console.error('Erreur chargement professeurs :', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfessors();
  }, []);

  const getProfCountBySubject = (subjectName: string) => {
    if (!professors || professors.length === 0) return 0;

    const query = subjectName.toLowerCase();
    
    return professors.filter((prof) => {
      if (!prof.subject) return false;
      const profSubject = prof.subject.toLowerCase();

      if (query.includes('math')) return profSubject.includes('math');
      if (query.includes('physique')) return profSubject.includes('physique') || profSubject.includes('chimie');
      if (query.includes('svt')) return profSubject.includes('svt') || profSubject.includes('vie');
      if (query.includes('francais') || query.includes('français')) return profSubject.includes('francais') || profSubject.includes('français');
      if (query.includes('anglais')) return profSubject.includes('anglais') || profSubject.includes('english');
      if (query.includes('arabe')) return profSubject.includes('arabe');
      if (query.includes('soutien')) return profSubject.includes('soutien') || profSubject.includes('primaire');

      return profSubject.includes(query);
    }).length;
  };

  const filteredSubjects = detailedSubjects.filter((subject) =>
    subject.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    subject.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
    subject.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans flex flex-col justify-between selection:bg-[#FF5A5F] selection:text-white">
      {/* NAVBAR */}
      <Navbar 
        isLoggedIn={false}
        currentPage="subjects"
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* CONTENU PRINCIPAL */}
      <section className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 md:py-16 animate-in fade-in duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full mb-4 text-xs font-bold text-[#FF5A5F] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Programme National & International</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Toutes nos matières d'enseignement
          </h1>

          <p className="text-base text-gray-600 font-medium max-w-xl mx-auto mb-8">
            Choisissez votre matière pour découvrir les meilleurs professeurs particuliers certifiés près de chez vous ou en ligne.
          </p>

          {/* Barre de recherche locale pour filtrer rapidement les matières */}
          <div className="max-w-md mx-auto relative flex items-center mb-8">
            <Search className="w-4 h-4 text-gray-400 absolute left-4" />
            <input 
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtrer une matière (ex: Mathématiques, Physique...)"
              className="w-full bg-white border border-gray-200 focus:border-[#FF5A5F] rounded-xl pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none shadow-sm transition"
            />
          </div>
        </div>

        {/* LISTE DES MATIÈRES */}
        <div className="space-y-4">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((item) => {
              const IconComponent = item.icon;
              const count = getProfCountBySubject(item.name);

              return (
                <Link 
                  key={item.id}
                  href="/"
                  className="group bg-white rounded-2xl p-6 border border-gray-200/80 hover:border-[#FF5A5F]/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 cursor-pointer block"
                >
                  <div className="flex items-start gap-5 flex-1">
                    <div className={`w-14 h-14 rounded-2xl ${item.iconBg} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                      <IconComponent className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-[#FF5A5F] transition">
                          {item.name}
                        </h2>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.category}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.levels.map((lvl) => (
                          <span key={lvl} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                            {lvl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 shrink-0 gap-2">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {loading ? 'Chargement...' : `${count} prof${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-extrabold text-[#FF5A5F] group-hover:translate-x-1 transition-transform">
                      <span>Voir les profs</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200/80">
              <p className="text-gray-500 text-sm font-medium">Aucune matière ne correspond à votre recherche.</p>
            </div>
          )}
        </div>

        {/* BOUTON RETOUR */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm transition shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </section>

      {/* FOOTER & MODALE D'AIDE */}
      <Footer 
        onNavigateHome={() => {}} 
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