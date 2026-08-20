export interface Step {
  number: number;
  title: string;
  description: string;
  borderColor: string;
  numberBg: string;
}

export interface AdvantageItem {
  text: string;
  highlightedText?: string;
  postText?: string;
}

export interface TargetGroupInfo {
  title: string;
  titleColorClass: string;
  iconColorClass: string;
  features: string[];
}

export const stepsData: Step[] = [
  {
    number: 1,
    title: 'Trouvez un Prof',
    description: 'Explorez notre annuaire de professeurs qualifiés et choisissez celui qui correspond à vos besoins académiques.',
    borderColor: 'border-t-[#4338CA]',
    numberBg: 'bg-[#4338CA]'
  },
  {
    number: 2,
    title: 'Rejoignez un Groupe',
    description: "Intégrez un groupe d'étude collaboratif avec d'autres élèves partageant les mêmes objectifs académiques.",
    borderColor: 'border-t-[#EC4899]',
    numberBg: 'bg-[#F59E0B]'
  },
  {
    number: 3,
    title: 'Collaborez et Progressez',
    description: "Participez aux discussions, partagez des ressources et bénéficiez d'un accompagnement personnalisé pour réussir.",
    borderColor: 'border-t-[#4338CA]',
    numberBg: 'bg-[#4338CA]'
  }
];

export const studentFeatures: TargetGroupInfo = {
  title: 'Pour les Étudiants',
  titleColorClass: 'text-[#4338CA]',
  iconColorClass: 'text-[#4338CA]',
  features: [
    "Accédez à des groupes d'étude pour tous les niveaux scolaires",
    'Parcourez les profils détaillés des professeurs pour faire le meilleur choix',
    'Participez aux discussions et partagez des ressources avec d\'autres élèves',
    'Consultez les annonces importantes et les sessions à venir'
  ]
};

export const teacherFeatures: TargetGroupInfo = {
  title: 'Pour les Professeurs',
  titleColorClass: 'text-gray-900',
  iconColorClass: 'text-gray-900',
  features: [
    'Créez votre profil détaillé avec votre biographie, spécialités et expérience',
    "Formez des groupes d'étude adaptés aux besoins de vos élèves",
    'Partagez du contenu pédagogique et communiquez facilement avec vos élèves',
    "Suivez l'engagement et les progrès de vos groupes via un tableau de bord"
  ]
};