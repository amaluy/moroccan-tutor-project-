'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Clock, CheckCircle2, Moon, Sun, 
  ExternalLink, X, Phone, Mail, BookOpen, Filter, Calendar, RotateCcw
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

export default function GestionDemandePage() {
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>('accepted');
  const [profName, setProfName] = useState('sami el idrissi');
  const [profImage, setProfImage] = useState('');
  const [profNiveaux, setProfNiveaux] = useState<string[]>([]);
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

  // États pour les filtres verticaux
  const [filterVille, setFilterVille] = useState('all');
  const [filterMatiere, setFilterMatiere] = useState('all');
  const [filterNiveau, setFilterNiveau] = useState('all');

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
        const rawEmail = user?.email || localStorage.getItem('professor_email') || 'samielfidrissi@gmail.com';

        let currentEmail = rawEmail;
        let niveaux: string[] = [];
        let matieres: string[] = [];

        const { data: allProfs } = await supabase.from('professors').select('*');
        const typedProfs = allProfs as Record<string, unknown>[] | null;

        if (typedProfs) {
          let prof = storedId ? typedProfs.find((p) => String(p.id) === String(storedId)) : null;
          if (!prof && rawEmail) {
            prof = typedProfs.find((p) => typeof p.email === 'string' && p.email.toLowerCase().trim() === rawEmail.toLowerCase().trim());
          }
          if (prof) {
            const prenom = (prof['Prénom'] as string) || (prof.prenom as string) || '';
            const nom = (prof['Nom'] as string) || (prof.nom as string) || '';
            const fullName = `${prenom} ${nom}`.trim();
            if (fullName) setProfName(fullName);
            setProfImage((prof.photo_URL as string) || (prof.photo_url as string) || (prof.image_url as string) || (prof.photo as string) || '');
            if (typeof prof.email === 'string') currentEmail = prof.email;
            
            const rawNiveau = prof.niveau;
            if (Array.isArray(rawNiveau)) {
              niveaux = rawNiveau as string[];
            } else if (typeof rawNiveau === 'string') {
              try { 
                const parsed = JSON.parse(rawNiveau);
                niveaux = Array.isArray(parsed) ? parsed : [rawNiveau];
              } catch { 
                const cleaned = rawNiveau.replace(/^\{|\}$/g, '').replace(/"/g, '');
                niveaux = cleaned.split(',').map((s: string) => s.trim());
              }
            }

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
        setProfNiveaux(niveaux);
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

  const acceptedCount = leads.filter(l => l.status === 'accepted').length;
  const pendingCount = leads.filter(l => l.status === 'pending').length;

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* NAVBAR */}
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

      {/* CONTENU PRINCIPAL AVEC MISE EN PAGE FLEX (Filtres verticaux à gauche / Tableau à droite) */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* PANNEAU DE FILTRES VERTICAL (colonne de gauche) */}
          <div className={`p-5 rounded-3xl border shadow-sm space-y-5 lg:sticky lg:top-24 ${
            isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/30">
              <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-orange-500">
                <Filter className="w-4 h-4" /> Filtrer les étudiants
              </h2>
              <button 
                onClick={resetFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-orange-500 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Réinitialiser
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Filtre par Ville */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-400">Ville</label>
                <select
                  value={filterVille}
                  onChange={(e) => setFilterVille(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium border outline-none transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">Toutes les villes</option>
                  {availableVilles.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>

              {/* Filtre par Matière */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-400">Matière</label>
                <select
                  value={filterMatiere}
                  onChange={(e) => setFilterMatiere(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium border outline-none transition capitalize ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">Toutes les matières</option>
                  {availableMatieres.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              {/* Filtre par Niveau */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-400">Niveau</label>
                <select
                  value={filterNiveau}
                  onChange={(e) => setFilterNiveau(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-medium border outline-none transition capitalize ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="all">Tous les niveaux</option>
                  {availableNiveaux.map(niv => (
                    <option key={niv} value={niv}>{niv}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* TABLEAU DES DEMANDES (colonne de droite sur grand écran) */}
          <div className="lg:col-span-3">
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
                      <th className="py-4 px-6">Date et Heure</th>
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
                        <td colSpan={6} className="py-8 text-center text-slate-400">Aucun étudiant trouvé avec ces critères.</td>
                      </tr>
                    ) : (
                      filteredLeads.map((item) => {
                        const fullName = `${item.student_name || ''} ${item.student_family_name || ''}`.trim() || 'Étudiant';
                        const subjectsText = getMatchedSubjects(item);
                        const studentGrade = getStudentGrade(item);
                        const dateValue = item.lead_date || item.created_at;

                        const parsedDate = dateValue ? new Date(dateValue) : null;
                        const isValidDate = parsedDate && !isNaN(parsedDate.getTime());
                        const hasTime = isValidDate && (parsedDate.getHours() !== 0 || parsedDate.getMinutes() !== 0);

                        return (
                          <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                            <td className="py-4 px-6 font-bold flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 font-black flex items-center justify-center shrink-0">
                                {fullName[0] || 'E'}
                              </div>
                              <div>
                                <span className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>{fullName}</span>
                                {item.student_ville && (
                                  <p className="text-[10px] text-slate-400 font-normal">{item.student_ville}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-medium">
                              <span className="bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-lg border border-orange-500/20 font-semibold capitalize">
                                {subjectsText}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-medium capitalize">
                              {studentGrade ? (
                                <span className={`px-2.5 py-1 rounded-lg border font-semibold ${isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                  {studentGrade}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
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
                            
                            <td className="py-4 px-6">
                              {isValidDate ? (
                                <div className="space-y-0.5">
                                  <div className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                                    <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                    {parsedDate.toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  {hasTime && (
                                    <div className={`text-[11px] font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                      <Clock className="w-3 h-3 text-orange-400 shrink-0" />
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