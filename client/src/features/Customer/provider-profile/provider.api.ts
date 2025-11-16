import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { ProviderProfile } from './models';

const PROVIDERS: ProviderProfile[] = [
  {
    id: 'lore-luxe',
    name: 'Lore & Luxe Experiences',
    category: 'Luxury Wedding Designers',
    city: 'Udaipur, Rajasthan',
    verified: true,
    rating: 4.9,
    reviews: 128,
    bannerUrl: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=1600&q=80',
    about:
      'We weave heritage and modern romance into immersive events that feel handcrafted just for you.',
    story: [
      'Started in 2014 inside a restored havelI, Lore & Luxe blends classical storytelling with cinematic lighting so every moment feels filmic.',
      'The team partners with choreographers, poet-servers, and heritage artisans to choreograph a sensory-rich narrative from day one.',
      'Their clients praise the calm foresight that keeps logistics invisible while vibrant custom details remain unforgettable.',
    ],
    packages: [
      {
        title: 'Luminous Heritage Affair',
        price: 1850000,
        description: 'Temple-worthy florals, curated live music, and a royal welcome for 250 guests.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Sunset Lakefront Soirée',
        price: 980000,
        description: 'Cinematic sunset walk, lakeside lounge, and a gourmet tasting that honors tradition.',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Intimate Pavilion Elopement',
        price: 420000,
        description: 'Private canopy, legacy rituals, and a storytelling film crew for the two of you.',
        image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506619216599-9d16f9c3f03e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1447433819943-74a20887a5c9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',
    ],
    testimonials: [
      {
        user: 'Anika & Rohit',
        date: 'June 2025',
        rating: 5,
        comment:
          'Lore & Luxe made every micro-moment feel reverent. Our guests still speak about the cascading lights and choreographed dances.',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
      },
      {
        user: 'Jasmine Kaur',
        date: 'April 2025',
        rating: 4.8,
        comment:
          'They listened to the stories of our family and translated them into ceremony beats and a palette that looked like dusk.',
        avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80',
      },
      {
        user: 'Dev & Meera',
        date: 'December 2024',
        rating: 4.9,
        comment:
          'From napkin folds to high-energy performances, every moment felt curated for our guests to feel cherished.',
        avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
      },
    ],
    related: [
      {
        id: 'celestial-veil',
        name: 'Celestial Veil Collective',
        category: 'Destination Decor',
        rating: 4.8,
        reviews: 84,
        image: 'https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'pavilion-poetry',
        name: 'Pavilion Poetry Studio',
        category: 'Artful Celebration',
        rating: 4.7,
        reviews: 67,
        image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'golden-anthem',
        name: 'Golden Anthem Experiences',
        category: 'Luxury Sound & Stage',
        rating: 4.85,
        reviews: 91,
        image: 'https://images.unsplash.com/photo-1484510629038-5c9ba0cc0b79?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
  {
    id: 'celestial-veil',
    name: 'Celestial Veil Collective',
    category: 'Destination Decor',
    city: 'Jaipur, Rajasthan',
    verified: true,
    rating: 4.8,
    reviews: 84,
    bannerUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    about: 'We sculpt dreamscapes for destination celebrations with artisan florals and immersive lighting.',
    story: [
      'Founded by set designers, Celestial Veil translates folklore into sculpted spaces that glow at dusk.',
      'Their team travels with curated wardrobes, light cues, and scent designers so every canopy feels alive.',
    ],
    packages: [
      {
        title: 'Bloom Cascade Edition',
        price: 920000,
        description: '9000 hand-wrapped blooms, satin drapes, and kinetic light choreography.',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Vibrant Courtyard Narrative',
        price: 610000,
        description: 'Courtyard transformation with brass finials, mirrored floors, and live painting.',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
    ],
    testimonials: [
      {
        user: 'Rhea & Arjun',
        date: 'May 2025',
        rating: 4.9,
        comment:
          'The stage looked like a storybook cover. Guests kept saying it felt like moonlight indoors.',
        avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80',
      },
    ],
    related: [
      {
        id: 'lore-luxe',
        name: 'Lore & Luxe Experiences',
        category: 'Luxury Wedding Designers',
        rating: 4.9,
        reviews: 128,
        image: 'https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'opal-chant',
        name: 'Opal Chant Collective',
        category: 'Boutique Planning',
        rating: 4.75,
        reviews: 58,
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProviderProfileApi {
  private readonly providers = PROVIDERS;

  getProviderById(id: string): Observable<ProviderProfile | undefined> {
    const match = this.providers.find((provider) => provider.id === id);
    return of(match).pipe(delay(300));
  }

  getProviders(): Observable<ProviderProfile[]> {
    return of(this.providers).pipe(delay(300));
  }
}
