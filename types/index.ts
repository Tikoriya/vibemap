import { Database } from "./supabase";

export type City = Database['public']['Tables']['cities']['Row'];
export type Spot = Database['public']['Tables']['spots']['Row'] & {
  tags?: Tag[];
  spot_photos?: Pick<SpotPhoto, 'url' | 'position'>[];
};
export type Tag = Database['public']['Tables']['tags']['Row'];
export type SpotPhoto = Database['public']['Tables']['spot_photos']['Row'];

// A spot hydrated with its joined tags and photos — the shape every list/card
// renders. Arrays are always present (possibly empty), unlike the loose Spot.
export type SpotWithTags = Spot & {
  tags: Tag[];
  spot_photos: Pick<SpotPhoto, 'url' | 'position'>[];
};

export type NewCity = Database['public']['Tables']['cities']['Insert'];
export type NewSpot = Database['public']['Tables']['spots']['Insert'];
export type NewTag = Database['public']['Tables']['tags']['Insert'];
export type NewSpotTag = Database['public']['Tables']['spot_tags']['Insert'];
export type NewSpotPhoto = Database['public']['Tables']['spot_photos']['Insert'];

export type CityWithCount = City & { spotCount: number };

