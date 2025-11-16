export type ServiceCategory = 'venue' | 'catering' | 'decor' | 'photo' | 'music' | 'transport';

export interface ProviderCard {
  id: string;
  category: ServiceCategory;
  name: string;
  tagline: string;
  city: string;
  rating: number;
  reviews: number;
  verified: boolean;
  priceMin: number;
  priceMax: number;
  coverUrl: string;
  tags?: string[];
}
