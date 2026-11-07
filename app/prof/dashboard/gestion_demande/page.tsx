'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Clock, CheckCircle2, 
  ExternalLink, X, Phone, Mail, BookOpen, Filter, Calendar, RotateCcw, Table
} from 'lucide-react';

interface Lead {
  id: string | number;
  student_name?: string;
  student_family_name?: string;
  email?: string;
  telephone?: string;
  student_phone?: string;
  student_ville?: string;
  'student subjects'?: string[] | string;
  student_subjects?: string[] | string;
  'student grade'?: string;
  student_grade?: string; 
  status: 'accepted' | 'pending' | 'refused';
  created_at?: string;
  lead_date?: string;
  message?: string;
}

interface GestionDemandeProps {
  initialSubTab?: 'accepted' | 'pending';
}

export default function GestionDemandePage({ initialSubTab = 'accepted' }: GestionDemandeProps) {
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>(initialSubTab);
  const [profMatiere, setProfMatiere] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('prof_theme') === 'dark';
    }
    return false;
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Lead | null>(null);

  // États pour les filtres compacts
  const [filterVille, setFilterVille] = useState('all');
  const [filterMatiere, setFilterMatiere] = useState('all');
  const [filterNiveau, setFilterNiveau] = useState('all');

  // Synchronisation si le parent change l'onglet
  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    async function fetchProfAndLeads() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const storedId = localStorage.getItem('professor_id') || localStorage.getItem('user_id');
        const rawEmail = user?.email || localStorage.getItem('professor_email') || 'samielfidrissi@gmail.com';

        let currentEmail = rawEmail;
        let matieres: string[] = [];

        const { data: allProfs } = await supabase.from('professors').select('*');
        const typedProfs = allProfs as Record<string, unknown>[] | null;

        if (typedProfs) {
          let prof = storedId ? typedProfs.find((p) => String(p.id) === String(storedId)) : null;
          if (!prof && rawEmail) {
            prof = typedProfs.find((p) => typeof p.email === 'string' && p.email.toLowerCase().trim() === rawEmail.toLowerCase().trim());
          }
          if (prof) {
            if (typeof prof.email === 'string') currentEmail = prof.email;
            
            const rawMatiere = prof.matiere;
            if (Array.isArray(rawMatiere)) {
              matieres = rawMatiere as string[];
            } else if (typeof rawMatiere === 'string') {
              try {
                matieres = JSON.parse(rawMatiere);
              } catch {
                const cleaned = rawMatiere.replace(/^\{|\}$/g, '').replace(/"/g, '');
                matieres = cleaned.split(',').map((s: string) => s.trim());
              }
            }
          }
        }
        setProfMatiere(matieres);

        if (currentEmail) {
          const { data: leadsData, error } = await supabase
            .from('leads')
            .select('*')
            .ilike('professor_email', currentEmail.trim());

          if (!error && leadsData) {
            setLeads(leadsData as Lead[]);
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

  const getMatchedSubjects = (item: Lead) => {
    const rawSubjects = item['student subjects'] || item.student_subjects;
    let subjectsList: string[] = [];

    if (rawSubjects) {
      if (Array.isArray(rawSubjects)) {
        subjectsList = rawSubjects;
      } else if (typeof rawSubjects === 'string') {
        const trimmed = rawSubjects.trim();
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) subjectsList = parsed;
          else subjectsList = [trimmed];
        } catch {
          const cleaned = trimmed.replace(/^\{|\}$/g, '').replace(/"/g, '');
          subjectsList = cleaned.split(',').map(s => s.trim());
        }
      }
    }

    if (subjectsList.length === 0 || subjectsList.includes('null') || subjectsList.includes('NULL')) {
      subjectsList = profMatiere;
    }

    const filtered = subjectsList.filter(s => s && s.toLowerCase() !== 'null' && s !== '[]');
    return filtered.length > 0 ? filtered.join(', ') : 'Non spécifié';
  };

  const getStudentGrade = (item: Lead) => {
    return item['student grade'] || item.student_grade || '';
  };

  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  const availableVilles = Array.from(new Set(leads.map(l => l.student_ville).filter(Boolean))) as string[];
  const availableMatieres = Array.from(new Set(leads.map(l => getMatchedSubjects(l)).filter(Boolean)));
  const availableNiveaux = Array.from(new Set(leads.map(l => getStudentGrade(l)).filter(Boolean)));

  const filteredLeads = leads.filter(l => {
    const matchesTab = activeTab === 'accepted' ? l.status === 'accepted' : l.status === 'pending';

    const villeMatch = filterVille === 'all' || normalizeText(l.student_ville || '') === normalizeText(filterVille);
    const matiereMatch = filterMatiere === 'all' || normalizeText(getMatchedSubjects(l)) === normalizeText(filterMatiere);
    const niveauMatch = filterNiveau === 'all' || normalizeText(getStudentGrade(l)) === normalizeText(filterNiveau);

    return matchesTab && villeMatch && matiereMatch && niveauMatch;
  });

  const resetFilters = () => {
    setFilterVille('all');
    setFilterMatiere('all');
    setFilterNiveau('all');
  };

  const hasActiveFilters = filterVille !== 'all' || filterMatiere !== 'all' || filterNiveau !== 'all';

  return (
    <div className="w-full space-y-4">
      
      {/* BARRE DE FILTRES COMPACTE (Bulle de filtre discrète au-dessus du tableau) */}
      <div className={`p-3 rounded-2xl border shadow-xs flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          {/* Sélecteur Ville */}
          <select
            value={filterVille}
            onChange={(e) => setFilterVille(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border outline-none transition ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">📍 Toutes les villes</option>
            {availableVilles.map(ville => (
              <option key={ville} value={ville}>{ville}</option>
            ))}
          </select>

          {/* Sélecteur Matière */}
          <select
            value={filterMatiere}
            onChange={(e) => setFilterMatiere(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border outline-none transition capitalize ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">📚 Toutes les matières</option>
            {availableMatieres.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>

          {/* Sélecteur Niveau */}
          <select
            value={filterNiveau}
            onChange={(e) => setFilterNiveau(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border outline-none transition capitalize ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="all">🎓 Tous les niveaux</option>
            {availableNiveaux.map(niv => (
              <option key={niv} value={niv}>{niv}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button 
            onClick={resetFilters}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Réinitialiser
          </button>
        )}
      </div>

      {/* TABLEAU PLEINE LARGEUR STYLE EXCEL */}
      <div className={`rounded-2xl border overflow-hidden shadow-xl w-full ${
        isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white border-slate-300'
      }`}>
        
        <div className={`px-5 py-3 border-b flex items-center justify-between text-xs font-bold ${
          isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-orange-500" />
            <span className="capitalize">
              {activeTab === 'accepted' ? 'Étudiants Acceptés' : 'Demandes en attente'}
            </span>
          </div>
          <span className="text-xs font-black bg-orange-500/10 text-orange-500 px-3 py-1 rounded-lg border border-orange-500/20">
            {filteredLeads.length} ligne(s)
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[11px] uppercase tracking-wider font-extrabold ${
                isDarkMode ? 'bg-slate-900/90 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}>
                <th className="py-3.5 px-5 border-r border-b border-slate-300 dark:border-slate-700">Nom de l&apos;étudiant</th>
                <th className="py-3.5 px-5 border-r border-b border-slate-300 dark:border-slate-700">Matière(s) / Cours</th>
                <th className="py-3.5 px-5 border-r border-b border-slate-300 dark:border-slate-700">Niveau (Grade)</th>
                <th className="py-3.5 px-5 border-r border-b border-slate-300 dark:border-slate-700">Statut / Engagement</th>
                <th className="py-3.5 px-5 border-r border-b border-slate-300 dark:border-slate-700">Date et Heure</th>
                <th className="py-3.5 px-5 border-b border-slate-300 dark:border-slate-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">Chargement des données du tableau...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">Aucun étudiant trouvé avec ces critères.</td>
                </tr>
              ) : (
                filteredLeads.map((item, index) => {
                  const fullName = `${item.student_name || ''} ${item.student_family_name || ''}`.trim() || 'Étudiant';
                  const subjectsText = getMatchedSubjects(item);
                  const studentGrade = getStudentGrade(item);
                  const dateValue = item.lead_date || item.created_at;

                  const parsedDate = dateValue ? new Date(dateValue) : null;
                  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
                  const hasTime = isValidDate && (parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0);

                  const isEven = index % 2 === 0;
                  const rowBg = isDarkMode 
                    ? (isEven ? 'bg-slate-900/40' : 'bg-slate-950/40') 
                    : (isEven ? 'bg-white' : 'bg-slate-50/70');

                  return (
                    <tr key={item.id} className={`${rowBg} transition-colors ${
                      isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-amber-50/40'
                    }`}>
                      <td className="py-3.5 px-5 font-bold border-r border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 font-black flex items-center justify-center shrink-0 text-xs">
                          {fullName[0] || 'E'}
                        </div>
                        <div className="truncate">
                          <span className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>{fullName}</span>
                          {item.student_ville && (
                            <p className="text-[10px] text-slate-400 font-normal">{item.student_ville}</p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 font-medium border-r border-b border-slate-200 dark:border-slate-800">
                        <span className="bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-md border border-orange-500/20 font-semibold capitalize">
                          {subjectsText}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 font-medium capitalize border-r border-b border-slate-200 dark:border-slate-800">
                        {studentGrade ? (
                          <span className={`px-2.5 py-1 rounded-md border font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {studentGrade}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="py-3.5 px-5 border-r border-b border-slate-200 dark:border-slate-800">
                        {item.status === 'accepted' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Engagé</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5" />
                            <span>En attente</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 border-r border-b border-slate-200 dark:border-slate-800">
                        {isValidDate ? (
                          <div className="space-y-0.5">
                            <div className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                              <Calendar className="w-3 h-3 text-orange-500 shrink-0" />
                              {parsedDate.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            {hasTime && (
                              <div className={`text-[10px] font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Clock className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                                {parsedDate.toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 border-b border-slate-200 dark:border-slate-800 text-right">
                        <button
                          onClick={() => setSelectedStudent(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/10 text-orange-500 font-bold hover:bg-orange-500 hover:text-white transition-all cursor-pointer shadow-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Voir</span>
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

      {/* MODALE DE LA FICHE ÉTUDIANT */}
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
                <p className="text-xs text-orange-500 font-bold capitalize">Niveau : {getStudentGrade(selectedStudent) || 'Non spécifié'}</p>
                {selectedStudent.student_ville && (
                  <p className="text-[11px] text-slate-400">Ville : {selectedStudent.student_ville}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-700/50 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{selectedStudent.email || 'Non renseigné'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{selectedStudent.telephone || selectedStudent.student_phone || 'Non renseigné'}</span>
              </div>
              <div className="flex items-start gap-3 text-slate-300">
                <BookOpen className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 w-full space-y-1">
                  <span className="font-bold text-orange-400">Matière(s) choisie(s) :</span>
                  <p className="capitalize">{getMatchedSubjects(selectedStudent)}</p>
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