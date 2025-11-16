export interface EventCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  providersCount: number;
  servicesCount: number;
  reviewsCount: number;
  faqsCount: number;
  galleriesCount: number;
  // optional fields populated from backend
  seasonPreference?: string;
  minBudget?: number;
  maxBudget?: number;
  sortOrder?: number;
}

export const EVENT_CATEGORIES: EventCategory[] = [
  {
    id: 'wedding-christian',
    title: 'Wedding — Christian',
    description:
      'Elegant church ceremonies and refined receptions with timeless florals, choirs, and classic white-gold palettes.',
    image:
      '/Events/Andrew-Trinita-St+Georges+Cathedral-0345.webp',
    tags: ['Wedding', 'Christian'],
    providersCount: 128,
    servicesCount: 42,
    reviewsCount: 860,
    faqsCount: 18,
    galleriesCount: 95,
  },
  {
    id: 'wedding-hindu',
    title: 'Wedding — Hindu',
    description:
      'Vibrant mandap designs, traditional rituals, and immersive sangeet experiences with rich cultural artistry.',
        image:
          '/Events/0040-Tamil-Kathiresan-Hall-Wedding-anbujawahar-7071.webp',
    tags: ['Wedding', 'Hindu'],
    providersCount: 156,
    servicesCount: 58,
    reviewsCount: 1310,
    faqsCount: 22,
    galleriesCount: 110,
  },
  {
    id: 'birthday',
    title: 'Birthday Party',
    description:
      'From intimate dinners to themed milestones—custom decor, specialty cakes, and surprise entertainment.',
        image:
          '/Events/birthday.jpg',
    tags: ['Birthday'],
    providersCount: 94,
    servicesCount: 33,
    reviewsCount: 620,
    faqsCount: 15,
    galleriesCount: 72,
  },
  {
    id: 'housewarming',
    title: 'Housewarming',
    description:
      'Warm gatherings with curated catering, floral accents, and ambient lighting to bless new beginnings.',
    image:
      '/Events/house warming.jpg',
    tags: ['Housewarming'],
    providersCount: 66,
    servicesCount: 21,
    reviewsCount: 345,
    faqsCount: 12,
    galleriesCount: 48,
  },
  {
    id: 'puberty',
    title: 'Puberty Ceremony',
    description:
      'Graceful rites of passage with traditional customs, color themes, and family-focused hospitality.',
    image:
      '/Events/Puberty.webp',
    tags: ['Puberty'],
    providersCount: 58,
    servicesCount: 19,
    reviewsCount: 210,
    faqsCount: 10,
    galleriesCount: 35,
  },
  {
    id: 'gettogether',
    title: 'Get Together',
    description:
      'Corporate mixers or reunions—stylish lounges, curated playlists, and interactive live food stations.',
    image:
      '/Events/Get together.jpg',
    tags: ['GetTogether'],
    providersCount: 103,
    servicesCount: 27,
    reviewsCount: 420,
    faqsCount: 14,
    galleriesCount: 61,
  },
];
