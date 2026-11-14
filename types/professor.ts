export interface Professor {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  subject: string;
  city: string;
  price: number;
  bio: string;
  avatar_url: string | null;
  rating: number;
  total_reviews: number;
  is_approved: boolean;
  created_at: string;
  offers_free_trial?: boolean;
  is_online?: boolean;
}