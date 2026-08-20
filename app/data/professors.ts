

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
  avatarUrl?: string;
  avatarInitial?: string;
}

export interface ProfessorDetail {
  id: string;
  full_name: string;
  avatar_url?: string;
  title: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  responseTime: string;
  studentsCount: string;
  badge?: string;
  badgeDescription?: string;
  subjects: string[];
  locations: string[];
  bio: string;
  reviews: Review[];
}

export const fontDataProfessors: Record<string, ProfessorDetail> = {
  '1': {
    id: '1',
    full_name: 'Fatima El Idrissi',
    avatar_url: '', // Laisse vide si pas encore d'image
    title: 'Doctorante en physique à l\'Université Mohammed V. Cours de soutien universitaire et préparation aux examens !',
    rating: 4.9,
    reviewsCount: 18,
    hourlyRate: 250,
    responseTime: '1h',
    studentsCount: '25+',
    badge: 'Professeure Certifiée',
    badgeDescription: 'Doctorante avec une solide expérience académique. Accompagnement rigoureux et suivi personnalisé en Physique-Chimie.',
    subjects: ['Physique', 'Chimie', 'Thermodynamique', 'Mécanique', 'Soutien Universitaire'],
    locations: ['Rabat (Face à face)', 'Webcam / En ligne'],
    bio: `Doctorante en Physique à l'Université Mohammed V de Rabat, j'accompagne les étudiants du secondaire et du supérieur pour surmonter leurs difficultés en sciences physiques.

Mes engagements :
- Explication claire des concepts théoriques fondamentaux.
- Résolution méthodique des exercices typiques d'examens et concours.
- Conseils méthodologiques pour structurer le travail personnel.`,
    reviews: [
      {
        id: 'r1',
        name: 'Karim',
        date: '12/08/2026',
        rating: 5,
        comment: 'Excellente pédagogue, grâce à Fatima j\'ai pu valider mon semestre de physique avec mention !',
        avatarInitial: 'K'
      }
    ]
  },
  '2': {
    id: '2',
    full_name: 'Youssef Tazi',
    avatar_url: '',
    title: 'Professeur d\'anglais certifié. Préparation aux examens IELTS, TOEFL et communication professionnelle.',
    rating: 4.7,
    reviewsCount: 31,
    hourlyRate: 180,
    responseTime: '2h',
    studentsCount: '40+',
    badge: 'Superprof Certifié',
    badgeDescription: 'Professeur natif ou certifié avec une approche immersive axée sur la pratique orale et écrite.',
    subjects: ['Anglais', 'IELTS', 'TOEFL', 'Business English', 'Expression orale'],
    locations: ['En ligne uniquement (Webcam)'],
    bio: `Professeur d'anglais expérimenté, spécialisé dans la préparation intensive aux certifications internationales (IELTS/TOEFL) et le perfectionnement oral pour étudiants et professionnels.`,
    reviews: [
      {
        id: 'r2',
        name: 'Sara',
        date: '02/08/2026',
        rating: 5,
        comment: 'J\'ai obtenu 7.5 au TOEFL grâce au programme intensif de Youssef. Très pro !',
        avatarInitial: 'S'
      }
    ]
  },
  '3': {
    id: '3',
    full_name: 'Ahmed Benjelloun',
    avatar_url: '',
    title: 'Professeur de mathématiques avec 10 ans d\'expérience. Spécialiste du baccalauréat et des classes prépas.',
    rating: 4.8,
    reviewsCount: 24,
    hourlyRate: 200,
    responseTime: '4h',
    studentsCount: '60+',
    badge: 'Ambassadeur',
    badgeDescription: 'Enseignant expérimenté ayant préparé plus de 10 promotions au Baccalauréat et concours d\'ingénieurs.',
    subjects: ['Mathématiques', 'Analyse', 'Algèbre', 'Prépa Concours', 'Baccalauréat'],
    locations: ['Casablanca (Face à face)', 'Webcam'],
    bio: `Professeur passionné par l'enseignement des mathématiques avec plus de 10 ans d'expérience. Ma méthode est basée sur la rigueur, l'entraînement intensif sur des sujets d'examens et la gestion du stress.`,
    reviews: [
      {
        id: 'r3',
        name: 'Omar',
        date: '28/07/2026',
        rating: 5,
        comment: 'Très bon professeur, très patient avec des explications lumineuses.',
        avatarInitial: 'O'
      }
    ]
  }
};