export type EventKey = 'wedding' | 'birthday' | 'puberty' | 'housewarming' | 'gettogether';

export type ServiceIcon = 'venue' | 'catering' | 'decor' | 'photo' | 'music' | 'transport';

export interface ServiceItem {
  id: ServiceIcon;
  name: string;
  desc: string;
  emotionLine: string;
  marketTip: string;
  appliesTo: EventKey[];
  tags?: string[];
  providerCount?: number;
}

export const CATEGORIES: ServiceItem[] = [
  {
    id: 'venue',
    name: 'Venue / Hall',
    desc: 'Spaces for gatherings & ceremonies.',
    emotionLine: 'Your venue sets the scene guests remember first.',
    marketTip: 'Popular halls book 3-6 months early; 30-50% deposit is common.',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Book early', 'Deposit required'],
  },
  {
    id: 'catering',
    name: 'Catering',
    desc: 'Chefs & menus for every milestone.',
    emotionLine: 'Flavors that turn moments into memories.',
    marketTip: 'Minimum guest counts apply; finalize menu 2–3 weeks prior.',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Min guests', 'Advance order'],
  },
  {
    id: 'decor',
    name: 'Decoration & Floral',
    desc: 'Ambience, florals & stage design.',
    emotionLine: 'Decor sets the tone the moment guests arrive.',
    marketTip: 'Prime dates are limited; site visit recommended.',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
  },
  {
    id: 'photo',
    name: 'Photography & Video',
    desc: 'Candid + cinematic coverage.',
    emotionLine: 'Every smile, every spark - preserved beautifully.',
    marketTip: 'Studios typically take one event per day - lock dates early.',
    appliesTo: ['wedding', 'birthday', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Limited dates', 'Deposit'],
  },
  {
    id: 'music',
    name: 'Music / DJ / Band',
    desc: 'Energy, rhythm & mood.',
    emotionLine: 'Music carries the energy of your celebration.',
    marketTip: 'Sound checks & venue rules apply; plan power backup.',
    appliesTo: ['wedding', 'birthday', 'gettogether', 'housewarming'],
  },
  {
    id: 'transport',
    name: 'Transportation',
    desc: 'Decorated cars, vans, buses.',
    emotionLine: 'Arrive in style; depart with smiles.',
    marketTip: 'Schedule drivers & permits; décor timings matter.',
    appliesTo: ['wedding', 'puberty', 'gettogether', 'housewarming'],
    tags: ['Book 1+ week ahead'],
  },
];
