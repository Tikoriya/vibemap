import { NewSpot, Spot } from "@/types";
import { supabase } from "@/utils/supabase";

export const spotsApi = {

    fetchSpots: async (cityId: number): Promise<Spot[]> => {
        console.log("FETCHING SPOTS");
        const { data, error } = await supabase
        .from("spots")
        .select("*, tags:tags(*)")
        .eq("city_id", cityId)
        .order("created_at", { ascending: false });
    
        if (error) throw error;
        return data || [];
    },

    getSpot: async (spotId: number): Promise<Spot | null> => {
        const { data, error } = await supabase
        .from("spots")
        .select("*")
        .eq("id", spotId)
        .single();
        if (error) return null;
        return data as Spot;
    },

    createSpot: async (spot: NewSpot): Promise<Spot> => {
        const { data, error } = await supabase
        .from("spots")
        .insert([spot])
        .select()
        .single()

        if (error) throw error;
        return data || [];
    },

    addTagsToSpot: async (spotId: number, tagIds: number[]): Promise<void> => {
        const { error } = await supabase
        .from("spot_tags")
        .insert(
            tagIds.map((tagId) => ({
            spot_id: spotId,
            tag_id: tagId,
            }))
        );
        if (error) throw error;
    },
  // ...other spot API methods
};