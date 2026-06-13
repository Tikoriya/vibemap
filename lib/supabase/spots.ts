import { NewSpot, Spot } from "@/types";
import { supabase } from "@/utils/supabase";

export const spotsApi = {

    fetchSpots: async (cityId: number): Promise<Spot[]> => {
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
        .select("*, tags:tags(*)")
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
    updateSpot: async ({ spotId, updates }: { spotId: number; updates: Partial<Omit<Spot, 'id' | 'created_at'>> }): Promise<Spot> => {
        const { data, error } = await supabase
        .from("spots")
        .update(updates)
        .eq("id", spotId)
        .select()
        .single();

        if (error) throw error;
        return data;
    },

    deleteSpot: async (spotId: number): Promise<Spot> => {
        const { data, error } = await supabase
        .from("spots")
        .delete()
        .eq("id", spotId)
        .select()
        .single()

        if (error) throw error;
        return data || [];
    }
  // ...other spot API methods
};