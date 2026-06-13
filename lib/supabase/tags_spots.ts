import { NewSpotTag } from "@/types";
import { supabase } from "@/utils/supabase";

export const tagsSpotsApi = {
    fetchTagsSpots: async (spotId: number): Promise<any[]> => {
        const { data, error } = await supabase
            .from("spot_tags")
            .select("*, tags:tags(*)")
            .eq("spot_id", spotId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    createTagsSpots: async (spotTagLinks: NewSpotTag[]): Promise<NewSpotTag[]> => {
        const { data, error } = await supabase
            .from("spot_tags")
            .insert(spotTagLinks)
            .select();

        if (error) throw error;
        return data || [];
    },

    deleteSpotTags: async (spotId: number): Promise<void> => {
        const { error } = await supabase
            .from("spot_tags")
            .delete()
            .eq("spot_id", spotId);

        if (error) throw error;
    },
}