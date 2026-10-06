'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Clock, CheckCircle2, Moon, Sun, 
  ExternalLink, X, Phone, Mail, BookOpen, Filter
} from 'lucide-react';

interface Lead {
  id: string | number;
  student_name?: string;
  student_family_name?: string;
  email?: string;
  telephone?: string;
  student_subjects?: string[];
  student_grade?: string; // 'primaire', 'college', 'lycée'
  status: 'accepted' | 'pending' | 'refused';
  created_at?: string;
  message?: string;
}

export default function GestionDemandePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>('accepted');
  const [profName, setProfName] = useState('sami el idrissi');
  const [profImage, setProfImage] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profNiveaux, setProfNiveaux] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('prof_theme') === 'dark';
    }
    return false;
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Lead | null>(null);
  
  // Filtre actif par niveau scolaire (ex: 'all', 'primaire', 'college', 'lycée')
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('prof_theme', nextMode ? 'dark' : 'light');
  };

  useEffect(() => {
    async function fetchProfAndLeads() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const storedId = localStorage.getItem('professor_id') || localStorage.getItem('user_id');
        const rawEmail = user?.email || localStorage.getItem('professor_email') || '';

        let currentEmail = rawEmail;
        let niveaux: string[] = [];

        // 1. Récupérer le professeur depuis la table `professors`
        const { data: allProfs } = await supabase.from('professors').select('*');
        if (allProfs) {
          let prof = storedId ? allProfs.find((p) => String(p.id) === String(storedId)) : null;
          if (!prof && rawEmail) {
            prof = allProfs.find((p) => p.email && p.email.toLowerCase().trim() === rawEmail.toLowerCase().trim());
          }
          if (prof) {
            const prenom = prof['Prénom'] || prof.prenom || '';
            const nom = prof['Nom'] || prof.nom || '';
            const fullName = `${prenom} ${nom}`.trim();
            if (fullName) setProfName(fullName);
            setProfImage(prof.photo_URL || prof.photo_url || prof.image_url || prof.photo || '');
            if (prof.email) currentEmail = prof.email;
            
            // Récupérer la colonne `niveau` (tableau de texte ex: ["lycee", "college"])[cite: 13]
            if (Array.isArray(prof.niveau)) {
              niveaux = prof.niveau;
            } else if (typeof prof.niveau === 'string') {
              try {
                niveaux = JSON.parse(prof.niveau);
              } catch {
                niveaux = [prof.niveau];
              }
            }
          }
        }
        setProfEmail(currentEmail);
        setProfNiveaux(niveaux);

        // 2. Récupérer les leads correspondants via `professor_email`
        if (currentEmail) {
          const { data: leadsData, error } = await supabase
            .from('leads')
            .select('*')
            .ilike('professor_email', currentEmail.trim());

          if (!error && leadsData) {
            setLeads(leadsData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfAndLeads();
  }, []);

  // Filtrage selon l'onglet (accepted / pending) et le `student_grade` de la table leads[cite: 14]
  const filteredLeads = leads.filter(l => {
    const matchesTab = activeTab === 'accepted' ? l.status === 'accepted' : l.status === 'pending';
    const matchesGrade = gradeFilter === 'all' || (l.student_grade && l.student_grade.toLowerCase().trim() === gradeFilter.toLowerCase().trim());
    return matchesTab && matchesGrade;
  });

  const acceptedCount = leads.filter(l => l.status === 'accepted').length;
  const pendingCount = leads.filter(l => l.status === 'pending').length;

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* --- NAVBAR --- */}
      <header className={`sticky top-0 z-40 border-b px-6 py-3 flex items-center justify-between transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0A0A0A]/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
      }`}>
        <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'accepted' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Étudiants Acceptés ({acceptedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'pending' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Demandes en attente ({pendingCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-7 h-7 rounded-full overflow-hidden border border-orange-500 bg-slate-200 shrink-0 relative">
              {profImage ? (
                <Image src={profImage} alt={profName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-700">
                  {profName[0] || 's'}
                </div>
              )}
            </div>
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {profName}
            </span>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-6 w-full">
        
        {/* Affichage des filtres basé sur les niveaux autorisés du professeur */}
        {profNiveaux.length > 0 && !profNiveaux.includes('admin') && profNiveaux[0] !== '[]' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-orange-500" /> Filtrer par niveau :
            </span>
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                gradeFilter === 'all' 
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                  : isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous
            </button>
            {profNiveaux.map((niv) => (
              <button
                key={niv}
                onClick={() => setGradeFilter(niv)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer border ${
                  gradeFilter === niv 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                    : isDarkMode ? 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {niv}
              </button>
            ))}
          </div>
        )}

        <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider font-extrabold ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <th className="py-4 px-6">Nom de l&apos;étudiant</th>
                  <th className="py-4 px-6">Matière(s) / Cours</th>
                  <th className="py-4 px-6">Niveau (Grade)</th>
                  <th className="py-4 px-6">Statut / Engagement</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Fiche Profil Résumé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Chargement des données...</td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Aucun étudiant trouvé dans cette catégorie.</td>
                  </tr>
                ) : (
                  filteredLeads.map((item) => {
                    const fullName = `${item.student_name || ''} ${item.student_family_name || ''}`.trim() || 'Étudiant';
                    const subjectsText = Array.isArray(item.student_subjects) 
                      ? item.student_subjects.join(', ') 
                      : (item.student_subjects || 'Non spécifié');

                    return (
                      <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                        <td className="py-4 px-6 font-bold flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 font-black flex items-center justify-center shrink-0">
                            {fullName[0] || 'E'}
                          </div>
                          <span>{fullName}</span>
                        </td>
                        <td className="py-4 px-6 font-medium text-slate-400">{subjectsText}</td>
                        <td className="py-4 px-6 font-medium capitalize text-slate-300">{item.student_grade || '-'}</td>
                        <td className="py-4 px-6">
                          {item.status === 'accepted' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Engagé</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5" />
                              <span>En attente</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedStudent(item)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/10 text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-all cursor-pointer shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Voir la fiche</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* MODALE DU TABLEAU RÉSUMÉ DE L'ÉTUDIANT */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl border shadow-2xl max-w-md w-full space-y-6 relative ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button 
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                {selectedStudent.student_name?.[0] || 'E'}
              </div>
              <div>
                <h3 className="text-lg font-black">{`${selectedStudent.student_name || ''} ${selectedStudent.student_family_name || ''}`}</h3>
                <p className="text-xs text-orange-500 font-bold capitalize">Niveau : {selectedStudent.student_grade || 'Non spécifié'}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-700/50 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{selectedStudent.email || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{selectedStudent.telephone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <BookOpen className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 w-full space-y-1">
                  <span className="font-bold text-orange-400">Matière(s) choisie(s) :</span>
                  <p>{Array.isArray(selectedStudent.student_subjects) ? selectedStudent.student_subjects.join(', ') : (selectedStudent.student_subjects || 'Aucune matière')}</p>
                </div>
              </div>
              {selectedStudent.message && (
                <div className="flex items-start gap-3 text-slate-300">
                  <div className="leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 w-full space-y-1">
                    <span className="font-bold text-orange-400">Message :</span>
                    <p>{selectedStudent.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-lg cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}