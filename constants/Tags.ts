export type TagCategory =
  | 'cocktails'
  | 'coffee'
  | 'food'
  | 'fancy'
  | 'workFriendly'
  | 'casual'
  | 'nightlife'
  | 'nature'
  | 'custom';

export type PredefinedTag = {
  id: string;
  label: string;
  category: TagCategory;
  color: string;
};

// Drawn from the Tukka design palette — forest / ochre / plum / semantic tones.
export const TAG_COLORS: Record<TagCategory, string> = {
  cocktails: '#6C3FD4', // plum
  coffee: '#C9912F', // ochre
  food: '#D9772E', // caution / warm
  fancy: '#3A4F44', // forest 600
  workFriendly: '#3F8A5F', // open / green
  casual: '#3A6FB0', // info / blue
  nightlife: '#1C2A23', // forest 800
  nature: '#6F8378', // sage 400
  custom: '#9AA096', // muted
};

export const PREDEFINED_TAGS: PredefinedTag[] = [
  { id: 'cocktails', label: 'Cocktails', category: 'cocktails', color: TAG_COLORS.cocktails },
  { id: 'wine-bar', label: 'Wine Bar', category: 'cocktails', color: TAG_COLORS.cocktails },
  { id: 'coffee', label: 'Coffee', category: 'coffee', color: TAG_COLORS.coffee },
  { id: 'specialty-coffee', label: 'Specialty Coffee', category: 'coffee', color: TAG_COLORS.coffee },
  { id: 'brunch', label: 'Brunch', category: 'food', color: TAG_COLORS.food },
  { id: 'dinner', label: 'Dinner', category: 'food', color: TAG_COLORS.food },
  { id: 'street-food', label: 'Street Food', category: 'food', color: TAG_COLORS.food },
  { id: 'fancy', label: 'Fancy', category: 'fancy', color: TAG_COLORS.fancy },
  { id: 'date-night', label: 'Date Night', category: 'fancy', color: TAG_COLORS.fancy },
  { id: 'work-friendly', label: 'Work-friendly', category: 'workFriendly', color: TAG_COLORS.workFriendly },
  { id: 'quiet', label: 'Quiet', category: 'workFriendly', color: TAG_COLORS.workFriendly },
  { id: 'casual', label: 'Casual', category: 'casual', color: TAG_COLORS.casual },
  { id: 'good-vibes', label: 'Good Vibes', category: 'casual', color: TAG_COLORS.casual },
  { id: 'nightlife', label: 'Nightlife', category: 'nightlife', color: TAG_COLORS.nightlife },
  { id: 'rooftop', label: 'Rooftop', category: 'nightlife', color: TAG_COLORS.nightlife },
  { id: 'nature', label: 'Nature', category: 'nature', color: TAG_COLORS.nature },
  { id: 'outdoor-seating', label: 'Outdoor Seating', category: 'nature', color: TAG_COLORS.nature },
];

export const getCategoryColor = (category: TagCategory): string =>
  TAG_COLORS[category] ?? TAG_COLORS.custom;
