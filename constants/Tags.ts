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

export const TAG_COLORS: Record<TagCategory, string> = {
  cocktails: '#C4572A',
  coffee: '#8B5E3C',
  food: '#D4933A',
  fancy: '#8B6FAD',
  workFriendly: '#4A7C59',
  casual: '#5B7FA8',
  nightlife: '#2D3A5E',
  nature: '#5A7A4A',
  custom: '#8C8078',
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
