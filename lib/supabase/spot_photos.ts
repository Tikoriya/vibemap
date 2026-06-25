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

  deletePhotos: async (ids: number[]): Promise<void> => {
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("spot_photos")
      .delete()
      .in("id", ids);
    if (error) throw error;
  },

  updatePositions: async (
    updates: { id: number; position: number }[],
  ): Promise<void> => {
    if (updates.length === 0) return;
    const results = await Promise.all(
      updates.map(({ id, position }) =>
        supabase.from("spot_photos").update({ position }).eq("id", id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  },
};
