import { Database } from "./supabase";

export type City = Database['public']['Tables']['cities']['Row'];
export type Spot = Database['public']['Tables']['spots']['Row'] & {tags?: Tag[]};
export type Tag = Database['public']['Tables']['tags']['Row'];

export type NewCity = Database['public']['Tables']['cities']['Insert'];
export type NewSpot = Database['public']['Tables']['spots']['Insert'];
export type NewTag = Database['public']['Tables']['tags']['Insert'];
export type NewSpotTag = Database['public']['Tables']['spot_tags']['Insert'];

