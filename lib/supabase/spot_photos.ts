import { NewSpotPhoto, SpotPhoto } from "@/types";
import { supabase } from "@/utils/supabase";

export const spotPhotosApi = {
  fetchForSpot: async (spotId: number): Promise<SpotPhoto[]> => {
    const { data, error } = await supabase
      .from("spot_photos")
      .select("*")
      .eq("spot_id", spotId)
      .order("position", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  insertPhotos: async (rows: NewSpotPhoto[]): Promise<void> => {
    const { error } = await supabase.from("spot_photos").insert(rows);
    if (error) throw error;
  },

  deleteForSpot: async (spotId: number): Promise<void> => {
    const { error } = await supabase
      .from("spot_photos")
      .delete()
      .eq("spot_id", spotId);
    if (error) throw error;
  },
};
