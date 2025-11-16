export interface ProviderProfile {
  id: string;
  name: string;
  category: string;
  city: string;
  verified: boolean;
  rating: number;
  reviews: number;
  bannerUrl: string;
  about: string;
  story: string[];
  packages: ProviderPackage[];
  gallery: string[];
  testimonials: ProviderReview[];
  related: ProviderCard[];
}

export interface ProviderPackage {
  title: string;
  price: number;
  description: string;
  image: string;
}

export interface ProviderReview {
  user: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface ProviderCard {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
}

export interface CustomPackage {
  providerId: string;
  services: string[];
  notes: string;
  total: number;
  createdAt: string;
}
