
import { ProviderCard, ServiceCategory } from './models';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const MOCK_PROVIDERS: ProviderCard[] = [
  {
    id: 'venue-saffron',
    category: 'venue',
    name: 'Saffron Ballroom',
    tagline: 'Intimate chandeliers & heritage ceilings.',
    city: 'Jaipur',
    rating: 4.8,
    reviews: 92,
    verified: true,
    priceMin: 180000,
    priceMax: 450000,
    coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    tags: ['Verified', 'Indoor']
  },
  {
    id: 'venue-ivory',
    category: 'venue',
    name: 'Ivory Oasis Hall',
    tagline: 'Sunlit lawns with marble courtyards.',
    city: 'Udaipur',
    rating: 4.6,
    reviews: 74,
    verified: true,
    priceMin: 220000,
    priceMax: 520000,
    coverUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
    tags: ['Outdoor Friendly']
  },
  {
    id: 'venue-moon',
    category: 'venue',
    name: 'Moonlit Pavilion',
    tagline: 'Private terraces with curated lighting.',
    city: 'Kolkata',
    rating: 4.5,
    reviews: 58,
    verified: false,
    priceMin: 140000,
    priceMax: 360000,
    coverUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80',
    tags: ['Rooftop']
  },
  {
    id: 'catering-aroma',
    category: 'catering',
    name: 'Aroma Catering',
    tagline: 'Heritage thalis and global banquets.',
    city: 'Mumbai',
    rating: 4.9,
    reviews: 150,
    verified: true,
    priceMin: 650,
    priceMax: 1850,
    coverUrl: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=1600&q=80',
    tags: ['Tasting Available', 'Verified']
  },
  {
    id: 'catering-nova',
    category: 'catering',
    name: 'Nova Feast Studio',
    tagline: 'Personalized menus with seasonal produce.',
    city: 'Bengaluru',
    rating: 4.7,
    reviews: 88,
    verified: true,
    priceMin: 520,
    priceMax: 1450,
    coverUrl: 'https://images.unsplash.com/photo-1528715471579-d1ba0c2038b8?auto=format&fit=crop&w=1600&q=80',
    tags: ['Plant-forward', 'Verified']
  },
  {
    id: 'catering-ginger',
    category: 'catering',
    name: 'Ginger Pearl Kitchens',
    tagline: 'Legacy flavors with fine dining polish.',
    city: 'Hyderabad',
    rating: 4.4,
    reviews: 63,
    verified: false,
    priceMin: 480,
    priceMax: 1300,
    coverUrl: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80',
    tags: ['24/7 Team']
  },
  {
    id: 'decor-bloom',
    category: 'decor',
    name: 'Bloom Atelier',
    tagline: 'Sculpted florals and luminous drapes.',
    city: 'Pune',
    rating: 4.9,
    reviews: 77,
    verified: true,
    priceMin: 95000,
    priceMax: 260000,
    coverUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80',
    tags: ['Custom Installations']
  },
  {
    id: 'decor-saffron',
    category: 'decor',
    name: 'Saffron Petals Studio',
    tagline: 'Mood lighting layered with silk.',
    city: 'Chennai',
    rating: 4.6,
    reviews: 68,
    verified: false,
    priceMin: 88000,
    priceMax: 210000,
    coverUrl: 'https://images.unsplash.com/photo-1449247709967-d6b0c5f0bba3?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'photo-vista',
    category: 'photo',
    name: 'Vista & Co. Stories',
    tagline: 'Cinematic films & candid portraits.',
    city: 'Delhi',
    rating: 5,
    reviews: 110,
    verified: true,
    priceMin: 95000,
    priceMax: 255000,
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    tags: ['Film', 'Digital']
  },
  {
    id: 'photo-lens',
    category: 'photo',
    name: 'Golden Lens Collective',
    tagline: 'Editorial wedding edits with glow.',
    city: 'Ahmedabad',
    rating: 4.7,
    reviews: 64,
    verified: true,
    priceMin: 75000,
    priceMax: 210000,
    coverUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'music-raga',
    category: 'music',
    name: 'Raga Evenings',
    tagline: 'Bhavaful sets and DJ lounges.',
    city: 'Kochi',
    rating: 4.6,
    reviews: 59,
    verified: true,
    priceMin: 45000,
    priceMax: 130000,
    coverUrl: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'music-pulse',
    category: 'music',
    name: 'Pulse & Sitar',
    tagline: 'Fusion live band and DJ pairings.',
    city: 'Bhubaneswar',
    rating: 4.3,
    reviews: 41,
    verified: false,
    priceMin: 32000,
    priceMax: 90000,
    coverUrl: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'transport-luxe',
    category: 'transport',
    name: 'Luxe Chariot Fleet',
    tagline: 'Heritage cars with coordinated chauffeurs.',
    city: 'Goa',
    rating: 4.7,
    reviews: 73,
    verified: true,
    priceMin: 55000,
    priceMax: 120000,
    coverUrl: 'https://images.unsplash.com/photo-1434389677660-2fdb5d29d65a?auto=format&fit=crop&w=1600&q=80',
    tags: ['Logistics Support']
  },
  {
    id: 'transport-ray',
    category: 'transport',
    name: 'Ray of Roads',
    tagline: 'Decorated Volvo & tempo services.',
    city: 'Chandigarh',
    rating: 4.4,
    reviews: 38,
    verified: false,
    priceMin: 42000,
    priceMax: 98000,
    coverUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80'
  }
];

export function fetchProvidersByCategory(category: ServiceCategory): Observable<ProviderCard[]> {
  const filtered = MOCK_PROVIDERS.filter((provider) => provider.category === category);
  return of(filtered).pipe(delay(250));
}
