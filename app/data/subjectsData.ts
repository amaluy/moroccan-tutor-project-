import { 
  Calculator, Atom, Dna, BookOpen, Languages, Globe, GraduationCap, Zap 
} from 'lucide-react';

export const detailedSubjects = [
  {
    id: 'maths',
    name: 'Mathématiques',
    category: 'Sciences Exactes',
    icon: Calculator,
    description: 'Algèbre, géométrie, analyse, probabilités et préparation intensive aux examens du Régional et du National.',
    levels: ['Collège', 'Lycée', 'Bac Biof', 'Classes Prépa', 'Universitaire'],
    badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    iconBg: 'bg-indigo-500'
  },
  {
    id: 'physique-chimie',
    name: 'Physique - Chimie',
    category: 'Sciences Physiques',
    icon: Atom,
    description: 'Mécanique, électricité, chimie organique et solutions aqueuses avec résolutions d’exercices types BAC.',
    levels: ['Collège', 'Lycée (SM / PC / SVT)', 'Supérieur'],
    badgeColor: 'bg-amber-50 text-amber-600 border-amber-100',
    iconBg: 'bg-amber-500'
  },
  {
    id: 'svt',
    name: 'SVT (Sciences de la Vie et de la Terre)',
    category: 'Sciences Naturelles',
    icon: Dna,
    description: 'Génétique, immunologie, géologie et écologie expliquées de façon schématique et pédagogique.',
    levels: ['Collège', 'Lycée (SVT / PC)', 'Faculté'],
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconBg: 'bg-emerald-500'
  },
  {
    id: 'francais',
    name: 'Français & Langue',
    category: 'Langues & Littérature',
    icon: BookOpen,
    description: 'Étude d’œuvres littéraires, production écrite, méthodologie de la synthèse et préparation au Régional 1ère Année Bac.',
    levels: ['Primaire', 'Collège', '1ère BAC (Régional)', 'Communication'],
    badgeColor: 'bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/20',
    iconBg: 'bg-[#FF5A5F]'
  },
  {
    id: 'anglais',
    name: 'Anglais',
    category: 'Langues Vivantes',
    icon: Languages,
    description: 'Grammaire, vocabulaire, expression orale, préparation au TOEFL/IELTS et soutien du programme national.',
    levels: ['Tous niveaux', 'Business English', 'Soutien Scolaire'],
    badgeColor: 'bg-sky-50 text-sky-600 border-sky-100',
    iconBg: 'bg-sky-500'
  },
  {
    id: 'arabe',
    name: 'Arabe & Éducation Islamique',
    category: 'Langues & Humaines',
    icon: Globe,
    description: 'Grammaire (Nahw/Sarf), analyse de textes littéraires et consolidation des bases pour le brevet et le bac.',
    levels: ['Primaire', 'Collège', 'Lycée'],
    badgeColor: 'bg-teal-50 text-teal-600 border-teal-100',
    iconBg: 'bg-teal-500'
  },
  {
    id: 'soutien-general',
    name: 'Soutien Scolaire Global',
    category: 'Accompagnement',
    icon: GraduationCap,
    description: 'Aide aux devoirs, méthodologie de travail, organisation et suivi hebdomadaire multidisciplinaire pour les plus jeunes.',
    levels: ['Primaire', 'Collège'],
    badgeColor: 'bg-purple-50 text-purple-600 border-purple-100',
    iconBg: 'bg-purple-500'
  }
];

export const subjectsData = [
  { name: 'Maths', icon: Calculator },
  { name: 'Anglais', icon: Languages },
  { name: 'Français', icon: BookOpen },
  { name: 'Arabe', icon: Globe },
  { name: 'Soutien scolaire', icon: GraduationCap },
  { name: 'SVT', icon: Dna },
  { name: 'Physique', icon: Zap },
  { name: 'Physique - Chimie', icon: Atom },
];