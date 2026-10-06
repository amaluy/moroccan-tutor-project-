'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { 
  Clock, CheckCircle2, Moon, Sun, 
  MessageSquare, ExternalLink, X, Phone, Mail, BookOpen
} from 'lucide-react';

interface StudentRequest {
  id: string | number;
  student_name?: string;
  email?: string;
  telephone?: string;
  matiere?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  details?: string;
}

export default function GestionDemandePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>('accepted');
  const [profName, setProfName] = useState('sami el idrissi');
  const [profImage, setProfImage] = useState('');
  const [loading, setLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('prof_theme') === 'dark';
    }
    return false;
  });

  const [selectedStudent, setSelectedStudent] = useState<StudentRequest | null>(null);

  // Exemple de données pour les tableaux (Étudiants acceptés et Demandes en attente)
  const [students] = useState<StudentRequest[]>([
    {
      id: 1,
      student_name: 'Amal Benjelloun',
      email: 'amal.ben@gmail.com',
      telephone: '+212 6 00 00 00 00',
      matiere: 'Mathématiques / Cours particulier',
      status: 'accepted',
      created_at: '2026-10-04',
      details: 'Élève motivée en 2ème année Bac, souhaite renforcer ses acquis en analyse et probabilités.'
    },
    {
      id: 2,
      student_name: 'Mehdi Alami',
      email: 'mehdi.alami@outlook.com',
      telephone: '+212 6 11 22 33 44',
      matiere: 'Physique-Chimie',
      status: 'pending',
      created_at: '2026-10-06',
      details: 'Demande un accompagnement hebdomadaire de 2h en électricité et mécanique.'
    }
  ]);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('prof_theme', nextMode ? 'dark' : 'light');
  };

  useEffect(() => {
    async function fetchProfInfo() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const storedId = localStorage.getItem('professor_id') || localStorage.getItem('user_id');
        const rawEmail = user?.email || localStorage.getItem('professor_email');

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
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfInfo();
  }, []);

  const acceptedStudents = students.filter(s => s.status === 'accepted');
  const pendingStudents = students.filter(s => s.status === 'pending');

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'bg-[#0A0A0A] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* --- NAVBAR --- */}
      <header className={`sticky top-0 z-40 border-b px-6 py-3 flex items-center justify-between transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0A0A0A]/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
      }`}>
        {/* Espace vide à gauche puisque les liens ont été retirés */}
        <div></div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profil simple sans menu déroulant */}
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
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Gestion des Demandes & Élèves</h1>
            <p className="text-xs text-slate-400 mt-1">Tableau de suivi des étudiants engagés et des requêtes en attente.</p>
          </div>

          <div className={`flex p-1.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'accepted' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Étudiants Acceptés ({acceptedStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'pending' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Demandes en attente ({pendingStudents.length})</span>
            </button>
          </div>
        </div>

        <div className={`rounded-3xl border overflow-hidden shadow-xl ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider font-extrabold ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <th className="py-4 px-6">Nom de l&apos;étudiant</th>
                  <th className="py-4 px-6">Matière / Cours</th>
                  <th className="py-4 px-6">Statut / Engagement</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Fiche Profil Résumé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30 text-xs">
                {(activeTab === 'accepted' ? acceptedStudents : pendingStudents).map((item) => (
                  <tr key={item.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="py-4 px-6 font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 font-black flex items-center justify-center">
                        {item.student_name?.[0]}
                      </div>
                      <span>{item.student_name}</span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-400">{item.matiere}</td>
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
                    <td className="py-4 px-6 text-slate-400">{item.created_at}</td>
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
                ))}
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
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                {selectedStudent.student_name?.[0]}
              </div>
              <div>
                <h3 className="text-lg font-black">{selectedStudent.student_name}</h3>
                <p className="text-xs text-orange-500 font-bold">{selectedStudent.matiere}</p>
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
                <p className="leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 w-full">
                  {selectedStudent.details || 'Aucun détail supplémentaire.'}
                </p>
              </div>
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