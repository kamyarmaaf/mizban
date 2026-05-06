export interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  region: string;
  category: string;
  image: string;
  providerName: string;
  liked?: boolean;
  rating?: number;
  totalRatings?: number;
  createdAt?: Date;
  date: string;
  time: string;
  duration: string;
  is_favorited?: boolean;
}

export interface Booking {
  id: string;
  experienceTitle: string;
  experienceImage: string;
  date: string;
  status: 'confirmed' | 'pending' | 'completed';
  price: number;
  guestName?: string;
}

export interface Comment {
  id: string;
  experienceId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: Date;
}
